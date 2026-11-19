/**
 * Phase D payment-failure state machine.
 *
 * past_due → grace → suspended (after configurable grace, default 5 days)
 * ACH PaymentIntent status "processing" is NOT a failure.
 * Cancellation is separate from failure — do not reactivate canceled on old invoice pay.
 * Codex S2S is notified only on suspend / restore (active↔suspended), not on enter-grace.
 */

import type Stripe from "stripe";
import { db } from "./admin";
import {
  COLLECTIONS,
  LocalBillingAccessState,
  SubscriptionDoc,
  SubscriptionStatus,
  BillingFailurePolicyDoc,
} from "../types/models";
import type { BillingAccessState } from "../s2s/codexBilling";
import { notifyProjectBillingAccess } from "../s2s/notifyProjectAccess";
import {
  isGraceExpired,
  loadBillingFailurePolicy,
} from "./billingPolicy";
import { mapPaymentMethodType } from "./stripeSync";
import { emailForSubscriptionEvent } from "../email/sendTransactional";

export type BillingTransitionAction =
  | "none"
  | "enter_grace"
  | "suspend"
  | "reactivate"
  | "mark_canceled"
  | "keep_canceled";

export interface BillingTransitionDecision {
  action: BillingTransitionAction;
  nextLocalState: LocalBillingAccessState;
  /** Codex access to notify, if any. */
  notifyAccessState: BillingAccessState | null;
  reason: string;
}

export interface SubscriptionBillingSnapshot {
  id: string;
  clientId: string;
  projectId: string | null;
  status: SubscriptionStatus;
  localAccessState: LocalBillingAccessState;
  graceStartedAt: Date | null;
  suspendedAt: Date | null;
  canceledAt: Date | null;
  lastAccessNotifyState: BillingAccessState | null;
  stripeSubscriptionId: string | null;
}

function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as { toDate: () => Date }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate();
  }
  if (typeof value === "string" || typeof value === "number") {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

export function normalizeLocalAccessState(
  raw: unknown,
  stripeStatus: SubscriptionStatus
): LocalBillingAccessState {
  if (
    raw === "active" ||
    raw === "grace" ||
    raw === "suspended" ||
    raw === "canceled"
  ) {
    return raw;
  }
  // Legacy docs (Phase C): infer from Stripe status.
  if (stripeStatus === "canceled") return "canceled";
  if (stripeStatus === "past_due" || stripeStatus === "unpaid") {
    return "grace";
  }
  if (stripeStatus === "active" || stripeStatus === "trialing") return "active";
  return "active";
}

export function snapshotFromSubscriptionDoc(
  id: string,
  data: Partial<SubscriptionDoc> & Record<string, unknown>
): SubscriptionBillingSnapshot {
  const status = (data.status as SubscriptionStatus) ?? "incomplete";
  return {
    id,
    clientId: String(data.clientId ?? ""),
    projectId:
      typeof data.projectId === "string" ? data.projectId : null,
    status,
    localAccessState: normalizeLocalAccessState(
      data.localAccessState,
      status
    ),
    graceStartedAt: toDate(data.graceStartedAt),
    suspendedAt: toDate(data.suspendedAt),
    canceledAt: toDate(data.canceledAt),
    lastAccessNotifyState:
      data.lastAccessNotifyState === "active" ||
      data.lastAccessNotifyState === "suspended"
        ? data.lastAccessNotifyState
        : null,
    stripeSubscriptionId:
      typeof data.stripeSubscriptionId === "string"
        ? data.stripeSubscriptionId
        : null,
  };
}

/**
 * ACH (or other bank) PaymentIntent still settling — not a failure.
 */
export function isAchProcessingPayment(
  paymentIntent: Pick<Stripe.PaymentIntent, "status" | "payment_method"> | null | undefined
): boolean {
  if (!paymentIntent) return false;
  if (paymentIntent.status !== "processing") return false;

  const pm = paymentIntent.payment_method;
  if (typeof pm === "object" && pm && "type" in pm) {
    const mapped = mapPaymentMethodType(
      (pm as Stripe.PaymentMethod).type
    );
    return mapped === "ach";
  }
  // Without expanded PM, treat processing as non-failure (conservative).
  return true;
}

export function isFailureStatus(status: SubscriptionStatus): boolean {
  return status === "past_due" || status === "unpaid";
}

export function isHealthyStatus(status: SubscriptionStatus): boolean {
  return status === "active" || status === "trialing";
}

/**
 * Pure decision: given current local state + new Stripe status + policy + clock.
 * Cancellation never reactivates via healthy status alone if already canceled
 * unless Stripe itself is no longer canceled AND caller opts in — we require
 * Stripe status healthy AND local not canceled for reactivate.
 * If local is canceled, stay canceled even if an old invoice pays (Stripe may
 * briefly look healthy on a canceled sub's paid invoice — caller passes canceled).
 */
export function decideBillingTransition(input: {
  localAccessState: LocalBillingAccessState;
  stripeStatus: SubscriptionStatus;
  graceStartedAt: Date | null;
  policy: Pick<
    BillingFailurePolicyDoc,
    "gracePeriodDays" | "autoSuspend" | "autoReactivate"
  >;
  now?: Date;
  /** When true, skip enter_grace / suspend from failure (ACH still processing). */
  achProcessing?: boolean;
}): BillingTransitionDecision {
  const now = input.now ?? new Date();
  const { localAccessState, stripeStatus, policy } = input;

  // Terminal cancel path — separate from payment failure.
  if (stripeStatus === "canceled") {
    if (localAccessState === "canceled") {
      return {
        action: "keep_canceled",
        nextLocalState: "canceled",
        notifyAccessState: null,
        reason: "already_canceled",
      };
    }
    return {
      action: "mark_canceled",
      nextLocalState: "canceled",
      notifyAccessState: "suspended",
      reason: "subscription_canceled",
    };
  }

  // Never reactivate a canceled subscription (e.g. old invoice.paid).
  if (localAccessState === "canceled") {
    return {
      action: "keep_canceled",
      nextLocalState: "canceled",
      notifyAccessState: null,
      reason: "canceled_ignore_payment",
    };
  }

  if (input.achProcessing && isFailureStatus(stripeStatus)) {
    return {
      action: "none",
      nextLocalState: localAccessState,
      notifyAccessState: null,
      reason: "ach_processing_not_failure",
    };
  }

  if (isHealthyStatus(stripeStatus)) {
    if (localAccessState === "active") {
      return {
        action: "none",
        nextLocalState: "active",
        notifyAccessState: null,
        reason: "already_active",
      };
    }
    if (
      (localAccessState === "grace" || localAccessState === "suspended") &&
      policy.autoReactivate
    ) {
      return {
        action: "reactivate",
        nextLocalState: "active",
        notifyAccessState: "active",
        reason: `restored_from_${localAccessState}`,
      };
    }
    if (!policy.autoReactivate) {
      return {
        action: "none",
        nextLocalState: localAccessState,
        notifyAccessState: null,
        reason: "auto_reactivate_disabled",
      };
    }
  }

  if (isFailureStatus(stripeStatus)) {
    if (localAccessState === "active") {
      return {
        action: "enter_grace",
        nextLocalState: "grace",
        notifyAccessState: null,
        reason: `enter_grace:${stripeStatus}`,
      };
    }

    if (localAccessState === "grace") {
      const started = input.graceStartedAt ?? now;
      if (
        policy.autoSuspend &&
        isGraceExpired(started, policy.gracePeriodDays, now)
      ) {
        return {
          action: "suspend",
          nextLocalState: "suspended",
          notifyAccessState: "suspended",
          reason: `grace_expired:${policy.gracePeriodDays}d`,
        };
      }
      return {
        action: "none",
        nextLocalState: "grace",
        notifyAccessState: null,
        reason: "in_grace",
      };
    }

    if (localAccessState === "suspended") {
      return {
        action: "none",
        nextLocalState: "suspended",
        notifyAccessState: null,
        reason: "already_suspended",
      };
    }
  }

  return {
    action: "none",
    nextLocalState: localAccessState,
    notifyAccessState: null,
    reason: `no_transition:${stripeStatus}`,
  };
}

export interface ApplyBillingTransitionResult {
  decision: BillingTransitionDecision;
  snapshot: SubscriptionBillingSnapshot;
  notified: boolean;
}

async function persistLocalAccessState(
  subscriptionId: string,
  decision: BillingTransitionDecision,
  now: Date
): Promise<void> {
  const patch: Record<string, unknown> = {
    localAccessState: decision.nextLocalState,
    updatedAt: now,
    lastFailureReason:
      decision.action === "enter_grace" || decision.action === "suspend"
        ? decision.reason
        : decision.action === "reactivate"
          ? null
          : undefined,
  };

  if (decision.action === "enter_grace") {
    patch.graceStartedAt = now;
    patch.suspendedAt = null;
  } else if (decision.action === "suspend") {
    patch.suspendedAt = now;
  } else if (decision.action === "reactivate") {
    patch.graceStartedAt = null;
    patch.suspendedAt = null;
    patch.canceledAt = null;
  } else if (decision.action === "mark_canceled") {
    patch.canceledAt = now;
    patch.graceStartedAt = null;
  }

  if (decision.notifyAccessState) {
    patch.lastAccessNotifyState = decision.notifyAccessState;
  }

  // Strip undefined so Firestore merge does not complain.
  for (const key of Object.keys(patch)) {
    if (patch[key] === undefined) delete patch[key];
  }

  await db()
    .collection(COLLECTIONS.subscriptions)
    .doc(subscriptionId)
    .set(patch, { merge: true });
}

/**
 * Apply state machine for a subscription after Stripe sync.
 * Notifies Codex only on suspend/restore transitions (Phase C helper).
 */
export async function applySubscriptionBillingTransition(input: {
  subscriptionId: string;
  previousStripeStatus: SubscriptionStatus | null;
  nextStripeStatus: SubscriptionStatus;
  achProcessing?: boolean;
  now?: Date;
  /** Skip S2S (e.g. unit tests / dry evaluation). */
  skipNotify?: boolean;
}): Promise<ApplyBillingTransitionResult> {
  const now = input.now ?? new Date();
  const ref = db().collection(COLLECTIONS.subscriptions).doc(input.subscriptionId);
  const snap = await ref.get();
  if (!snap.exists) {
    throw new Error(`Subscription ${input.subscriptionId} not found`);
  }

  const data = snap.data() as Partial<SubscriptionDoc> & Record<string, unknown>;
  const snapshot = snapshotFromSubscriptionDoc(snap.id, {
    ...data,
    status: input.nextStripeStatus,
  });
  const policy = await loadBillingFailurePolicy();

  const decision = decideBillingTransition({
    localAccessState: snapshot.localAccessState,
    stripeStatus: input.nextStripeStatus,
    graceStartedAt: snapshot.graceStartedAt,
    policy,
    now,
    achProcessing: input.achProcessing,
  });

  if (decision.action !== "none" && decision.action !== "keep_canceled") {
    await persistLocalAccessState(snapshot.id, decision, now);
  } else if (
    decision.action === "keep_canceled" &&
    snapshot.localAccessState !== "canceled"
  ) {
    await persistLocalAccessState(snapshot.id, decision, now);
  }

  let notified = false;
  if (
    decision.notifyAccessState &&
    !input.skipNotify &&
    snapshot.projectId
  ) {
    // Avoid duplicate Codex posts if we already notified the same access state.
    if (snapshot.lastAccessNotifyState !== decision.notifyAccessState) {
      try {
        const result = await notifyProjectBillingAccess({
          projectId: snapshot.projectId,
          accessState: decision.notifyAccessState,
          reason: decision.reason,
          subscriptionStatus: input.nextStripeStatus,
          eventId: `billing_access_${snapshot.id}_${decision.notifyAccessState}_${now.getTime()}`,
        });
        notified = result.notified > 0 || result.results.length > 0;
      } catch (err) {
        console.error(
          "[billingState] S2S notify failed:",
          err instanceof Error ? err.message : err
        );
      }
    }
  }

  // Transactional emails for grace / suspend / reactivate (not keep_canceled).
  if (
    !input.skipNotify &&
    (decision.action === "enter_grace" ||
      decision.action === "suspend" ||
      decision.action === "reactivate")
  ) {
    const kind =
      decision.action === "enter_grace"
        ? "grace"
        : decision.action === "suspend"
          ? "suspension"
          : "reactivation";
    const dedupeKey =
      decision.action === "enter_grace"
        ? `grace_${now.toISOString().slice(0, 10)}`
        : decision.action === "suspend"
          ? `suspend_${now.toISOString().slice(0, 10)}`
          : `reactivate_${now.toISOString().slice(0, 10)}`;
    try {
      await emailForSubscriptionEvent({
        kind,
        subscriptionId: snapshot.id,
        dedupeKey,
        gracePeriodDays: policy.gracePeriodDays,
      });
    } catch (err) {
      console.error(
        "[billingState] email failed:",
        err instanceof Error ? err.message : err
      );
    }
  }

  return {
    decision,
    snapshot: {
      ...snapshot,
      localAccessState: decision.nextLocalState,
      status: input.nextStripeStatus,
    },
    notified,
  };
}

/**
 * Evaluate grace expiry for subscriptions already in grace (scheduled reconcile).
 */
export async function evaluateGraceSubscriptions(
  now: Date = new Date()
): Promise<ApplyBillingTransitionResult[]> {
  const policy = await loadBillingFailurePolicy();
  if (!policy.autoSuspend) return [];

  const snap = await db()
    .collection(COLLECTIONS.subscriptions)
    .where("localAccessState", "==", "grace")
    .get();

  const results: ApplyBillingTransitionResult[] = [];
  for (const doc of snap.docs) {
    const data = doc.data() as Partial<SubscriptionDoc> & Record<string, unknown>;
    const snapshot = snapshotFromSubscriptionDoc(doc.id, data);
    if (!isFailureStatus(snapshot.status)) {
      // Stripe recovered but webhook lagged — attempt reactivate path.
      results.push(
        await applySubscriptionBillingTransition({
          subscriptionId: doc.id,
          previousStripeStatus: snapshot.status,
          nextStripeStatus: snapshot.status,
          now,
        })
      );
      continue;
    }
    results.push(
      await applySubscriptionBillingTransition({
        subscriptionId: doc.id,
        previousStripeStatus: snapshot.status,
        nextStripeStatus: snapshot.status,
        now,
      })
    );
  }
  return results;
}

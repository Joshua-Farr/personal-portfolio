/**
 * Configurable payment-failure policy (Phase D).
 * Defaults: 5-day grace, auto suspend / reactivate.
 * Override via Firestore `system/billingPolicy` and/or env.
 */

import { db } from "./admin";
import { COLLECTIONS, BillingFailurePolicyDoc } from "../types/models";

export const DEFAULT_BILLING_FAILURE_POLICY: BillingFailurePolicyDoc = {
  gracePeriodDays: 5,
  autoSuspend: true,
  autoReactivate: true,
  sendTransactionalEmail: true,
  reconcileIntervalHours: 1,
  updatedAt: new Date(0),
};

function parsePositiveInt(
  raw: string | undefined,
  fallback: number
): number {
  if (raw === undefined || raw === "") return fallback;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 0) return fallback;
  return n;
}

function parseBool(raw: string | undefined, fallback: boolean): boolean {
  if (raw === undefined || raw === "") return fallback;
  const v = raw.toLowerCase();
  if (v === "true" || v === "1" || v === "yes") return true;
  if (v === "false" || v === "0" || v === "no") return false;
  return fallback;
}

/** Env overrides applied on top of Firestore / defaults. */
export function policyFromEnv(
  base: BillingFailurePolicyDoc = DEFAULT_BILLING_FAILURE_POLICY
): BillingFailurePolicyDoc {
  return {
    gracePeriodDays: parsePositiveInt(
      process.env.BILLING_GRACE_PERIOD_DAYS,
      base.gracePeriodDays
    ),
    autoSuspend: parseBool(process.env.BILLING_AUTO_SUSPEND, base.autoSuspend),
    autoReactivate: parseBool(
      process.env.BILLING_AUTO_REACTIVATE,
      base.autoReactivate
    ),
    sendTransactionalEmail: parseBool(
      process.env.BILLING_SEND_TRANSACTIONAL_EMAIL,
      base.sendTransactionalEmail
    ),
    reconcileIntervalHours: parsePositiveInt(
      process.env.BILLING_RECONCILE_INTERVAL_HOURS,
      base.reconcileIntervalHours
    ),
    updatedAt: base.updatedAt,
  };
}

export async function loadBillingFailurePolicy(): Promise<BillingFailurePolicyDoc> {
  try {
    const snap = await db()
      .collection(COLLECTIONS.system)
      .doc("billingPolicy")
      .get();
    if (snap.exists) {
      const data = snap.data() as Partial<BillingFailurePolicyDoc>;
      const merged: BillingFailurePolicyDoc = {
        ...DEFAULT_BILLING_FAILURE_POLICY,
        ...data,
        gracePeriodDays:
          typeof data.gracePeriodDays === "number"
            ? data.gracePeriodDays
            : DEFAULT_BILLING_FAILURE_POLICY.gracePeriodDays,
        autoSuspend:
          typeof data.autoSuspend === "boolean"
            ? data.autoSuspend
            : DEFAULT_BILLING_FAILURE_POLICY.autoSuspend,
        autoReactivate:
          typeof data.autoReactivate === "boolean"
            ? data.autoReactivate
            : DEFAULT_BILLING_FAILURE_POLICY.autoReactivate,
        sendTransactionalEmail:
          typeof data.sendTransactionalEmail === "boolean"
            ? data.sendTransactionalEmail
            : DEFAULT_BILLING_FAILURE_POLICY.sendTransactionalEmail,
        reconcileIntervalHours:
          typeof data.reconcileIntervalHours === "number"
            ? data.reconcileIntervalHours
            : DEFAULT_BILLING_FAILURE_POLICY.reconcileIntervalHours,
        updatedAt: data.updatedAt ?? new Date(),
      };
      return policyFromEnv(merged);
    }
  } catch (err) {
    console.warn(
      "[billingPolicy] failed to read system/billingPolicy — using defaults:",
      err instanceof Error ? err.message : err
    );
  }
  return policyFromEnv(DEFAULT_BILLING_FAILURE_POLICY);
}

export function graceDeadlineMs(
  graceStartedAt: Date,
  gracePeriodDays: number
): number {
  return graceStartedAt.getTime() + gracePeriodDays * 24 * 60 * 60 * 1000;
}

export function isGraceExpired(
  graceStartedAt: Date,
  gracePeriodDays: number,
  now: Date = new Date()
): boolean {
  return now.getTime() >= graceDeadlineMs(graceStartedAt, gracePeriodDays);
}

/**
 * Phase D — scheduled reconciliation vs Stripe + grace expiry evaluation.
 *
 * Safety:
 * - Stripe test mode only (getStripe / sk_test_ guard)
 * - Codex S2S still respects BILLING_S2S_DRY_RUN (default true)
 * - Does not enable production Codex suspend by itself
 */

import { onSchedule } from "firebase-functions/v2/scheduler";
import { db, initBillingAdmin } from "../_shared/admin";
import { getStripe } from "../_shared/stripe";
import {
  applyBillingRuntimeEnv,
  billingS2sHmacSecret,
  resendApiKey,
  stripeSecretKey,
} from "../_shared/params";
import { COLLECTIONS, SubscriptionDoc } from "../types/models";
import { syncSubscriptionFromStripe } from "../_shared/stripeSync";
import {
  applySubscriptionBillingTransition,
  evaluateGraceSubscriptions,
  isAchProcessingPayment,
} from "../_shared/billingState";
import { loadBillingFailurePolicy } from "../_shared/billingPolicy";

async function reconcileOneSubscription(docId: string): Promise<{
  docId: string;
  ok: boolean;
  detail: string;
}> {
  const snap = await db().collection(COLLECTIONS.subscriptions).doc(docId).get();
  if (!snap.exists) {
    return { docId, ok: false, detail: "missing_doc" };
  }
  const data = snap.data() as SubscriptionDoc;
  const stripeSubId = data.stripeSubscriptionId;
  if (!stripeSubId) {
    return { docId, ok: true, detail: "no_stripe_id" };
  }

  const stripe = getStripe();
  const remote = await stripe.subscriptions.retrieve(stripeSubId, {
    expand: ["latest_invoice.payment_intent"],
  });

  const previousStatus = data.status;
  const sync = await syncSubscriptionFromStripe(remote);

  let achProcessing = false;
  const latestInvoice = remote.latest_invoice;
  if (
    latestInvoice &&
    typeof latestInvoice === "object" &&
    "payment_intent" in latestInvoice
  ) {
    const pi = latestInvoice.payment_intent;
    if (pi && typeof pi === "object") {
      achProcessing = isAchProcessingPayment(pi);
    }
  }

  const result = await applySubscriptionBillingTransition({
    subscriptionId: sync.docId,
    previousStripeStatus: previousStatus,
    nextStripeStatus: sync.nextStatus,
    achProcessing,
  });

  return {
    docId,
    ok: true,
    detail: `${previousStatus}→${sync.nextStatus} action=${result.decision.action} local=${result.decision.nextLocalState}`,
  };
}

export async function runBillingReconcile(): Promise<{
  reconciled: number;
  graceEvaluated: number;
  errors: string[];
  policyGraceDays: number;
}> {
  const policy = await loadBillingFailurePolicy();
  const errors: string[] = [];
  let reconciled = 0;

  const subs = await db().collection(COLLECTIONS.subscriptions).get();
  for (const doc of subs.docs) {
    try {
      const r = await reconcileOneSubscription(doc.id);
      if (r.ok) reconciled += 1;
      else errors.push(`${doc.id}: ${r.detail}`);
      console.log(`[billingReconcile] ${doc.id}: ${r.detail}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      errors.push(`${doc.id}: ${message}`);
      console.error(`[billingReconcile] ${doc.id} failed:`, message);
    }
  }

  const graceResults = await evaluateGraceSubscriptions(new Date());

  await db()
    .collection(COLLECTIONS.system)
    .doc("billingReconcile")
    .set(
      {
        lastRunAt: new Date(),
        reconciled,
        graceEvaluated: graceResults.length,
        errorCount: errors.length,
        errors: errors.slice(0, 50),
        policyGraceDays: policy.gracePeriodDays,
        phase: "D",
      },
      { merge: true }
    );

  return {
    reconciled,
    graceEvaluated: graceResults.length,
    errors,
    policyGraceDays: policy.gracePeriodDays,
  };
}

/**
 * Hourly reconcile — Cloud Scheduler.
 * Cron uses every 1 hours; policy.reconcileIntervalHours is informational.
 */
export const billingReconcile = onSchedule(
  {
    schedule: "every 1 hours",
    timeZone: "America/Los_Angeles",
    secrets: [stripeSecretKey, billingS2sHmacSecret, resendApiKey],
  },
  async () => {
    initBillingAdmin();
    applyBillingRuntimeEnv({ includeS2s: true, includeResend: true });
    const summary = await runBillingReconcile();
    console.log(
      `[billingReconcile] done reconciled=${summary.reconciled} grace=${summary.graceEvaluated} errors=${summary.errors.length}`
    );
  }
);

/**
 * Pure helpers for Stripe webhook event claim / release semantics.
 * The Cloud Function uses a Firestore transaction; these helpers document
 * and unit-test the decision logic without requiring emulators.
 */

export type WebhookClaimDecision =
  | { action: "process" }
  | { action: "skip_duplicate" };

/**
 * First claim wins. If a doc already exists for this Stripe event id,
 * treat the delivery as a duplicate (idempotent ACK).
 */
export function decideWebhookClaim(existingDoc: boolean): WebhookClaimDecision {
  if (existingDoc) {
    return { action: "skip_duplicate" };
  }
  return { action: "process" };
}

/**
 * On handler failure we delete the claim so Stripe can retry.
 * On success we keep the claim with status "processed".
 */
export function shouldReleaseClaimOnFailure(handlerSucceeded: boolean): boolean {
  return !handlerSucceeded;
}

/**
 * joshfarr.com billing Cloud Functions
 *
 * Firebase project: NEW dedicated billing project (see .firebaserc).
 * Isolation: do NOT initialize or call dojo-codex Admin/Auth/Firestore from here.
 * The only future link to Codex is outbound HMAC S2S (Phase C).
 */

import { initBillingAdmin } from "./_shared/admin";

initBillingAdmin();

export { stripeWebhook } from "./http/stripeWebhook";
export { bootstrapAdmin } from "./callables/bootstrapAdmin";

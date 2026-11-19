import { defineSecret, defineString } from "firebase-functions/params";

/** Stripe TEST secret — never live until go-live approval. */
export const stripeSecretKey = defineSecret("STRIPE_SECRET_KEY");
export const stripeWebhookSecret = defineSecret("STRIPE_WEBHOOK_SECRET");

/** Public SPA origin for Checkout / Portal return URLs. */
export const appBaseUrl = defineString("APP_BASE_URL", {
  default: "http://localhost:5173",
});

export function applyBillingRuntimeEnv(opts?: {
  includeWebhookSecret?: boolean;
}): void {
  process.env.STRIPE_SECRET_KEY = stripeSecretKey.value();
  process.env.APP_BASE_URL = appBaseUrl.value();
  if (opts?.includeWebhookSecret) {
    process.env.STRIPE_WEBHOOK_SECRET = stripeWebhookSecret.value();
  }
}

import { defineSecret, defineString } from "firebase-functions/params";

/** Stripe TEST secret — never live until go-live approval. */
export const stripeSecretKey = defineSecret("STRIPE_SECRET_KEY");
export const stripeWebhookSecret = defineSecret("STRIPE_WEBHOOK_SECRET");

/** Phase C — HMAC shared with Codex (value only; never share Firebase credentials). */
export const billingS2sHmacSecret = defineSecret("BILLING_S2S_HMAC_SECRET");

/** Phase D — Resend transactional email. */
export const resendApiKey = defineSecret("RESEND_API_KEY");

/** Public SPA origin for Checkout / Portal return URLs. */
export const appBaseUrl = defineString("APP_BASE_URL", {
  default: "http://localhost:5173",
});

/** Default true — must explicitly set false to POST to Codex. */
export const billingS2sDryRun = defineString("BILLING_S2S_DRY_RUN", {
  default: "true",
});

/** Default true — must explicitly set false to HTTP POST to Resend. */
export const billingEmailDryRun = defineString("BILLING_EMAIL_DRY_RUN", {
  default: "true",
});

/** Optional override for grace period (days). Firestore system/billingPolicy wins when set then env overlays. */
export const billingGracePeriodDays = defineString("BILLING_GRACE_PERIOD_DAYS", {
  default: "5",
});

export function applyBillingRuntimeEnv(opts?: {
  includeWebhookSecret?: boolean;
  includeS2s?: boolean;
  includeResend?: boolean;
}): void {
  process.env.STRIPE_SECRET_KEY = stripeSecretKey.value();
  process.env.APP_BASE_URL = appBaseUrl.value();
  process.env.BILLING_S2S_DRY_RUN = billingS2sDryRun.value();
  process.env.BILLING_EMAIL_DRY_RUN = billingEmailDryRun.value();
  process.env.BILLING_GRACE_PERIOD_DAYS = billingGracePeriodDays.value();
  if (opts?.includeWebhookSecret) {
    process.env.STRIPE_WEBHOOK_SECRET = stripeWebhookSecret.value();
  }
  if (opts?.includeS2s) {
    try {
      process.env.BILLING_S2S_HMAC_SECRET = billingS2sHmacSecret.value();
    } catch {
      // Secret may be unset in early deploys; notify path handles missing secret.
    }
  }
  if (opts?.includeResend) {
    try {
      process.env.RESEND_API_KEY = resendApiKey.value();
    } catch {
      // Optional until email dry-run is disabled.
    }
  }
}

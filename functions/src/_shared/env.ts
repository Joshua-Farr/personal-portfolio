/**
 * Environment helpers for the billing Firebase project.
 * Prefer Netlify.env only on Netlify; here we use process.env / Firebase params.
 * Never load dojo-codex credentials into this process.
 */

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optionalEnv(name: string): string | undefined {
  const value = process.env[name];
  return value && value.length > 0 ? value : undefined;
}

export function getStripeSecretKey(): string {
  const key = requireEnv("STRIPE_SECRET_KEY");
  if (!key.startsWith("sk_test_")) {
    throw new Error(
      "STRIPE_SECRET_KEY must be a Stripe TEST secret (sk_test_…). Live keys are forbidden until explicit go-live approval."
    );
  }
  return key;
}

export function getStripeWebhookSecret(): string {
  return requireEnv("STRIPE_WEBHOOK_SECRET");
}

export function getResendApiKey(): string | undefined {
  return optionalEnv("RESEND_API_KEY");
}

export function getResendFromEmail(): string {
  return optionalEnv("RESEND_FROM_EMAIL") ?? "billing@joshfarr.com";
}

export function getAdminEmailAllowlist(): string[] {
  const raw = optionalEnv("ADMIN_EMAIL_ALLOWLIST") ?? "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** Phase C — do not call Codex until this is set and approved. */
export function getBillingS2sHmacSecret(): string | undefined {
  return optionalEnv("BILLING_S2S_HMAC_SECRET");
}

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

/** Public SPA origin for Checkout success/cancel + Customer Portal return. */
export function getAppBaseUrl(): string {
  return (
    optionalEnv("APP_BASE_URL") ??
    optionalEnv("VITE_APP_BASE_URL") ??
    "http://localhost:5173"
  );
}

/** Optional Stripe Customer Portal configuration (ACH-first branding). */
export function getStripePortalConfigurationId(): string | undefined {
  return optionalEnv("STRIPE_PORTAL_CONFIGURATION_ID");
}

/** Phase C — shared HMAC secret (same string as Codex; separate Firebase secret store). */
export function getBillingS2sHmacSecret(): string | undefined {
  return optionalEnv("BILLING_S2S_HMAC_SECRET");
}

/**
 * When true (default), sign + log accessEvents but do not HTTP POST to Codex.
 * Set BILLING_S2S_DRY_RUN=false only after Codex receiver dry-run is approved.
 * Never suspend production Codex from this portfolio app without that approval.
 */
export function getBillingS2sDryRun(): boolean {
  const raw = optionalEnv("BILLING_S2S_DRY_RUN");
  if (raw === undefined) return true;
  return raw.toLowerCase() !== "false";
}

/**
 * When true (default), do not HTTP POST to Resend.
 * Set BILLING_EMAIL_DRY_RUN=false after reviewing templates in test mode.
 */
export function getBillingEmailDryRun(): boolean {
  const raw = optionalEnv("BILLING_EMAIL_DRY_RUN");
  if (raw === undefined) return true;
  return raw.toLowerCase() !== "false";
}

/**
 * Seed configuration ONLY — business logic must not hardcode these values.
 * Impact / Codex / temporary billing email live here as data, not code paths.
 */

export const SEED = {
  client: {
    id: "client_impact",
    name: "Impact",
    /** TEMPORARY — replace with real Impact billing contact after testing. */
    billingEmail: "joshua.farr2015@gmail.com",
    billingEmailIsTemporary: true as const,
    preferredPaymentMethod: "ach" as const,
    notes:
      "TEMPORARY billing email (joshua.farr2015@gmail.com). Swap before client handoff / live.",
  },
  project: {
    id: "project_one_piece_dojo_codex",
    name: "One Piece Dojo Codex",
    slug: "one-piece-dojo-codex",
    status: "active" as const,
    description: "Codex platform maintenance / retainer for Impact.",
  },
  service: {
    id: "service_codex_maintenance",
    name: "Codex maintenance",
    amountCents: 150_000,
    currency: "usd",
    interval: "month" as const,
    /** Billing starts January 1, 2027 — no Oct–Dec 2026 historical invoices. */
    startsAtIso: "2027-01-01T00:00:00.000Z",
  },
  integration: {
    id: "integration_codex_billing_access",
    type: "codex_billing_access" as const,
    baseUrl: "https://onepiecedojo.gg/api/internal/billing/status",
    hmacSecretEnvKey: "BILLING_S2S_HMAC_SECRET",
    enabled: false,
    notes:
      "Stub only in Phase A. Enable in Phase C after Codex receiver + shared HMAC secret.",
  },
  subscription: {
    id: "subscription_codex_maintenance",
  },
} as const;

export function seedStartsAtDate(): Date {
  return new Date(SEED.service.startsAtIso);
}

export function seedStartsAtUnixSeconds(): number {
  return Math.floor(seedStartsAtDate().getTime() / 1000);
}

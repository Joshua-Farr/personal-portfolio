# Billing rollout runbook (test → live)

Master index for Phase F. Companion checklist copy also lives in the project store as `docs/billing-rollout-checklist.md`.

**Constraint:** Stripe test mode + S2S/email dry-run until **explicit** approval. No production Codex suspend without approval. Codex receiver: [dojo-codex#56](https://github.com/Joshua-Farr/dojo-codex/pull/56) (merged).

## Document map

| Topic | Doc |
| --- | --- |
| Firebase project (≠ dojo-codex) | [`FIREBASE_PROJECT.md`](./FIREBASE_PROJECT.md) |
| Env vars / secrets | [`ENV.md`](./ENV.md) |
| Stripe test config | [`STRIPE_TEST.md`](./STRIPE_TEST.md) |
| Seed Impact / Codex Jan 2027 | [`SEED.md`](./SEED.md) |
| Resend | [`RESEND.md`](./RESEND.md) |
| S2S HMAC | [`S2S_HMAC.md`](./S2S_HMAC.md) · [`S2S_CONTRACT.md`](./S2S_CONTRACT.md) |
| Client onboarding | [`CLIENT_ONBOARDING.md`](./CLIENT_ONBOARDING.md) |
| Production activation | [`PRODUCTION_CHECKLIST.md`](./PRODUCTION_CHECKLIST.md) |
| Phase notes A–F | `PHASE_*.md` |

## Ordered path (safe)

1. **Firebase** — create billing project; update `.firebaserc`; deploy rules/functions ([`FIREBASE_PROJECT.md`](./FIREBASE_PROJECT.md)).
2. **Env** — set test Stripe + allowlist + Resend reserved; leave dry-runs true ([`ENV.md`](./ENV.md)).
3. **Stripe test** — webhook, Checkout, Portal ([`STRIPE_TEST.md`](./STRIPE_TEST.md)).
4. **Seed** — Impact + Codex project/service from **2027-01-01**; optional `--with-stripe` ([`SEED.md`](./SEED.md)).
5. **Admin + client** — bootstrap admin; attach portal user ([`CLIENT_ONBOARDING.md`](./CLIENT_ONBOARDING.md)).
6. **Resend dry-run** — trigger invoice/grace paths; inspect `emailEvents` ([`RESEND.md`](./RESEND.md)).
7. **S2S dry-run** — matching HMAC; `accessEvents` only; Codex #56 deployed ([`S2S_HMAC.md`](./S2S_HMAC.md)).
8. **Verify** — `cd functions && npm test`; `npm run test:e2e` ([`PHASE_F.md`](./PHASE_F.md)).
9. **Stop** — swap temporary billing email; gather approvals.
10. **Live** — only via [`PRODUCTION_CHECKLIST.md`](./PRODUCTION_CHECKLIST.md) sections B–D.

## Rollback switches

| Lever | Safe value |
| --- | --- |
| `BILLING_S2S_DRY_RUN` | `true` |
| `projectIntegrations.enabled` | `false` |
| `BILLING_EMAIL_DRY_RUN` | `true` |
| `BILLING_AUTO_SUSPEND` | `false` (warn/grace only) |
| Stripe keys | keep `sk_test_` / `pk_test_` |

Codex `maintenanceMode` is independent and admin-controlled on Codex — billing S2S must never clear it.

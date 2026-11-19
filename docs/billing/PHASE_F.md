# Phase F — Testing, docs, rollout

Closes the billing build loop on the **dedicated** joshfarr.com Firebase project (not `dojo-codex`). Codex receiver already merged: [dojo-codex#56](https://github.com/Joshua-Farr/dojo-codex/pull/56).

**Hard rule:** no live Stripe keys and no production Codex suspend / S2S live notify without **explicit user approval**.

## Delivered in this phase

| Area | Location |
| --- | --- |
| Webhook idempotency unit tests | `functions/src/http/webhookIdempotency*.ts` |
| S2S contract unit tests (parity with Codex #56) | `functions/src/s2s/codexBilling.test.ts` |
| Existing suite | env, Stripe maps, billing state/grace, HMAC, money |
| Playwright smoke (test/local preview) | `e2e/billing-smoke.spec.ts` |
| Rollout runbook | [`ROLLOUT.md`](./ROLLOUT.md) |
| Env reference | [`ENV.md`](./ENV.md) |
| Firebase isolation | [`FIREBASE_PROJECT.md`](./FIREBASE_PROJECT.md) |
| Stripe test config | [`STRIPE_TEST.md`](./STRIPE_TEST.md) |
| Resend | [`RESEND.md`](./RESEND.md) |
| S2S HMAC | [`S2S_CONTRACT.md`](./S2S_CONTRACT.md) + [`S2S_HMAC.md`](./S2S_HMAC.md) |
| Seed Impact/Codex Jan 2027 | [`SEED.md`](./SEED.md) |
| Client onboarding | [`CLIENT_ONBOARDING.md`](./CLIENT_ONBOARDING.md) |
| Production activation checklist | [`PRODUCTION_CHECKLIST.md`](./PRODUCTION_CHECKLIST.md) |

## Verify locally

```bash
# Unit / contract tests (no network, no live Stripe/Codex)
cd functions && npm test

# SPA build
cd .. && npm run build

# Playwright smoke against vite preview (test mode UI only)
npm run test:e2e:install   # once
npm run test:e2e
```

## Still gated (needs approval)

1. Create/select real billing Firebase project id (replace `.firebaserc` placeholder).
2. Set secrets in that project only — never `dojo-codex`.
3. Seed with Stripe **test** (`--with-stripe`).
4. Codex dry-run then live S2S (`BILLING_S2S_DRY_RUN=false` + `projectIntegrations.enabled=true`).
5. Resend live sends (`BILLING_EMAIL_DRY_RUN=false`).
6. Swap temporary Impact billing email.
7. Live Stripe keys / production cutover — [`PRODUCTION_CHECKLIST.md`](./PRODUCTION_CHECKLIST.md).

# Production activation checklist

**Explicit approval required** before any of the following:

- Live Stripe keys (`sk_live_` / `pk_live_`)
- Live webhook endpoint on production billing Functions
- `BILLING_S2S_DRY_RUN=false` against **production** Codex (`onepiecedojo.gg`)
- Enabling `projectIntegrations` that can suspend production Codex
- Charging customers / sending client-facing Resend mail

Until then: Stripe **test** only; S2S and email dry-run defaults remain **true**.

---

## A. Pre-flight (still test mode)

- [ ] Billing Firebase project created and isolated ([`FIREBASE_PROJECT.md`](./FIREBASE_PROJECT.md))
- [ ] `.firebaserc` / `VITE_FIREBASE_PROJECT_ID` ≠ `dojo-codex`
- [ ] Functions + rules deployed to billing project
- [ ] Netlify SPA has billing `VITE_*` env
- [ ] Stripe test webhook + Checkout/Portal verified
- [ ] Seed Impact/Codex Jan 2027 verified ([`SEED.md`](./SEED.md))
- [ ] Temporary billing email **swapped** to permanent Impact contact
- [ ] Resend templates reviewed; dry-run sends inspected in `emailEvents`
- [ ] Codex #56 receiver deployed; shared **test** HMAC verified ([`S2S_HMAC.md`](./S2S_HMAC.md))
- [ ] Dry-run S2S: `accessEvents` only; Codex not suspended in prod
- [ ] `cd functions && npm test` green; Playwright smoke green against preview
- [ ] Grace / suspend / restore exercised with Stripe test clocks (optional but recommended)

## B. Live Stripe (separate approval)

- [ ] User explicitly approved live Stripe
- [ ] Code/env updated to accept live keys (today live keys are **rejected** — requires a deliberate code/env change)
- [ ] Live Customer / Price / Subscription created with correct dates (**do not** charge before Jan 2027 / confirmed dates)
- [ ] Live webhook secret + endpoint registered
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY` live on Netlify
- [ ] Test-mode objects left alone or clearly archived

## C. Live Codex S2S (separate approval)

- [ ] User explicitly approved production Codex notify / possible suspend path
- [ ] Live (or production) `BILLING_S2S_HMAC_SECRET` rotated/set on **both** Firebase projects
- [ ] Codex production receiver healthy
- [ ] `BILLING_S2S_DRY_RUN=false`
- [ ] `projectIntegrations.enabled=true` for Codex integration
- [ ] Controlled active→suspend dry signal approved; confirm `billingAccessState` only (maintenance untouched)
- [ ] Restore path verified

## D. Live email (separate approval)

- [ ] `BILLING_EMAIL_DRY_RUN=false`
- [ ] From-domain verified; permanent Impact email on client
- [ ] Sample invoice / grace emails accepted by stakeholders

## E. Post-activation watch

- [ ] Monitor `stripeWebhookEvents`, `accessEvents`, `emailEvents`, `auditLog`
- [ ] Monitor Codex `billing_s2s_events` + `system/application_access`
- [ ] Confirm scheduled `billingReconcile` runs
- [ ] Rollback plan: set `BILLING_S2S_DRY_RUN=true` and/or `enabled=false`; Codex admin can use maintenance independently

---

**Default posture if unsure:** leave dry-runs on, integration disabled, Stripe test keys only.

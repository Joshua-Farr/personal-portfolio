# Seed data (Impact / Codex)

Config records only — **do not** hardcode Impact, Codex, or OPD into business logic. Seed lives in `functions/src/seed/seedConfig.ts`.

Part of Phase F rollout: [`ROLLOUT.md`](./ROLLOUT.md). Codex S2S receiver: [dojo-codex#56](https://github.com/Joshua-Farr/dojo-codex/pull/56) (merged) — keep integration **disabled** until dry-run approved.

## What gets created

| Entity | Id | Notes |
| --- | --- | --- |
| Client | `client_impact` | Name: Impact |
| Billing email | — | `joshua.farr2015@gmail.com` — **TEMPORARY**; `billingEmailIsTemporary: true` |
| Project | `project_one_piece_dojo_codex` | Slug `one-piece-dojo-codex` |
| Service | `service_codex_maintenance` | $1500 USD / month, starts **2027-01-01** |
| Subscription | `subscription_codex_maintenance` | Status `scheduled` (or Stripe `trialing` with `--with-stripe`) |
| Integration | `integration_codex_billing_access` | `enabled: false` until S2S dry-run approved |
| Billing policy | `system/billingPolicy` | Grace defaults (Phase D) |

**Historical invoices:** none. No Oct–Dec 2026 documents. First billable period is **January 2027**.

## Run

Prerequisites: dedicated billing Firebase project selected (`firebase use …` after copying [`.firebaserc.example`](../../.firebaserc.example) → `.firebaserc` with your real id), Application Default Credentials or service account for **that** project.

The seed CLI **refuses** `dojo-codex` and the committed `.firebaserc` placeholder id.

```bash
cd functions
npm install
npm run build

# Preview planned docs / Stripe objects (no writes, no credentials required)
npm run seed -- --print-plan
npm run seed -- --print-plan --with-stripe

# Firestore documents only
npm run seed

# Also create Stripe TEST customer, product, price, subscription (trial until Jan 1 2027)
STRIPE_SECRET_KEY=sk_test_… npm run seed -- --with-stripe
```

## After testing

Replace the temporary billing email with Impact’s real contact before any client-facing or live use. Update the `clients/client_impact` doc and Stripe Customer email together.

# Seed data (Impact / Codex)

Config records only — **do not** hardcode Impact, Codex, or OPD into business logic. Seed lives in `functions/src/seed/seedConfig.ts`.

## What gets created

| Entity | Id | Notes |
| --- | --- | --- |
| Client | `client_impact` | Name: Impact |
| Billing email | — | `joshua.farr2015@gmail.com` — **TEMPORARY**; `billingEmailIsTemporary: true` |
| Project | `project_one_piece_dojo_codex` | Slug `one-piece-dojo-codex` |
| Service | `service_codex_maintenance` | $1500 USD / month, starts **2027-01-01** |
| Subscription | `subscription_codex_maintenance` | Status `scheduled` (or Stripe `trialing` with `--with-stripe`) |
| Integration | `integration_codex_billing_access` | Stub; `enabled: false` until Phase C |

**Historical invoices:** none. No Oct–Dec 2026 documents.

## Run

Prerequisites: dedicated billing Firebase project selected (`firebase use …`), Application Default Credentials or service account for **that** project.

```bash
cd functions
npm install
npm run build

# Firestore documents only
npm run seed

# Also create Stripe TEST customer, product, price, subscription (trial until Jan 1 2027)
STRIPE_SECRET_KEY=sk_test_… npm run seed -- --with-stripe
```

## After testing

Replace the temporary billing email with Impact’s real contact before any client-facing or live use. Update the `clients/client_impact` doc and Stripe Customer email together.

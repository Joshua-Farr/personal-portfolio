# Stripe test-mode configuration

Billing code **rejects** live keys (`sk_live_`) and live-mode webhooks until an explicit go-live (see [`PRODUCTION_CHECKLIST.md`](./PRODUCTION_CHECKLIST.md)).

## Dashboard

1. [Stripe Dashboard](https://dashboard.stripe.com/) → toggle **Test mode** ON.
2. Developers → API keys:
   - Secret `sk_test_…` → Functions secret `STRIPE_SECRET_KEY`
   - Publishable `pk_test_…` → `VITE_STRIPE_PUBLISHABLE_KEY`
3. Optional: create a Customer Portal configuration that prefers **ACH** (`us_bank_account`) → `STRIPE_PORTAL_CONFIGURATION_ID`.

## Webhooks

After Functions deploy (billing project):

```text
https://us-central1.<BILLING_PROJECT>.cloudfunctions.net/stripeWebhook
```

Or local:

```bash
stripe listen --forward-to localhost:5001/<BILLING_PROJECT>/us-central1/stripeWebhook
```

Copy `whsec_…` → `STRIPE_WEBHOOK_SECRET`.

### Events to enable

- `customer.subscription.*`
- `invoice.created|updated|finalized|paid|payment_failed|voided|marked_uncollectible`
- `payment_intent.succeeded|payment_failed|canceled|processing`
- `charge.refunded`
- `checkout.session.completed`

Idempotency: `stripeWebhookEvents/{eventId}` — duplicate deliveries ACK with `{ duplicate: true }`; failed handlers release the claim so Stripe can retry.

## Seed subscription (Jan 2027)

```bash
cd functions
STRIPE_SECRET_KEY=sk_test_… npm run seed -- --with-stripe
```

Creates test Customer / Product / Price / Subscription with `trial_end` = **2027-01-01** (no Oct–Dec 2026 invoices). Details: [`SEED.md`](./SEED.md).

## ACH preference

Checkout and Portal sessions request `us_bank_account` + `card`. PaymentIntent `processing` (ACH) is **not** treated as failure (Phase D grace/email skip).

## Test clocks (optional)

For accelerating Jan 2027 billing in test, use Stripe Test Clocks on the seeded customer — still test mode only.

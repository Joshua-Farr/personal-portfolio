# Phase B — Checkout, invoices, subscriptions (test mode)

Continues Phase A on the **dedicated billing Firebase project** (not `dojo-codex`).

## Features

| Feature | Implementation |
| --- | --- |
| Subscription Checkout | Callable `portalCreateSubscriptionCheckout` — ACH + card; `trial_end` from service `startsAt` (seed: 2027-01-01) |
| Customer Portal | Callable `portalCreateBillingPortalSession` |
| One-time Checkout | Callable `createOneTimeCheckout` (admin or owning client) |
| One-time Invoice | Callable `adminCreateOneTimeInvoice` (`send_invoice`, mirrored to Firestore with `kind: one_time`) |
| Webhook sync | `stripeWebhook` idempotently syncs subscriptions, invoices, payments |
| Kind distinction | `resolveInvoiceKind` — subscription vs one_time; never historical backfill |

## New / updated env

| Variable | Where | Purpose |
| --- | --- | --- |
| `APP_BASE_URL` | Functions param / env | Checkout success/cancel + Portal return (e.g. `https://joshfarr.com`) |
| `STRIPE_PORTAL_CONFIGURATION_ID` | Optional Functions env | ACH-first Customer Portal configuration id |

Existing Phase A secrets still required (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, …).

## Webhook events handled

- `customer.subscription.*`
- `invoice.*` (created/updated/finalized/paid/payment_failed/voided/marked_uncollectible)
- `payment_intent.succeeded|payment_failed|canceled`
- `charge.refunded`
- `checkout.session.completed` (logged; domain sync via invoice/subscription events)

Idempotency: transaction claims `stripeWebhookEvents/{eventId}` before handling; deletes claim on failure so Stripe can retry. Live-mode events rejected.

## Local verify

```bash
cd functions && npm test
# Stripe CLI (after emulators / deploy):
# stripe listen --forward-to localhost:5001/<billing-project>/us-central1/stripeWebhook
```

## Out of scope

Phase C Codex S2S, live Stripe keys, full invoice list UI (Phase E), payment-failure automation (Phase D).

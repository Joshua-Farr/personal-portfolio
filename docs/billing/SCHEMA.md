# Firestore schema (billing project)

All collections live in the **joshfarr.com billing** Firebase project. Codex (`dojo-codex`) collections are out of scope.

```
Client → Projects → Services → Subscriptions → Invoices → Payments
         │
         └─ projectIntegrations (S2S config stub)
```

| Collection | Purpose |
| --- | --- |
| `clients` | Org / billing contact, `stripeCustomerId`, preferred ACH |
| `clientUsers` | Auth uid ↔ role (`admin` \| `client`) + `clientId` |
| `projects` | Client-owned projects (`slug`, status) |
| `services` | Recurring/one-off offerings + Stripe Product/Price ids + `startsAt` |
| `subscriptions` | Local mirror of Stripe subscription status |
| `invoices` | Local mirror (`subscription` \| `one_time`); no historical seed |
| `payments` | PaymentIntent / charge mirror |
| `projectIntegrations` | e.g. `codex_billing_access` + URL + env key name for HMAC |
| `accessEvents` | Outbound S2S audit (Phase C) |
| `stripeWebhookEvents` | Inbound webhook idempotency |
| `auditLog` | Admin action audit |

Security: client SDK is **read-only** scoped by custom claims; writes go through Admin SDK / Cloud Functions. See `firestore.rules`.

TypeScript shapes: `functions/src/types/models.ts`.

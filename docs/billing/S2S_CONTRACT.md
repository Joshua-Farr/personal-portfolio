# Billing ↔ Codex S2S contract (Phase C)

**Portfolio (joshfarr.com billing Firebase)** is the HMAC **client**.  
**Codex (`dojo-codex`)** is the HMAC **receiver**.  
No shared Firebase Auth/Firestore/Functions/service accounts — only this HTTPS call.

## Endpoint

```
POST https://onepiecedojo.gg/api/internal/billing/status
```

Codex should Netlify-proxy that path to a Firebase HTTP function (same pattern as Metafy).

## HMAC (Metafy-identical)

Reuse Codex `verifyMetafyWebhookSignature` with secret `BILLING_S2S_HMAC_SECRET`.

| Header | Value |
| --- | --- |
| `Content-Type` | `application/json` |
| `X-Webhook-Timestamp` | ISO8601 signing time |
| `X-Webhook-Signature` | `sha256=<hex>` where HMAC-SHA256(secret, `{timestamp}.{rawBody}`) |

Reject timestamps outside ±5 minutes. Verify over the **exact raw body bytes**.

## JSON body

```json
{
  "eventId": "billing_…",
  "accessState": "active" | "suspended",
  "reason": "subscription_status:active→past_due",
  "projectSlug": "one-piece-dojo-codex",
  "subscriptionStatus": "past_due",
  "occurredAt": "2026-11-19T18:00:00.000Z"
}
```

| Field | Notes |
| --- | --- |
| `eventId` | Idempotency key → Codex `billing_s2s_events` (separate from Metafy) |
| `accessState` | Site-level only — update **only** `system/application_access.billing*` fields |
| `reason` | Opaque audit string |
| `projectSlug` | Optional; seed uses `one-piece-dojo-codex` |
| `subscriptionStatus` | Optional Stripe-mapped local status |
| `occurredAt` | Event time (ISO8601); distinct from signing timestamp header |

**Never** clear or set `maintenanceMode` from this payload.

## Portfolio safety (no production suspend by default)

1. Seed `projectIntegrations.enabled = false` until dry-run approved.
2. `BILLING_S2S_DRY_RUN` defaults to **`true`** (sign + `accessEvents` log, no HTTP POST).
3. Set `enabled: true` **and** `BILLING_S2S_DRY_RUN=false` only after Codex receiver + shared secret are verified.

## Portfolio triggers

- Stripe webhook subscription status transition that changes mapped access:
  - → `suspended`: `past_due` \| `unpaid` \| `canceled`
  - → `active`: `active` \| `trialing`
- Admin callable `adminNotifyProjectBillingAccess` for manual dry-run.

## Secrets

| Side | Secret name | Notes |
| --- | --- | --- |
| Billing Firebase | `BILLING_S2S_HMAC_SECRET` | Test secret first |
| Codex Firebase | `BILLING_S2S_HMAC_SECRET` | Same string value; separate secret store |

## Expected Codex response

- `2xx` + optional `{ ok: true, duplicate?: boolean }`
- `401/403` invalid HMAC
- `409` optional for duplicates (portfolio treats any non-2xx as retryable failure except we still ACK Stripe)

Portfolio retries up to 3 attempts and writes each attempt to `accessEvents`.

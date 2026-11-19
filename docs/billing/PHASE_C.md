# Phase C — Codex S2S (portfolio side)

Outbound HMAC client from the **billing** Firebase project to Codex. Does not suspend production Codex by default.

## Files

| Path | Role |
| --- | --- |
| `functions/src/s2s/hmac.ts` | Metafy-compatible sign/verify |
| `functions/src/s2s/codexBilling.ts` | HTTP POST client |
| `functions/src/s2s/notifyProjectAccess.ts` | enabled integrations + retries + `accessEvents` |
| `functions/src/http/stripeWebhook.ts` | notify on suspend/restore transitions |
| `functions/src/callables/adminS2s.ts` | manual admin notify |
| `docs/billing/S2S_CONTRACT.md` | contract for Codex sibling PR |

## Env

| Var | Default | Purpose |
| --- | --- | --- |
| `BILLING_S2S_HMAC_SECRET` | (required to POST) | Shared HMAC with Codex |
| `BILLING_S2S_DRY_RUN` | `true` | When true, no HTTP POST |

Also require `projectIntegrations/{id}.enabled === true` for the Codex integration.

## Enable checklist (do not skip)

1. Codex receiver PR merged + deployed (test/HMAC verified).
2. Same test HMAC secret set on **both** Firebase projects.
3. Dry-run: leave `BILLING_S2S_DRY_RUN=true`, set `enabled=true`, trigger `adminNotifyProjectBillingAccess` — confirm `accessEvents` only.
4. Explicit approval before `BILLING_S2S_DRY_RUN=false` against production Codex URL.

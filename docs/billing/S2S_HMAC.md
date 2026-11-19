# S2S HMAC runbook (portfolio ↔ Codex)

Contract detail: [`S2S_CONTRACT.md`](./S2S_CONTRACT.md).  
Codex receiver: [dojo-codex#56](https://github.com/Joshua-Farr/dojo-codex/pull/56) (**merged**).

## Shared secret

| Side | Where | Name |
| --- | --- | --- |
| Portfolio billing Firebase | Functions secret | `BILLING_S2S_HMAC_SECRET` |
| Codex (`dojo-codex`) Firebase | Functions secret | `BILLING_S2S_HMAC_SECRET` |

Use the **same string** in both stores. Start with a **test** secret. Never put Codex Admin credentials in this repo.

## Safety gates (all required for a real POST)

1. `projectIntegrations/{integration_codex_billing_access}.enabled === true`
2. `BILLING_S2S_DRY_RUN=false` (defaults **true** → sign + `accessEvents` only)
3. `BILLING_S2S_HMAC_SECRET` set on billing Functions
4. Codex receiver deployed + same secret

**Do not** flip (1)+(2) against production Codex without explicit user approval.

## Dry-run procedure

1. Confirm Codex #56 deployed; set matching test HMAC on both projects.
2. Leave `BILLING_S2S_DRY_RUN=true`.
3. Optionally set integration `enabled=true` for notify path selection.
4. Admin → project → **Notify Codex** (`adminNotifyProjectBillingAccess`) or wait for a test subscription transition.
5. Expect `accessEvents` rows with `dryRun: true` and **no** HTTP to onepiecedojo.gg.
6. Only after approval: `BILLING_S2S_DRY_RUN=false` and verify Codex `billing_s2s_events` + `system/application_access.billing*`.

## What Codex updates

- **Only** `billing*` fields on `system/application_access`
- **Never** `maintenanceMode` (admin-only on Codex; independent kill switch)

## Unit tests

```bash
cd functions && npm test
# includes lib/s2s/hmac.test.js + lib/s2s/codexBilling.test.js
```

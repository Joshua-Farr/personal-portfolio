# Phase E — Admin + client portals

Full billing UI on the marketing SPA (Netlify), talking to the **dedicated billing Firebase project** (not `dojo-codex`). Stripe **test mode** only.

## Routes

| Path | Role | Purpose |
| --- | --- | --- |
| `/login` | all | Firebase Auth |
| `/portal` | client | Overview: projects, subscriptions, open invoices |
| `/portal/invoices` | client | Invoice list + pay links |
| `/portal/invoices/:id` | client | Invoice detail |
| `/portal/billing` | client | Stripe Customer Portal session |
| `/admin` | admin | MRR, outstanding, attention list |
| `/admin/clients` | admin | List + create clients |
| `/admin/clients/:id` | admin | Edit client, add project, attach portal user |
| `/admin/projects` | admin | Project list |
| `/admin/projects/:id` | admin | Edit/archive, add service, manual S2S notify |
| `/admin/invoices` | admin | List + create one-time invoices |
| `/admin/subscriptions` | admin | Cancel-at-period-end / local cancel |
| `/admin/audit` | admin | Audit log |

## Callables (writes + audit)

Reads use the client Firestore SDK (rules: admin full read; client scoped by `clientId`). Writes go through Functions:

- Existing: `portalCreateSubscriptionCheckout`, `portalCreateBillingPortalSession`, `createOneTimeCheckout`, `adminCreateOneTimeInvoice`, `adminNotifyProjectBillingAccess`
- New: `adminUpsertClient`, `adminUpsertProject`, `adminUpsertService`, `adminUpdateSubscription`, `adminAttachClientUser`, `adminArchiveProject`

All admin mutations append to `auditLog` via `writeAuditLog`.

## UI notes

- Portal/admin use `BillingThemeProvider` (styled-components ThemeProvider + CSS vars for navy/mint). Marketing pages unchanged.
- `body.billing-layout` widens max-width for app chrome.
- No Impact/Codex hardcoded in business logic — seed ids appear only as UI defaults where needed.

## Out of scope

Phase F (Playwright, live cutover, permanent billing email swap).

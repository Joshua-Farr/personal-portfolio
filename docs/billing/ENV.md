# Environment variables (billing)

All secrets belong to the **joshfarr.com billing** Firebase / Netlify site.  
**Never** copy values from `dojo-codex` / One Piece Dojo.

Local templates: root [`.env.example`](../../.env.example), [`functions/.env.example`](../../functions/.env.example).  
Firebase project: **`joshfarr-billing`** ([`.firebaserc`](../../.firebaserc) / [`.firebaserc.example`](../../.firebaserc.example)). SPA reads config from `VITE_*` only (`src/lib/firebase.ts`); copy values from root [`.env.example`](../../.env.example) into Netlify / local `.env` — do not hardcode the apiKey in source.

**Where to set values**

| Surface | How |
| --- | --- |
| Netlify SPA | Site → **Environment variables** → `VITE_*` (build-time) |
| Firebase Functions secrets | `firebase functions:secrets:set NAME` on the **billing** project |
| Firebase Functions params | `APP_BASE_URL`, `BILLING_*_DRY_RUN`, etc. (defaults keep dry-run **true**) |
| Local | root `.env` + `functions/.env` (both gitignored) |

## SPA (Netlify / Vite)

| Variable | Required | Notes |
| --- | --- | --- |
| `VITE_FIREBASE_API_KEY` | Yes | Billing web app |
| `VITE_FIREBASE_AUTH_DOMAIN` | Yes | `{billing-project}.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Yes | Must **≠** `dojo-codex` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Yes | Billing project |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Yes | Billing project |
| `VITE_FIREBASE_APP_ID` | Yes | Billing project |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Yes | `pk_test_…` only until go-live |
| `VITE_USE_FIREBASE_EMULATORS` | No | `true` for local Auth/Firestore/Functions |

## Cloud Functions secrets

Set with `firebase functions:secrets:set NAME` (billing project):

| Secret | Required | Notes |
| --- | --- | --- |
| `STRIPE_SECRET_KEY` | Yes | `sk_test_…` — live rejected in code |
| `STRIPE_WEBHOOK_SECRET` | Yes | `whsec_…` from Stripe CLI or Dashboard |
| `ADMIN_EMAIL_ALLOWLIST` | Yes | Comma-separated; may call `bootstrapAdmin` |
| `RESEND_API_KEY` | For email | Dry-run skips HTTP until enabled |
| `BILLING_S2S_HMAC_SECRET` | For S2S POST | Same **string** as Codex; separate store |

## Cloud Functions params / env

| Variable | Default | Notes |
| --- | --- | --- |
| `APP_BASE_URL` | `http://localhost:5173` | Checkout / Portal return origin |
| `STRIPE_PORTAL_CONFIGURATION_ID` | unset | Optional ACH-first Portal config |
| `RESEND_FROM_EMAIL` | `billing@joshfarr.com` | Verified domain in Resend |
| `BILLING_EMAIL_DRY_RUN` | `true` | No Resend HTTP until `false` |
| `BILLING_S2S_DRY_RUN` | `true` | No Codex HTTP until `false` |
| `BILLING_GRACE_PERIOD_DAYS` | `5` | Overlay on `system/billingPolicy` |
| `BILLING_AUTO_SUSPEND` | `true` | Set `false` for warn-only |
| `BILLING_AUTO_REACTIVATE` | `true` | Set `false` to require manual restore |

## Safety defaults

- `BILLING_S2S_DRY_RUN` and `BILLING_EMAIL_DRY_RUN` default **true** when unset.
- Seed `projectIntegrations.enabled = false` until Codex dry-run approved.
- Live Stripe secrets (`sk_live_`) throw at runtime.

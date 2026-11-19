# Billing foundation setup (Phase A)

**Hard isolation:** joshfarr.com billing uses a **brand-new Firebase project**. Do **not** reuse `dojo-codex` (One Piece Dojo / onepiecedojo.gg) Auth, Firestore, Functions, service accounts, or `.firebaserc` project ids. The **only** allowed cross-system link is outbound HMAC S2S to Codex (Phase C).

SPA stays on **Netlify**. Billing API/data/auth are **Firebase** (this new project). Do not use Netlify Identity or Netlify Database for billing.

Stripe is **test mode only** until explicit go-live approval.

---

## 1. Create the new Firebase project

1. Open [Firebase Console](https://console.firebase.google.com/) → **Add project**.
2. Suggested id: `joshfarr-billing` (or similar). Confirm it is **not** `dojo-codex`.
3. Enable **Google Analytics** only if you want it (optional).
4. In the new project:
   - **Authentication** → Sign-in method → enable **Email/Password**.
   - **Firestore Database** → create database (production mode is fine; deploy `firestore.rules` immediately).
   - **Functions** → enable (Blaze plan required for deploy / some emulator features).
5. Project settings → **Your apps** → add a **Web** app → copy config into root `.env` as `VITE_FIREBASE_*` (see `.env.example`).
6. Update `.firebaserc`:

```json
{
  "projects": {
    "default": "joshfarr-billing"
  }
}
```

7. Install CLI if needed: `npm i -g firebase-tools`, then `firebase login` and `firebase use joshfarr-billing`.

**Never** run `firebase use dojo-codex` from this repo.

---

## 2. Stripe test keys

1. [Stripe Dashboard](https://dashboard.stripe.com/) → ensure **Test mode** is ON.
2. Developers → API keys → copy:
   - Secret: `sk_test_…` → Functions secret `STRIPE_SECRET_KEY`
   - Publishable: `pk_test_…` → `VITE_STRIPE_PUBLISHABLE_KEY`
3. Developers → Webhooks → add endpoint (after Functions deploy), or use Stripe CLI locally:

```bash
stripe listen --forward-to localhost:5001/joshfarr-billing/us-central1/stripeWebhook
```

Copy the webhook signing secret `whsec_…` → `STRIPE_WEBHOOK_SECRET`.

Live keys (`sk_live_`, `pk_live_`) are rejected by helpers in `functions/src/_shared/env.ts` / `stripe.ts`.

---

## 3. Functions secrets / env

From `functions/`:

```bash
firebase functions:secrets:set STRIPE_SECRET_KEY
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
firebase functions:secrets:set ADMIN_EMAIL_ALLOWLIST
# Optional Phase A (scaffold only — no sends yet)
firebase functions:secrets:set RESEND_API_KEY
# Phase C only
# firebase functions:secrets:set BILLING_S2S_HMAC_SECRET
```

Local emulator: copy `functions/.env.example` → `functions/.env` (gitignored) with test values.

| Variable | Where | Purpose |
| --- | --- | --- |
| `STRIPE_SECRET_KEY` | Functions secret | Stripe test secret (`sk_test_…`) |
| `STRIPE_WEBHOOK_SECRET` | Functions secret | Webhook signature (`whsec_…`) |
| `ADMIN_EMAIL_ALLOWLIST` | Functions secret | Comma-separated emails that may call `bootstrapAdmin` |
| `RESEND_API_KEY` | Functions secret | Reserved; Phase A does not send mail |
| `RESEND_FROM_EMAIL` | Optional env | Default `billing@joshfarr.com` |
| `BILLING_S2S_HMAC_SECRET` | Functions secret | Phase C outbound Codex HMAC only |
| `VITE_FIREBASE_*` | Netlify / `.env` | Web SDK → **billing** project |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Netlify / `.env` | `pk_test_…` |
| `VITE_USE_FIREBASE_EMULATORS` | Local `.env` | `true` to hit Auth/Firestore/Functions emulators |

---

## 4. Deploy scaffold

```bash
# Repo root
npm install
cd functions && npm install && npm run build && cd ..

firebase deploy --only firestore:rules,firestore:indexes,functions
```

Netlify: build `npm run build`, publish `dist` (`netlify.toml` SPA fallback included). Set `VITE_*` in Netlify site env (billing project only).

---

## 5. Bootstrap admin

1. Create a user in Firebase Auth (Email/Password) for an allowlisted address.
2. Sign in at `/login`.
3. Click **Bootstrap admin role** (calls `bootstrapAdmin` callable).
4. Refresh → `/admin`.

Client users: Phase B/E will invite and set `role=client` + `clientId` claims via Admin callables.

---

## 6. Isolation checklist

- [ ] `.firebaserc` default project ≠ `dojo-codex`
- [ ] No Codex service account JSON in this repo or CI
- [ ] Admin SDK `initializeApp()` uses default credentials of the **billing** project only
- [ ] No second `initializeApp(name)` pointed at Codex
- [ ] Stripe keys are `*_test_*`
- [ ] Codex S2S secret unset until Phase C

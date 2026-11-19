# Firebase billing project setup (isolated from dojo-codex)

joshfarr.com billing uses a **brand-new** Firebase project.  
The **only** allowed link to Codex is outbound HMAC S2S (see [`S2S_HMAC.md`](./S2S_HMAC.md)).

## Create the project

1. [Firebase Console](https://console.firebase.google.com/) → **Add project**.
2. Suggested id: `joshfarr-billing` (or similar). Confirm it is **not** `dojo-codex`.
3. Enable:
   - **Authentication** → Email/Password
   - **Firestore** → create DB; deploy `firestore.rules` immediately
   - **Functions** (Blaze plan)
4. Project settings → add a **Web** app → copy config into root `.env` / Netlify as `VITE_FIREBASE_*` (see [`.env.example`](../../.env.example); SPA uses `import.meta.env` only).
5. `.firebaserc` default is **`joshfarr-billing`** (matches [`.firebaserc.example`](../../.firebaserc.example)).
6. `firebase login` → `firebase use joshfarr-billing`.

**Never** run `firebase use dojo-codex` from this repo.

## Deploy (billing project only)

```bash
npm install
cd functions && npm install && npm run build && cd ..
firebase deploy --only firestore:rules,firestore:indexes,functions
```

SPA stays on **Netlify** (`netlify.toml` → `dist`). Set `VITE_*` on the Netlify site for the **billing** web config only.

## Isolation checklist

- [ ] `.firebaserc` default ≠ `dojo-codex`
- [ ] `VITE_FIREBASE_PROJECT_ID` ≠ `dojo-codex` (SPA rejects `dojo-codex` in client SDK)
- [ ] No Codex service-account JSON in this repo or CI
- [ ] Admin SDK `initializeApp()` uses billing project credentials only
- [ ] No second `initializeApp(name)` pointed at Codex
- [ ] Functions secrets set on billing project only
- [ ] Codex `BILLING_S2S_HMAC_SECRET` is a **separate** secret store (same string value)

## What must never be shared

| Shared? | Item |
| --- | --- |
| No | Auth users / providers |
| No | Firestore databases / collections |
| No | Cloud Functions deploy targets |
| No | Service accounts / Admin JSON |
| No | `.firebaserc` / `firebase.json` project ids |
| Yes (HTTPS only) | HMAC S2S to `POST …/api/internal/billing/status` |

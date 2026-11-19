# joshfarr.com (personal-portfolio)

Marketing SPA (Vite + React) hosted on **Netlify**, plus a **Client Billing Portal** foundation.

## Billing (Phase A)

- **Backend:** dedicated Firebase project (Auth + Firestore + Cloud Functions) — **not** `dojo-codex` / One Piece Dojo.
- **Payments:** Stripe **test mode** only.
- **Email:** Resend scaffold (no customer sends yet).
- **Docs:** [`docs/billing/SETUP.md`](docs/billing/SETUP.md), [`SEED.md`](docs/billing/SEED.md), [`SCHEMA.md`](docs/billing/SCHEMA.md).

Routes: `/login`, `/admin`, `/portal` (shells). Marketing routes unchanged.

```bash
npm install
cd functions && npm install && npm run build && npm test
cd ..
npm run build
```

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Vite SPA |
| `npm run build` | Typecheck + production build → `dist` |
| `cd functions && npm run seed` | Seed Impact / Codex config (see SEED.md) |

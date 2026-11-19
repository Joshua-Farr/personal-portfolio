# joshfarr.com (personal-portfolio)

Marketing SPA (Vite + React) hosted on **Netlify**, plus a **Client Billing Portal** foundation.

## Billing (Phase A + B)

- **Backend:** dedicated Firebase project (Auth + Firestore + Cloud Functions) — **not** `dojo-codex` / One Piece Dojo.
- **Payments:** Stripe **test mode** only — Checkout, Customer Portal, one-time invoices, webhook → Firestore sync.
- **Email:** Resend scaffold (no customer sends yet).
- **Docs:** [`docs/billing/SETUP.md`](docs/billing/SETUP.md), [`SEED.md`](docs/billing/SEED.md), [`SCHEMA.md`](docs/billing/SCHEMA.md), [`PHASE_B.md`](docs/billing/PHASE_B.md), [`PHASE_C.md`](docs/billing/PHASE_C.md), [`S2S_CONTRACT.md`](docs/billing/S2S_CONTRACT.md).

Routes: `/login`, `/admin`, `/portal`. Marketing routes unchanged.

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

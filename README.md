# joshfarr.com (personal-portfolio)

Marketing SPA (Vite + React) hosted on **Netlify**, plus a **Client Billing Portal** (Phases A–F).

## Billing

- **Backend:** dedicated Firebase project (Auth + Firestore + Cloud Functions) — **not** `dojo-codex` / One Piece Dojo.
- **Payments:** Stripe **test mode** only until explicit go-live — Checkout, Customer Portal, invoices, webhook → Firestore.
- **Email:** Resend (dry-run default).
- **Codex S2S:** HMAC client ready; receiver [dojo-codex#56](https://github.com/Joshua-Farr/dojo-codex/pull/56) merged — keep `enabled=false` + `BILLING_S2S_DRY_RUN=true` until approved.
- **Rollout:** [`docs/billing/ROLLOUT.md`](docs/billing/ROLLOUT.md) · setup [`SETUP.md`](docs/billing/SETUP.md) · env [`ENV.md`](docs/billing/ENV.md)

Routes: `/login`, `/admin`, `/portal`. Marketing routes unchanged.

`.firebaserc` ships with a placeholder — copy [`.firebaserc.example`](.firebaserc.example) after you create the billing project.

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
| `npm run test:e2e` | Playwright smoke (billing routes) |
| `cd functions && npm run seed -- --print-plan` | Preview Impact/Codex seed (no writes) |
| `cd functions && npm run seed` | Seed Impact / Codex config (see [`SEED.md`](docs/billing/SEED.md)) |

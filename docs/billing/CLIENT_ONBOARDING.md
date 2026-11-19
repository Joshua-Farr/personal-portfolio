# Client onboarding (portal)

All steps run against the **billing** Firebase project + Stripe **test** mode until go-live.

## Admin bootstrap (once)

1. Create Email/Password user in billing Firebase Auth (allowlisted address).
2. Sign in at `/login` → **Bootstrap admin role**.
3. Confirm `/admin` loads.

## New client (Impact seed or future clients)

### Option A — seed Impact/Codex

See [`SEED.md`](./SEED.md). Creates client, project, service ($1500/mo from **2027-01-01**), disabled Codex integration, optional Stripe test objects.

### Option B — Admin UI

1. `/admin/clients` → create client (name, billing email, preferred ACH).
2. Optionally ensure Stripe Customer (callable does this by default).
3. Open client → **Add project** / link service.
4. **Attach portal user**: create Auth user for the client email first, then `adminAttachClientUser` from client detail (sets `role=client` + `clientId` claims).
5. Client signs in at `/login` → `/portal`.

## Client portal checklist (test)

- [ ] Sees projects + subscription status (incl. local access: active/grace/suspended)
- [ ] Can open invoices / hosted pay links
- [ ] Can start subscription Checkout when not yet Stripe-linked
- [ ] `/portal/billing` opens Stripe Customer Portal session
- [ ] ACH preferred; card available as fallback

## Temporary billing email

Seed Impact contact is `joshua.farr2015@gmail.com` with `billingEmailIsTemporary: true`.  
**Replace** with the real Impact contact (Firestore client doc + Stripe Customer email) before any client-facing or live use.

## Do not

- Attach users from the `dojo-codex` Auth project
- Enable Codex S2S live notify during first onboarding dry-runs without approval
- Use live Stripe keys for client walkthroughs until production checklist is signed

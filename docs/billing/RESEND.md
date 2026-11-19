# Resend (transactional email)

Same **vendor** as Codex is fine; use a **separate** API key / from-address for joshfarr.com billing. Do not reuse Codex Firebase secrets.

## Setup

1. Create/verify domain for `billing@joshfarr.com` (or chosen from-address) in [Resend](https://resend.com/).
2. Create an API key → Functions secret `RESEND_API_KEY`.
3. Optional: `RESEND_FROM_EMAIL=billing@joshfarr.com`.

## Dry-run (default)

`BILLING_EMAIL_DRY_RUN` defaults to **`true`**:

- Writes / logs via `emailEvents` idempotency path
- **No** HTTP to Resend

Set `BILLING_EMAIL_DRY_RUN=false` only after reviewing templates in Stripe **test** mode.

## Templates (Phase D)

| Kind | Trigger |
| --- | --- |
| `invoice` | Invoice finalized / open |
| `payment_succeeded` | `invoice.paid` |
| `payment_failed` | `invoice.payment_failed` (not ACH processing) |
| `grace` | Entered local grace after past_due/unpaid |
| `suspension` | Grace expired → local suspend (+ optional Codex S2S) |
| `reactivation` | Restored to active |

Implementation: `functions/src/email/templates.ts`, `sendTransactional.ts`, `_shared/resend.ts`.

## Safety

- Keep dry-run on until copy is approved.
- Temporary Impact seed email (`joshua.farr2015@gmail.com`) must be swapped before client-facing sends.
- Do not enable live Stripe + live email without [`PRODUCTION_CHECKLIST.md`](./PRODUCTION_CHECKLIST.md) sign-off.

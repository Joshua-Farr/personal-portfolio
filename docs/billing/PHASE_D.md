# Phase D — Payment failure automation

Continues Phase C on the **dedicated billing Firebase project** (not `dojo-codex`).

## Behavior

| Topic | Behavior |
| --- | --- |
| Policy | `system/billingPolicy` (seed: **5-day** grace, `autoSuspend` / `autoReactivate` true). Env overlays: `BILLING_GRACE_PERIOD_DAYS`, `BILLING_AUTO_SUSPEND`, `BILLING_AUTO_REACTIVATE`. |
| State machine | `past_due` / `unpaid` → **grace** (Codex stays active) → after grace → **suspended** (Codex S2S `suspended`). Healthy → **active** + S2S restore. |
| ACH | PaymentIntent `processing` (ACH) is **not** a failure — skip enter-grace / failure emails. |
| Cancellation | `canceled` is separate from failure. Paying an old invoice **does not** reactivate a canceled subscription. |
| Email | Resend templates: invoice, payment succeeded/failed, grace, suspension, reactivation. Deduped in `emailEvents`. |
| Reconcile | Scheduled `billingReconcile` hourly — pull Stripe subs, sync, evaluate grace expiry. |
| S2S | Uses Phase C `notifyProjectBillingAccess` on suspend/restore only. Still gated by `projectIntegrations.enabled` + `BILLING_S2S_DRY_RUN` (default **true**). |

## Key files

| Path | Role |
| --- | --- |
| `functions/src/_shared/billingPolicy.ts` | Load defaults + Firestore + env |
| `functions/src/_shared/billingState.ts` | State machine + persist + S2S + email hooks |
| `functions/src/email/templates.ts` | HTML templates |
| `functions/src/email/sendTransactional.ts` | Send + `emailEvents` idempotency |
| `functions/src/scheduled/billingReconcile.ts` | Hourly Stripe reconcile |
| `functions/src/http/stripeWebhook.ts` | Phase D hooks on invoice/subscription events |

## Env / secrets (additions)

| Variable | Default | Purpose |
| --- | --- | --- |
| `RESEND_API_KEY` | (secret) | Resend sends |
| `RESEND_FROM_EMAIL` | `billing@joshfarr.com` | From address |
| `BILLING_EMAIL_DRY_RUN` | `true` | When true, no HTTP to Resend |
| `BILLING_GRACE_PERIOD_DAYS` | `5` | Grace overlay |
| `BILLING_AUTO_SUSPEND` | `true` | Disable to warn-only |
| `BILLING_AUTO_REACTIVATE` | `true` | Disable auto restore |
| `BILLING_S2S_DRY_RUN` | `true` | **Keep true** until Codex production notify approved |

## Safety checklist

1. Stripe keys remain `sk_test_` / `pk_test_` only — live rejected.
2. Codex integration seed stays `enabled: false` until dry-run approved.
3. `BILLING_S2S_DRY_RUN=true` → accessEvents only, no HTTP POST to production Codex.
4. `BILLING_EMAIL_DRY_RUN=true` → emailEvents / logs only until templates reviewed.
5. Do **not** suspend production Codex without explicit approval.

## Local verify

```bash
cd functions && npm test
```

## Out of scope

Phase E portal UI, live Stripe keys, production Codex suspend without dry-run.

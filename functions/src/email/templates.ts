/**
 * Transactional email HTML templates (Phase D).
 * Copy is intentionally plain — product can refine before client handoff.
 */

export type TransactionalEmailKind =
  | "invoice"
  | "payment_succeeded"
  | "payment_failed"
  | "grace"
  | "suspension"
  | "reactivation";

export interface TemplateVars {
  clientName: string;
  projectName?: string;
  amountLabel?: string;
  invoiceUrl?: string | null;
  graceDaysRemaining?: number;
  gracePeriodDays?: number;
  reason?: string;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function layout(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><title>${escapeHtml(title)}</title></head>
<body style="font-family: Georgia, 'Times New Roman', serif; color: #141c3a; line-height: 1.5; max-width: 560px; margin: 0 auto; padding: 24px;">
  <p style="font-size: 13px; letter-spacing: 0.04em; text-transform: uppercase; color: #3B3B3B; margin: 0 0 8px;">Josh Farr · Billing</p>
  <h1 style="font-size: 22px; margin: 0 0 16px;">${escapeHtml(title)}</h1>
  ${bodyHtml}
  <p style="margin-top: 32px; font-size: 12px; color: #3B3B3B;">This message was sent by the joshfarr.com billing portal (test mode until go-live).</p>
</body>
</html>`;
}

export function renderTransactionalEmail(
  kind: TransactionalEmailKind,
  vars: TemplateVars
): { subject: string; html: string } {
  const name = escapeHtml(vars.clientName);
  const project = vars.projectName
    ? escapeHtml(vars.projectName)
    : "your project";
  const amount = vars.amountLabel
    ? escapeHtml(vars.amountLabel)
    : "the outstanding amount";
  const invoiceLink = vars.invoiceUrl
    ? `<p><a href="${escapeHtml(vars.invoiceUrl)}">View invoice</a></p>`
    : "";

  switch (kind) {
    case "invoice":
      return {
        subject: `Invoice ready — ${vars.projectName ?? "billing"}`,
        html: layout(
          "Invoice ready",
          `<p>Hi ${name},</p>
           <p>An invoice for <strong>${project}</strong> (${amount}) is ready.</p>
           ${invoiceLink}`
        ),
      };
    case "payment_succeeded":
      return {
        subject: `Payment received — ${vars.projectName ?? "billing"}`,
        html: layout(
          "Payment received",
          `<p>Hi ${name},</p>
           <p>We received your payment of ${amount} for <strong>${project}</strong>. Thank you.</p>
           ${invoiceLink}`
        ),
      };
    case "payment_failed":
      return {
        subject: `Payment unsuccessful — ${vars.projectName ?? "billing"}`,
        html: layout(
          "Payment unsuccessful",
          `<p>Hi ${name},</p>
           <p>We could not collect ${amount} for <strong>${project}</strong>.</p>
           <p>Please update your payment method or retry. ACH transfers that are still processing are not treated as failures.</p>
           ${invoiceLink}`
        ),
      };
    case "grace": {
      const days =
        vars.graceDaysRemaining ?? vars.gracePeriodDays ?? 5;
      return {
        subject: `Action needed — payment grace period (${days} day${days === 1 ? "" : "s"})`,
        html: layout(
          "Payment grace period",
          `<p>Hi ${name},</p>
           <p>Payment for <strong>${project}</strong> is past due. Access remains active during a <strong>${days}-day</strong> grace period.</p>
           <p>If payment is not received before the grace period ends, project access may be suspended.</p>
           ${invoiceLink}`
        ),
      };
    }
    case "suspension":
      return {
        subject: `Access suspended — ${vars.projectName ?? "billing"}`,
        html: layout(
          "Access suspended",
          `<p>Hi ${name},</p>
           <p>Because payment for <strong>${project}</strong> remained unpaid after the grace period, related project access has been suspended.</p>
           <p>Pay the outstanding invoice to restore access (canceled subscriptions are not restored by paying an old invoice).</p>
           ${invoiceLink}`
        ),
      };
    case "reactivation":
      return {
        subject: `Access restored — ${vars.projectName ?? "billing"}`,
        html: layout(
          "Access restored",
          `<p>Hi ${name},</p>
           <p>Payment for <strong>${project}</strong> is current again. Access has been restored.</p>
           ${invoiceLink}`
        ),
      };
    default: {
      const _exhaustive: never = kind;
      throw new Error(`Unknown email kind: ${_exhaustive}`);
    }
  }
}

export function formatUsdCents(cents: number, currency = "usd"): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(cents / 100);
  } catch {
    return `$${(cents / 100).toFixed(2)}`;
  }
}

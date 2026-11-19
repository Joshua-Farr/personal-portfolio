import {
  getBillingEmailDryRun,
  getResendApiKey,
  getResendFromEmail,
} from "./env";

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  /** Optional idempotency key forwarded to Resend when present. */
  idempotencyKey?: string;
}

export type SendEmailResult =
  | { id: string; dryRun?: false }
  | { skipped: true; reason: string; dryRun?: boolean };

/**
 * Send transactional email via Resend API.
 * Respects BILLING_EMAIL_DRY_RUN (default true) and missing API key.
 */
export async function sendEmail(
  input: SendEmailInput
): Promise<SendEmailResult> {
  const apiKey = getResendApiKey();
  if (!apiKey) {
    return { skipped: true, reason: "RESEND_API_KEY not configured" };
  }

  if (getBillingEmailDryRun()) {
    console.log(
      `[resend] dry-run skip to=${input.to} subject=${JSON.stringify(input.subject)}`
    );
    return {
      skipped: true,
      reason: "BILLING_EMAIL_DRY_RUN (default true)",
      dryRun: true,
    };
  }

  const from = getResendFromEmail();
  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
  if (input.idempotencyKey) {
    headers["Idempotency-Key"] = input.idempotencyKey;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers,
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: input.subject,
      html: input.html,
    }),
  });

  const body = (await res.json().catch(() => ({}))) as {
    id?: string;
    message?: string;
  };

  if (!res.ok) {
    throw new Error(
      `Resend error ${res.status}: ${body.message ?? JSON.stringify(body)}`
    );
  }

  if (!body.id) {
    throw new Error("Resend response missing id");
  }

  return { id: body.id };
}

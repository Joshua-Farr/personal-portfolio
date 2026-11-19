import { getResendApiKey, getResendFromEmail } from "./env";

/**
 * Resend scaffold — no customer emails sent in Phase A.
 * Wire templates in Phase D; keep secret reserved.
 */
export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(
  input: SendEmailInput
): Promise<{ id: string } | { skipped: true; reason: string }> {
  const apiKey = getResendApiKey();
  if (!apiKey) {
    return { skipped: true, reason: "RESEND_API_KEY not configured" };
  }

  // Phase A: do not send. Callers should treat this as a no-op until Phase D.
  void getResendFromEmail();
  void input;
  return {
    skipped: true,
    reason: "Phase A scaffold — transactional email not enabled yet",
  };
}

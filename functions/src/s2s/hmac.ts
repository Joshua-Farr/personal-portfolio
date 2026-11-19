import crypto from "node:crypto";

/**
 * Metafy-compatible HMAC (same algorithm Codex uses in verifyMetafyWebhookSignature):
 * @see Joshua-Farr/dojo-codex functions/src/metafy/verifyWebhook.ts
 * @see https://dev.metafy.gg/api-reference/v1/webhooks
 *
 * Headers:
 * - X-Webhook-Timestamp — ISO8601 when the request was signed
 * - X-Webhook-Signature — sha256=<hex> of HMAC-SHA256(secret, `{timestamp}.{rawBody}`)
 *
 * Codex receiver can reuse verifyMetafyWebhookSignature with BILLING_S2S_HMAC_SECRET.
 */

export const BILLING_S2S_TIMESTAMP_HEADER = "X-Webhook-Timestamp";
export const BILLING_S2S_SIGNATURE_HEADER = "X-Webhook-Signature";

export function signMetafyStyleBody(
  secret: string,
  timestampIso: string,
  rawBody: string
): string {
  const message = `${timestampIso}.${rawBody}`;
  return (
    "sha256=" +
    crypto.createHmac("sha256", secret).update(message, "utf8").digest("hex")
  );
}

/** Pure helper for unit tests — mirrors Codex verify logic. */
export function verifyMetafyStyleSignature(
  rawBody: Buffer,
  signatureHeader: string | undefined,
  timestampHeader: string | undefined,
  secret: string,
  maxSkewMs = 5 * 60 * 1000
): { ok: boolean; reason?: string } {
  if (!secret) return { ok: false, reason: "missing_secret" };
  if (!signatureHeader?.trim()) return { ok: false, reason: "missing_signature" };
  if (!timestampHeader?.trim()) return { ok: false, reason: "missing_timestamp" };

  const timestamp = timestampHeader.trim();
  const eventTime = new Date(timestamp);
  if (Number.isNaN(eventTime.getTime())) {
    return { ok: false, reason: "invalid_timestamp" };
  }
  if (Math.abs(Date.now() - eventTime.getTime()) > maxSkewMs) {
    return { ok: false, reason: "timestamp_stale" };
  }

  const expected = signMetafyStyleBody(
    secret,
    timestamp,
    rawBody.toString("utf8")
  );
  const provided = signatureHeader.trim();
  if (provided.length !== expected.length) {
    return { ok: false, reason: "signature_mismatch" };
  }
  try {
    const a = Buffer.from(provided, "utf8");
    const b = Buffer.from(expected, "utf8");
    if (!crypto.timingSafeEqual(a, b)) {
      return { ok: false, reason: "signature_mismatch" };
    }
  } catch {
    return { ok: false, reason: "signature_mismatch" };
  }
  return { ok: true };
}

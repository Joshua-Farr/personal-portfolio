import {
  BILLING_S2S_SIGNATURE_HEADER,
  BILLING_S2S_TIMESTAMP_HEADER,
  signMetafyStyleBody,
} from "./hmac";
import { getBillingS2sHmacSecret } from "../_shared/env";

/**
 * Outbound S2S client: billing Firebase → Codex HTTP endpoint only.
 * Never initializes dojo-codex Admin SDK / Auth / Firestore.
 */

export type BillingAccessState = "active" | "suspended";

export interface CodexBillingStatusPayload {
  /** Idempotency key for Codex billing_s2s_events (or equivalent). */
  eventId: string;
  /** Site-level billing gate — updates only billing* fields on Codex. */
  accessState: BillingAccessState;
  reason?: string;
  projectSlug?: string;
  subscriptionStatus?: string;
  occurredAt: string;
}

export interface CodexBillingNotifyResult {
  ok: boolean;
  dryRun: boolean;
  httpStatus: number | null;
  eventId: string;
  errorMessage: string | null;
  responseBodyPreview: string | null;
}

export interface PostCodexBillingStatusInput {
  baseUrl: string;
  payload: CodexBillingStatusPayload;
  /** When true, sign + log but do not HTTP POST (safe default until dry-run approved). */
  dryRun?: boolean;
  hmacSecret?: string;
  fetchImpl?: typeof fetch;
}

export async function postCodexBillingStatus(
  input: PostCodexBillingStatusInput
): Promise<CodexBillingNotifyResult> {
  const secret = input.hmacSecret ?? getBillingS2sHmacSecret();
  if (!secret) {
    return {
      ok: false,
      dryRun: !!input.dryRun,
      httpStatus: null,
      eventId: input.payload.eventId,
      errorMessage: "BILLING_S2S_HMAC_SECRET not configured",
      responseBodyPreview: null,
    };
  }

  const rawBody = JSON.stringify(input.payload);
  const timestampIso = new Date().toISOString();
  const signature = signMetafyStyleBody(secret, timestampIso, rawBody);

  if (input.dryRun) {
    return {
      ok: true,
      dryRun: true,
      httpStatus: null,
      eventId: input.payload.eventId,
      errorMessage: null,
      responseBodyPreview: null,
    };
  }

  const fetchFn = input.fetchImpl ?? fetch;
  try {
    const res = await fetchFn(input.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        [BILLING_S2S_TIMESTAMP_HEADER]: timestampIso,
        [BILLING_S2S_SIGNATURE_HEADER]: signature,
      },
      body: rawBody,
    });

    const text = await res.text().catch(() => "");
    return {
      ok: res.ok,
      dryRun: false,
      httpStatus: res.status,
      eventId: input.payload.eventId,
      errorMessage: res.ok ? null : `HTTP ${res.status}`,
      responseBodyPreview: text.slice(0, 500) || null,
    };
  } catch (err) {
    return {
      ok: false,
      dryRun: false,
      httpStatus: null,
      eventId: input.payload.eventId,
      errorMessage: err instanceof Error ? err.message : "fetch_failed",
      responseBodyPreview: null,
    };
  }
}

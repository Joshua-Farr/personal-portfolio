import { createHash, randomUUID } from "node:crypto";
import { db } from "../_shared/admin";
import {
  COLLECTIONS,
  ProjectIntegrationDoc,
  SubscriptionStatus,
} from "../types/models";
import { getBillingS2sDryRun, getBillingS2sHmacSecret } from "../_shared/env";
import {
  BillingAccessState,
  CodexBillingStatusPayload,
  postCodexBillingStatus,
} from "./codexBilling";
export {
  mapSubscriptionStatusToAccessState,
  shouldNotifyAccessTransition,
} from "./accessState";

const MAX_ATTEMPTS = 3;

async function loadCodexIntegrationsForProject(
  projectId: string
): Promise<Array<ProjectIntegrationDoc & { id: string }>> {
  const snap = await db()
    .collection(COLLECTIONS.projectIntegrations)
    .where("projectId", "==", projectId)
    .where("type", "==", "codex_billing_access")
    .where("enabled", "==", true)
    .get();

  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as ProjectIntegrationDoc),
  }));
}

async function writeAccessEvent(params: {
  eventId: string;
  projectId: string;
  integrationId: string;
  payload: CodexBillingStatusPayload;
  httpStatus: number | null;
  success: boolean;
  errorMessage: string | null;
  dryRun: boolean;
  attempt: number;
}): Promise<void> {
  await db()
    .collection(COLLECTIONS.accessEvents)
    .doc(params.eventId)
    .set(
      {
        projectId: params.projectId,
        integrationId: params.integrationId,
        eventId: params.eventId,
        direction: "outbound",
        payloadSummary: {
          accessState: params.payload.accessState,
          reason: params.payload.reason ?? null,
          projectSlug: params.payload.projectSlug ?? null,
          subscriptionStatus: params.payload.subscriptionStatus ?? null,
          dryRun: params.dryRun,
          attempt: params.attempt,
        },
        httpStatus: params.httpStatus,
        success: params.success,
        errorMessage: params.errorMessage,
        createdAt: new Date(),
      },
      { merge: true }
    );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface NotifyProjectBillingAccessInput {
  projectId: string;
  accessState: BillingAccessState;
  reason: string;
  subscriptionStatus?: SubscriptionStatus;
  /** Stable id for retries — defaults to hash of project+state+reason slice + uuid. */
  eventId?: string;
  projectSlug?: string;
}

/**
 * Posts site-level billing access to enabled Codex integrations.
 * Respects integration.enabled + BILLING_S2S_DRY_RUN (default dry-run when unset? — we use explicit env).
 * Does NOT touch production unless integration is enabled AND dry-run is false.
 */
export async function notifyProjectBillingAccess(
  input: NotifyProjectBillingAccessInput
): Promise<{ notified: number; results: unknown[] }> {
  const integrations = await loadCodexIntegrationsForProject(input.projectId);
  if (integrations.length === 0) {
    console.log(
      `[s2s] no enabled codex_billing_access integrations for project ${input.projectId}`
    );
    return { notified: 0, results: [] };
  }

  const dryRun = getBillingS2sDryRun();
  const secret = getBillingS2sHmacSecret();
  const results: unknown[] = [];
  let notified = 0;

  for (const integration of integrations) {
    if (integration.hmacSecretEnvKey !== "BILLING_S2S_HMAC_SECRET") {
      console.warn(
        `[s2s] unsupported hmacSecretEnvKey=${integration.hmacSecretEnvKey} on ${integration.id}`
      );
    }

    const eventId =
      input.eventId ??
      `billing_${createHash("sha256")
        .update(
          `${input.projectId}:${input.accessState}:${input.reason}:${randomUUID()}`
        )
        .digest("hex")
        .slice(0, 24)}`;

    const payload: CodexBillingStatusPayload = {
      eventId,
      accessState: input.accessState,
      reason: input.reason,
      projectSlug: input.projectSlug,
      subscriptionStatus: input.subscriptionStatus,
      occurredAt: new Date().toISOString(),
    };

    let lastResult = await postCodexBillingStatus({
      baseUrl: integration.baseUrl,
      payload,
      dryRun,
      hmacSecret: secret,
    });

    await writeAccessEvent({
      eventId: `${eventId}_a1`,
      projectId: input.projectId,
      integrationId: integration.id,
      payload,
      httpStatus: lastResult.httpStatus,
      success: lastResult.ok,
      errorMessage: lastResult.errorMessage,
      dryRun: lastResult.dryRun,
      attempt: 1,
    });

    for (let attempt = 2; attempt <= MAX_ATTEMPTS && !lastResult.ok && !dryRun; attempt++) {
      await sleep(250 * attempt);
      lastResult = await postCodexBillingStatus({
        baseUrl: integration.baseUrl,
        payload,
        dryRun: false,
        hmacSecret: secret,
      });
      await writeAccessEvent({
        eventId: `${eventId}_a${attempt}`,
        projectId: input.projectId,
        integrationId: integration.id,
        payload,
        httpStatus: lastResult.httpStatus,
        success: lastResult.ok,
        errorMessage: lastResult.errorMessage,
        dryRun: false,
        attempt,
      });
    }

    if (lastResult.ok) notified += 1;
    results.push({
      integrationId: integration.id,
      ...lastResult,
    });
  }

  return { notified, results };
}

/**
 * Phase D transactional email orchestration.
 * Dedupes via `emailEvents/{id}`; respects policy.sendTransactionalEmail + Resend dry-run.
 */

import { db } from "../_shared/admin";
import { sendEmail } from "../_shared/resend";
import { loadBillingFailurePolicy } from "../_shared/billingPolicy";
import {
  COLLECTIONS,
  ClientDoc,
  ProjectDoc,
  SubscriptionDoc,
} from "../types/models";
import {
  formatUsdCents,
  renderTransactionalEmail,
  TransactionalEmailKind,
  TemplateVars,
} from "./templates";

async function alreadySent(eventId: string): Promise<boolean> {
  const snap = await db().collection(COLLECTIONS.emailEvents).doc(eventId).get();
  return snap.exists;
}

async function recordEmailEvent(params: {
  eventId: string;
  kind: TransactionalEmailKind;
  to: string;
  subject: string;
  success: boolean;
  skipped: boolean;
  dryRun: boolean;
  providerId: string | null;
  errorMessage: string | null;
  meta?: Record<string, unknown>;
}): Promise<void> {
  await db()
    .collection(COLLECTIONS.emailEvents)
    .doc(params.eventId)
    .set({
      eventId: params.eventId,
      kind: params.kind,
      to: params.to,
      subject: params.subject,
      success: params.success,
      skipped: params.skipped,
      dryRun: params.dryRun,
      providerId: params.providerId,
      errorMessage: params.errorMessage,
      meta: params.meta ?? {},
      createdAt: new Date(),
    });
}

export async function sendTransactionalEmail(params: {
  eventId: string;
  kind: TransactionalEmailKind;
  to: string;
  vars: TemplateVars;
  meta?: Record<string, unknown>;
}): Promise<{ sent: boolean; skipped: boolean; reason?: string }> {
  const policy = await loadBillingFailurePolicy();
  if (!policy.sendTransactionalEmail) {
    await recordEmailEvent({
      eventId: params.eventId,
      kind: params.kind,
      to: params.to,
      subject: "(policy disabled)",
      success: false,
      skipped: true,
      dryRun: false,
      providerId: null,
      errorMessage: null,
      meta: { ...params.meta, reason: "sendTransactionalEmail=false" },
    });
    return { sent: false, skipped: true, reason: "policy_disabled" };
  }

  if (await alreadySent(params.eventId)) {
    return { sent: false, skipped: true, reason: "duplicate" };
  }

  const rendered = renderTransactionalEmail(params.kind, params.vars);

  try {
    const result = await sendEmail({
      to: params.to,
      subject: rendered.subject,
      html: rendered.html,
      idempotencyKey: params.eventId,
    });

    if ("skipped" in result && result.skipped) {
      await recordEmailEvent({
        eventId: params.eventId,
        kind: params.kind,
        to: params.to,
        subject: rendered.subject,
        success: true,
        skipped: true,
        dryRun: !!result.dryRun,
        providerId: null,
        errorMessage: result.reason,
        meta: params.meta,
      });
      return { sent: false, skipped: true, reason: result.reason };
    }

    await recordEmailEvent({
      eventId: params.eventId,
      kind: params.kind,
      to: params.to,
      subject: rendered.subject,
      success: true,
      skipped: false,
      dryRun: false,
      providerId: "id" in result ? result.id : null,
      errorMessage: null,
      meta: params.meta,
    });
    return { sent: true, skipped: false };
  } catch (err) {
    const message = err instanceof Error ? err.message : "send_failed";
    await recordEmailEvent({
      eventId: params.eventId,
      kind: params.kind,
      to: params.to,
      subject: rendered.subject,
      success: false,
      skipped: false,
      dryRun: false,
      providerId: null,
      errorMessage: message,
      meta: params.meta,
    });
    console.error(`[email] failed ${params.kind} → ${params.to}:`, message);
    return { sent: false, skipped: false, reason: message };
  }
}

async function loadClient(clientId: string): Promise<ClientDoc | null> {
  const snap = await db().collection(COLLECTIONS.clients).doc(clientId).get();
  if (!snap.exists) return null;
  return snap.data() as ClientDoc;
}

async function loadProject(projectId: string | null): Promise<ProjectDoc | null> {
  if (!projectId) return null;
  const snap = await db().collection(COLLECTIONS.projects).doc(projectId).get();
  if (!snap.exists) return null;
  return snap.data() as ProjectDoc;
}

export async function emailForSubscriptionEvent(params: {
  kind: Extract<
    TransactionalEmailKind,
    "grace" | "suspension" | "reactivation"
  >;
  subscriptionId: string;
  /** Stable idempotency key (e.g. graceStartedAt ISO day). */
  dedupeKey: string;
  gracePeriodDays?: number;
  invoiceUrl?: string | null;
  amountCents?: number;
  currency?: string;
}): Promise<void> {
  const subSnap = await db()
    .collection(COLLECTIONS.subscriptions)
    .doc(params.subscriptionId)
    .get();
  if (!subSnap.exists) return;
  const sub = subSnap.data() as SubscriptionDoc;
  const client = await loadClient(sub.clientId);
  if (!client?.billingEmail) return;
  const project = await loadProject(sub.projectId);

  await sendTransactionalEmail({
    eventId: `email_${params.kind}_${params.subscriptionId}_${params.dedupeKey}`,
    kind: params.kind,
    to: client.billingEmail,
    vars: {
      clientName: client.name,
      projectName: project?.name,
      gracePeriodDays: params.gracePeriodDays,
      invoiceUrl: params.invoiceUrl,
      amountLabel:
        params.amountCents !== undefined
          ? formatUsdCents(params.amountCents, params.currency ?? "usd")
          : undefined,
    },
    meta: { subscriptionId: params.subscriptionId },
  });
}

export async function emailForInvoiceEvent(params: {
  kind: Extract<
    TransactionalEmailKind,
    "invoice" | "payment_succeeded" | "payment_failed"
  >;
  clientId: string;
  projectId?: string | null;
  invoiceDocId: string;
  amountCents: number;
  currency: string;
  hostedInvoiceUrl?: string | null;
  /** Stable suffix for idempotency (e.g. stripe event id or status). */
  dedupeKey: string;
}): Promise<void> {
  const client = await loadClient(params.clientId);
  if (!client?.billingEmail) return;
  const project = await loadProject(params.projectId ?? null);

  await sendTransactionalEmail({
    eventId: `email_${params.kind}_${params.invoiceDocId}_${params.dedupeKey}`,
    kind: params.kind,
    to: client.billingEmail,
    vars: {
      clientName: client.name,
      projectName: project?.name,
      amountLabel: formatUsdCents(params.amountCents, params.currency),
      invoiceUrl: params.hostedInvoiceUrl,
    },
    meta: {
      invoiceDocId: params.invoiceDocId,
      clientId: params.clientId,
    },
  });
}

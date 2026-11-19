import Stripe from "stripe";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "./admin";
import {
  COLLECTIONS,
  InvoiceKind,
  InvoiceStatus,
  PaymentStatus,
  PreferredPaymentMethod,
  SubscriptionStatus,
} from "../types/models";

export function mapStripeSubscriptionStatus(
  status: Stripe.Subscription.Status
): SubscriptionStatus {
  switch (status) {
    case "incomplete":
    case "incomplete_expired":
      return "incomplete";
    case "trialing":
      return "trialing";
    case "active":
      return "active";
    case "past_due":
      return "past_due";
    case "unpaid":
      return "unpaid";
    case "canceled":
      return "canceled";
    case "paused":
      return "scheduled";
    default:
      return "incomplete";
  }
}

export function mapStripeInvoiceStatus(
  status: Stripe.Invoice.Status | null
): InvoiceStatus {
  switch (status) {
    case "draft":
      return "draft";
    case "open":
      return "open";
    case "paid":
      return "paid";
    case "void":
      return "void";
    case "uncollectible":
      return "uncollectible";
    default:
      return "draft";
  }
}

/**
 * Subscription invoices have a subscription id (or billing_reason subscription_*).
 * One-offs do not — keep these kinds distinct in Firestore.
 */
export function resolveInvoiceKind(invoice: Stripe.Invoice): InvoiceKind {
  const metaKind = invoice.metadata?.kind;
  if (metaKind === "one_time") return "one_time";
  if (metaKind === "subscription") return "subscription";

  const subscriptionId =
    typeof invoice.subscription === "string"
      ? invoice.subscription
      : invoice.subscription?.id;
  if (subscriptionId) return "subscription";

  const reason = invoice.billing_reason;
  if (
    reason === "subscription_create" ||
    reason === "subscription_cycle" ||
    reason === "subscription_update" ||
    reason === "subscription_threshold"
  ) {
    return "subscription";
  }

  return "one_time";
}

export function mapPaymentMethodType(
  type: string | null | undefined
): PreferredPaymentMethod | "unknown" {
  if (type === "us_bank_account" || type === "ach_debit") return "ach";
  if (type === "card") return "card";
  return "unknown";
}

function unixToDate(seconds: number | null | undefined): Date | null {
  if (seconds === null || seconds === undefined) return null;
  return new Date(seconds * 1000);
}

async function findClientIdByStripeCustomer(
  customerId: string | null | undefined
): Promise<string | null> {
  if (!customerId) return null;
  const snap = await db()
    .collection(COLLECTIONS.clients)
    .where("stripeCustomerId", "==", customerId)
    .limit(1)
    .get();
  if (snap.empty) return null;
  return snap.docs[0]!.id;
}

type DocData = Record<string, unknown>;

async function findSubscriptionDocByStripeId(
  stripeSubscriptionId: string
): Promise<{ id: string; data: DocData } | null> {
  const snap = await db()
    .collection(COLLECTIONS.subscriptions)
    .where("stripeSubscriptionId", "==", stripeSubscriptionId)
    .limit(1)
    .get();
  if (!snap.empty) {
    return { id: snap.docs[0]!.id, data: snap.docs[0]!.data() as DocData };
  }
  return null;
}

async function findInvoiceDocByStripeId(
  stripeInvoiceId: string
): Promise<{ id: string; data: DocData } | null> {
  const snap = await db()
    .collection(COLLECTIONS.invoices)
    .where("stripeInvoiceId", "==", stripeInvoiceId)
    .limit(1)
    .get();
  if (!snap.empty) {
    return { id: snap.docs[0]!.id, data: snap.docs[0]!.data() as DocData };
  }
  return null;
}

export interface SyncSubscriptionResult {
  docId: string;
  projectId: string | null;
  previousStatus: SubscriptionStatus | null;
  nextStatus: SubscriptionStatus;
}

export async function syncSubscriptionFromStripe(
  subscription: Stripe.Subscription
): Promise<SyncSubscriptionResult> {
  const meta = subscription.metadata ?? {};
  const stripeId = subscription.id;
  const existing = await findSubscriptionDocByStripeId(stripeId);

  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  const clientId =
    meta.firestoreClientId ||
    (typeof existing?.data.clientId === "string"
      ? existing.data.clientId
      : null) ||
    (await findClientIdByStripeCustomer(customerId));

  if (!clientId) {
    throw new Error(
      `Cannot sync subscription ${stripeId}: missing firestore clientId`
    );
  }

  const projectId =
    meta.firestoreProjectId ||
    (typeof existing?.data.projectId === "string"
      ? existing.data.projectId
      : null);
  const serviceId =
    meta.firestoreServiceId ||
    (typeof existing?.data.serviceId === "string"
      ? existing.data.serviceId
      : null);
  const docId =
    meta.firestoreSubscriptionId || existing?.id || `sub_${stripeId}`;

  const previousStatus =
    typeof existing?.data.status === "string"
      ? (existing.data.status as SubscriptionStatus)
      : null;
  const nextStatus = mapStripeSubscriptionStatus(subscription.status);

  const now = new Date();
  const payload = {
    clientId,
    projectId,
    serviceId,
    stripeSubscriptionId: stripeId,
    status: nextStatus,
    currentPeriodStart: unixToDate(subscription.current_period_start),
    currentPeriodEnd: unixToDate(subscription.current_period_end),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    updatedAt: now,
    ...(existing ? {} : { createdAt: now }),
  };

  await db()
    .collection(COLLECTIONS.subscriptions)
    .doc(docId)
    .set(payload, { merge: true });

  return { docId, projectId, previousStatus, nextStatus };
}

export async function syncInvoiceFromStripe(
  invoice: Stripe.Invoice
): Promise<string> {
  const stripeId = invoice.id;
  const existing = await findInvoiceDocByStripeId(stripeId);
  const meta = invoice.metadata ?? {};
  const kind = resolveInvoiceKind(invoice);

  const customerId =
    typeof invoice.customer === "string"
      ? invoice.customer
      : invoice.customer?.id ?? null;

  const clientId =
    meta.firestoreClientId ||
    (typeof existing?.data.clientId === "string"
      ? existing.data.clientId
      : null) ||
    (await findClientIdByStripeCustomer(customerId));

  if (!clientId) {
    throw new Error(`Cannot sync invoice ${stripeId}: missing firestore clientId`);
  }

  let subscriptionDocId: string | null =
    typeof existing?.data.subscriptionId === "string"
      ? existing.data.subscriptionId
      : null;
  const stripeSubId =
    typeof invoice.subscription === "string"
      ? invoice.subscription
      : invoice.subscription?.id ?? null;

  if (kind === "subscription" && stripeSubId) {
    const sub = await findSubscriptionDocByStripeId(stripeSubId);
    if (sub) {
      subscriptionDocId = sub.id;
    } else if (meta.firestoreSubscriptionId) {
      subscriptionDocId = meta.firestoreSubscriptionId;
    }
  } else if (kind === "one_time") {
    subscriptionDocId = null;
  }

  const projectId =
    meta.firestoreProjectId ||
    (typeof existing?.data.projectId === "string"
      ? existing.data.projectId
      : null);
  const serviceId =
    meta.firestoreServiceId ||
    (typeof existing?.data.serviceId === "string"
      ? existing.data.serviceId
      : null);

  const docId = existing?.id || `inv_${stripeId}`;
  const now = new Date();

  await db()
    .collection(COLLECTIONS.invoices)
    .doc(docId)
    .set(
      {
        clientId,
        projectId,
        serviceId,
        subscriptionId: subscriptionDocId,
        stripeInvoiceId: stripeId,
        kind,
        amountCents: invoice.amount_due ?? invoice.total ?? 0,
        currency: invoice.currency ?? "usd",
        status: mapStripeInvoiceStatus(invoice.status),
        periodStart: unixToDate(invoice.period_start),
        periodEnd: unixToDate(invoice.period_end),
        hostedInvoiceUrl: invoice.hosted_invoice_url ?? null,
        updatedAt: now,
        ...(existing ? {} : { createdAt: now }),
      },
      { merge: true }
    );

  return docId;
}

export async function syncPaymentFromPaymentIntent(
  pi: Stripe.PaymentIntent,
  opts?: { invoiceFirestoreId?: string | null }
): Promise<string | null> {
  const stripePiId = pi.id;
  const meta = pi.metadata ?? {};
  const invoiceStripeId =
    typeof pi.invoice === "string" ? pi.invoice : pi.invoice?.id ?? null;

  let invoiceDocId = opts?.invoiceFirestoreId ?? null;
  if (!invoiceDocId && invoiceStripeId) {
    const inv = await findInvoiceDocByStripeId(invoiceStripeId);
    invoiceDocId = inv?.id ?? null;
  }

  const customerId =
    typeof pi.customer === "string" ? pi.customer : pi.customer?.id ?? null;
  const clientId =
    meta.firestoreClientId ||
    (await findClientIdByStripeCustomer(customerId));

  if (!clientId) {
    console.warn(`Skipping payment sync for ${stripePiId}: no clientId`);
    return null;
  }

  const existingSnap = await db()
    .collection(COLLECTIONS.payments)
    .where("stripePaymentIntentId", "==", stripePiId)
    .limit(1)
    .get();

  const docId = existingSnap.empty
    ? `pay_${stripePiId}`
    : existingSnap.docs[0]!.id;

  let status: PaymentStatus = "pending";
  if (pi.status === "succeeded") status = "succeeded";
  else if (pi.status === "canceled") status = "failed";
  else if (pi.status === "requires_payment_method") status = "failed";

  const methodType =
    typeof pi.payment_method === "object" &&
    pi.payment_method &&
    "type" in pi.payment_method
      ? (pi.payment_method as Stripe.PaymentMethod).type
      : undefined;

  const now = new Date();
  await db()
    .collection(COLLECTIONS.payments)
    .doc(docId)
    .set(
      {
        clientId,
        invoiceId: invoiceDocId,
        stripePaymentIntentId: stripePiId,
        stripeChargeId:
          typeof pi.latest_charge === "string"
            ? pi.latest_charge
            : pi.latest_charge?.id ?? null,
        amountCents: pi.amount,
        currency: pi.currency,
        status,
        method: mapPaymentMethodType(methodType),
        kind: meta.kind === "one_time" ? "one_time" : meta.kind ?? null,
        updatedAt: now,
        ...(existingSnap.empty ? { createdAt: now } : {}),
      },
      { merge: true }
    );

  return docId;
}

export async function markPaymentRefunded(
  charge: Stripe.Charge
): Promise<void> {
  const piId =
    typeof charge.payment_intent === "string"
      ? charge.payment_intent
      : charge.payment_intent?.id ?? null;
  if (!piId) return;

  const snap = await db()
    .collection(COLLECTIONS.payments)
    .where("stripePaymentIntentId", "==", piId)
    .limit(1)
    .get();
  if (snap.empty) return;

  await snap.docs[0]!.ref.set(
    {
      status: "refunded" satisfies PaymentStatus,
      updatedAt: new Date(),
      refundedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
}

import { onRequest } from "firebase-functions/v2/https";
import Stripe from "stripe";
import { getStripe, assertStripeTestMode } from "../_shared/stripe";
import { db, initBillingAdmin } from "../_shared/admin";
import { COLLECTIONS, SubscriptionStatus } from "../types/models";
import {
  markPaymentRefunded,
  syncInvoiceFromStripe,
  syncPaymentFromPaymentIntent,
  syncSubscriptionFromStripe,
} from "../_shared/stripeSync";
import {
  applyBillingRuntimeEnv,
  billingS2sHmacSecret,
  resendApiKey,
  stripeSecretKey,
  stripeWebhookSecret,
} from "../_shared/params";
import {
  applySubscriptionBillingTransition,
  isAchProcessingPayment,
} from "../_shared/billingState";
import { emailForInvoiceEvent } from "../email/sendTransactional";
import {
  decideWebhookClaim,
  shouldReleaseClaimOnFailure,
} from "./webhookIdempotency";

async function loadPaymentIntentForInvoice(
  invoice: Stripe.Invoice
): Promise<Stripe.PaymentIntent | null> {
  const piRef = invoice.payment_intent;
  if (!piRef) return null;
  if (typeof piRef === "object") return piRef;
  try {
    return await getStripe().paymentIntents.retrieve(piRef);
  } catch {
    return null;
  }
}

async function applyBillingAfterSubscriptionSync(params: {
  docId: string;
  previousStatus: SubscriptionStatus | null;
  nextStatus: SubscriptionStatus;
  achProcessing?: boolean;
}): Promise<void> {
  try {
    const result = await applySubscriptionBillingTransition({
      subscriptionId: params.docId,
      previousStripeStatus: params.previousStatus,
      nextStripeStatus: params.nextStatus,
      achProcessing: params.achProcessing,
    });
    console.log(
      `[stripeWebhook] billingState action=${result.decision.action} local=${result.decision.nextLocalState} notified=${result.notified} reason=${result.decision.reason}`
    );
  } catch (err) {
    console.error(
      "[stripeWebhook] billingState failed:",
      err instanceof Error ? err.message : err
    );
  }
}

async function findSubscriptionDocIdForInvoice(
  invoice: Stripe.Invoice
): Promise<string | null> {
  const stripeSubId =
    typeof invoice.subscription === "string"
      ? invoice.subscription
      : invoice.subscription?.id ?? null;
  if (!stripeSubId) {
    return invoice.metadata?.firestoreSubscriptionId ?? null;
  }
  const snap = await db()
    .collection(COLLECTIONS.subscriptions)
    .where("stripeSubscriptionId", "==", stripeSubId)
    .limit(1)
    .get();
  if (!snap.empty) return snap.docs[0]!.id;
  return invoice.metadata?.firestoreSubscriptionId ?? null;
}

async function handleStripeEvent(event: Stripe.Event): Promise<boolean> {
  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const sync = await syncSubscriptionFromStripe(subscription);

      let achProcessing = false;
      const latest = subscription.latest_invoice;
      if (latest && typeof latest === "object" && "payment_intent" in latest) {
        const pi = latest.payment_intent;
        if (pi && typeof pi === "object") {
          achProcessing = isAchProcessingPayment(pi);
        }
      }

      await applyBillingAfterSubscriptionSync({
        docId: sync.docId,
        previousStatus: sync.previousStatus,
        nextStatus: sync.nextStatus,
        achProcessing,
      });
      return true;
    }
    case "invoice.created":
    case "invoice.updated":
    case "invoice.finalized":
    case "invoice.paid":
    case "invoice.payment_failed":
    case "invoice.voided":
    case "invoice.marked_uncollectible": {
      const invoice = event.data.object as Stripe.Invoice;
      const invoiceDocId = await syncInvoiceFromStripe(invoice);

      const amountCents = invoice.amount_due ?? invoice.total ?? 0;
      const currency = invoice.currency ?? "usd";
      const clientId =
        invoice.metadata?.firestoreClientId ??
        (
          await db().collection(COLLECTIONS.invoices).doc(invoiceDocId).get()
        ).data()?.clientId;
      const projectId =
        invoice.metadata?.firestoreProjectId ??
        (
          await db().collection(COLLECTIONS.invoices).doc(invoiceDocId).get()
        ).data()?.projectId;

      if (typeof clientId === "string") {
        if (event.type === "invoice.finalized" || event.type === "invoice.created") {
          if (invoice.status === "open") {
            await emailForInvoiceEvent({
              kind: "invoice",
              clientId,
              projectId: typeof projectId === "string" ? projectId : null,
              invoiceDocId,
              amountCents,
              currency,
              hostedInvoiceUrl: invoice.hosted_invoice_url,
              dedupeKey: event.id,
            });
          }
        } else if (event.type === "invoice.paid") {
          await emailForInvoiceEvent({
            kind: "payment_succeeded",
            clientId,
            projectId: typeof projectId === "string" ? projectId : null,
            invoiceDocId,
            amountCents: invoice.amount_paid ?? amountCents,
            currency,
            hostedInvoiceUrl: invoice.hosted_invoice_url,
            dedupeKey: event.id,
          });
        } else if (event.type === "invoice.payment_failed") {
          const pi = await loadPaymentIntentForInvoice(invoice);
          if (isAchProcessingPayment(pi)) {
            console.log(
              `[stripeWebhook] invoice.payment_failed ignored — ACH processing (${invoice.id})`
            );
          } else {
            await emailForInvoiceEvent({
              kind: "payment_failed",
              clientId,
              projectId: typeof projectId === "string" ? projectId : null,
              invoiceDocId,
              amountCents,
              currency,
              hostedInvoiceUrl: invoice.hosted_invoice_url,
              dedupeKey: event.id,
            });
          }
        }
      }

      // Drive access state from linked subscription after paid / failed / uncollectible.
      if (
        event.type === "invoice.paid" ||
        event.type === "invoice.payment_failed" ||
        event.type === "invoice.marked_uncollectible"
      ) {
        const subDocId = await findSubscriptionDocIdForInvoice(invoice);
        if (subDocId) {
          const subSnap = await db()
            .collection(COLLECTIONS.subscriptions)
            .doc(subDocId)
            .get();
          const subData = subSnap.data();
          const stripeSubId =
            typeof invoice.subscription === "string"
              ? invoice.subscription
              : invoice.subscription?.id ??
                (typeof subData?.stripeSubscriptionId === "string"
                  ? subData.stripeSubscriptionId
                  : null);

          if (stripeSubId) {
            const remote = await getStripe().subscriptions.retrieve(stripeSubId);
            const sync = await syncSubscriptionFromStripe(remote);
            const pi = await loadPaymentIntentForInvoice(invoice);
            await applyBillingAfterSubscriptionSync({
              docId: sync.docId,
              previousStatus: sync.previousStatus,
              nextStatus: sync.nextStatus,
              achProcessing:
                event.type === "invoice.payment_failed"
                  ? isAchProcessingPayment(pi)
                  : false,
            });
          } else if (event.type === "invoice.paid" && subSnap.exists) {
            // No Stripe sub id — still attempt reactivate using local status if healthy path.
            const status = (subData?.status as SubscriptionStatus) ?? "active";
            await applyBillingAfterSubscriptionSync({
              docId: subDocId,
              previousStatus: status,
              nextStatus: status === "canceled" ? "canceled" : "active",
            });
          }
        }
      }
      return true;
    }
    case "payment_intent.succeeded":
    case "payment_intent.payment_failed":
    case "payment_intent.canceled":
    case "payment_intent.processing": {
      await syncPaymentFromPaymentIntent(
        event.data.object as Stripe.PaymentIntent
      );
      return true;
    }
    case "charge.refunded": {
      await markPaymentRefunded(event.data.object as Stripe.Charge);
      return true;
    }
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log(
        `[stripeWebhook] checkout.session.completed ${session.id} kind=${session.metadata?.kind ?? session.mode}`
      );
      return true;
    }
    default:
      console.log(`[stripeWebhook] ignored type ${event.type}`);
      return false;
  }
}

/**
 * Stripe webhook with signature verification, test-mode enforcement,
 * idempotent event recording, Firestore sync, Phase D billing state machine,
 * Resend transactional emails, and Codex S2S notify on suspend/restore only.
 */
export const stripeWebhook = onRequest(
  {
    secrets: [
      stripeSecretKey,
      stripeWebhookSecret,
      billingS2sHmacSecret,
      resendApiKey,
    ],
    cors: false,
  },
  async (req, res) => {
    initBillingAdmin();

    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    const signature = req.headers["stripe-signature"];
    if (!signature || typeof signature !== "string") {
      res.status(400).send("Missing stripe-signature header");
      return;
    }

    const rawBody = (req as typeof req & { rawBody?: Buffer }).rawBody;
    if (!rawBody) {
      res.status(400).send("Missing raw body for Stripe signature verification");
      return;
    }

    let event: Stripe.Event;
    try {
      applyBillingRuntimeEnv({
        includeWebhookSecret: true,
        includeS2s: true,
        includeResend: true,
      });

      event = getStripe().webhooks.constructEvent(
        rawBody,
        signature,
        stripeWebhookSecret.value()
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Invalid signature";
      console.error("Stripe webhook signature failed:", message);
      res.status(400).send(`Webhook Error: ${message}`);
      return;
    }

    try {
      assertStripeTestMode(event);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Live mode rejected";
      console.error(message);
      res.status(400).send(message);
      return;
    }

    const eventsRef = db().collection(COLLECTIONS.stripeWebhookEvents);
    const eventRef = eventsRef.doc(event.id);

    try {
      const claimed = await db().runTransaction(async (tx) => {
        const existing = await tx.get(eventRef);
        const decision = decideWebhookClaim(existing.exists);
        if (decision.action === "skip_duplicate") {
          return false;
        }
        tx.set(eventRef, {
          eventId: event.id,
          type: event.type,
          processedAt: new Date(),
          livemode: event.livemode,
          status: "processing",
          phase: "D",
        });
        return true;
      });

      if (!claimed) {
        res.json({ received: true, duplicate: true });
        return;
      }

      let handled = false;
      let handlerSucceeded = false;
      try {
        handled = await handleStripeEvent(event);
        handlerSucceeded = true;
      } finally {
        if (shouldReleaseClaimOnFailure(handlerSucceeded)) {
          await eventRef.delete().catch(() => undefined);
        }
      }

      await eventRef.set(
        {
          status: "processed",
          handled,
          processedAt: new Date(),
        },
        { merge: true }
      );

      res.json({ received: true, handled, phase: "D" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Handler error";
      console.error(`[stripeWebhook] handler failed for ${event.id}:`, message);
      await eventRef.delete().catch(() => undefined);
      res.status(500).send(message);
    }
  }
);

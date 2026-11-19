import { onRequest } from "firebase-functions/v2/https";
import Stripe from "stripe";
import { getStripe, assertStripeTestMode } from "../_shared/stripe";
import { db, initBillingAdmin } from "../_shared/admin";
import { COLLECTIONS } from "../types/models";
import {
  markPaymentRefunded,
  syncInvoiceFromStripe,
  syncPaymentFromPaymentIntent,
  syncSubscriptionFromStripe,
} from "../_shared/stripeSync";
import {
  applyBillingRuntimeEnv,
  stripeSecretKey,
  stripeWebhookSecret,
} from "../_shared/params";

async function handleStripeEvent(event: Stripe.Event): Promise<boolean> {
  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      await syncSubscriptionFromStripe(
        event.data.object as Stripe.Subscription
      );
      return true;
    }
    case "invoice.created":
    case "invoice.updated":
    case "invoice.finalized":
    case "invoice.paid":
    case "invoice.payment_failed":
    case "invoice.voided":
    case "invoice.marked_uncollectible": {
      await syncInvoiceFromStripe(event.data.object as Stripe.Invoice);
      return true;
    }
    case "payment_intent.succeeded":
    case "payment_intent.payment_failed":
    case "payment_intent.canceled": {
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
 * idempotent event recording, and Firestore sync for subscriptions /
 * invoices / payments.
 */
export const stripeWebhook = onRequest(
  {
    secrets: [stripeSecretKey, stripeWebhookSecret],
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
      applyBillingRuntimeEnv({ includeWebhookSecret: true });

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
        if (existing.exists) {
          return false;
        }
        tx.set(eventRef, {
          eventId: event.id,
          type: event.type,
          processedAt: new Date(),
          livemode: event.livemode,
          status: "processing",
          phase: "B",
        });
        return true;
      });

      if (!claimed) {
        res.json({ received: true, duplicate: true });
        return;
      }

      const handled = await handleStripeEvent(event);

      await eventRef.set(
        {
          status: "processed",
          handled,
          processedAt: new Date(),
        },
        { merge: true }
      );

      res.json({ received: true, handled, phase: "B" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Handler error";
      console.error(`[stripeWebhook] handler failed for ${event.id}:`, message);
      await eventRef.delete().catch(() => undefined);
      res.status(500).send(message);
    }
  }
);

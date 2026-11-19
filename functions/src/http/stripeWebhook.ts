import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import Stripe from "stripe";
import { getStripe, assertStripeTestMode } from "../_shared/stripe";
import { db, initBillingAdmin } from "../_shared/admin";
import { COLLECTIONS } from "../types/models";

const stripeSecretKey = defineSecret("STRIPE_SECRET_KEY");
const stripeWebhookSecret = defineSecret("STRIPE_WEBHOOK_SECRET");

/**
 * Stripe webhook stub with signature verification pattern.
 * Phase B will sync invoice / subscription / payment docs.
 * Rejects live-mode events while we are test-only.
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

    // Raw body is required for signature verification.
    const rawBody = (req as typeof req & { rawBody?: Buffer }).rawBody;
    if (!rawBody) {
      res.status(400).send("Missing raw body for Stripe signature verification");
      return;
    }

    let event: Stripe.Event;
    try {
      // Ensure process.env picks up secrets for getStripe()
      process.env.STRIPE_SECRET_KEY = stripeSecretKey.value();
      process.env.STRIPE_WEBHOOK_SECRET = stripeWebhookSecret.value();

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
    const existing = await eventsRef.doc(event.id).get();
    if (existing.exists) {
      res.json({ received: true, duplicate: true });
      return;
    }

    // Phase A: acknowledge + record idempotency; Phase B handles domain sync.
    await eventsRef.doc(event.id).set({
      eventId: event.id,
      type: event.type,
      processedAt: new Date(),
      livemode: event.livemode,
      phase: "A_stub",
    });

    console.log(`[stripeWebhook] recorded ${event.type} (${event.id})`);
    res.json({ received: true, handled: false, phase: "A" });
  }
);

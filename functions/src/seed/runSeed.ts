/**
 * Seed Impact → One Piece Dojo Codex → $1500/mo from 2027-01-01.
 *
 * Usage (after creating the NEW billing Firebase project and setting GOOGLE_APPLICATION_CREDENTIALS
 * or `firebase login` + project):
 *
 *   cd functions && npm run seed
 *
 * Flags:
 *   --with-stripe   Also create Stripe test Customer / Product / Price / Subscription
 *                   (requires STRIPE_SECRET_KEY=sk_test_…)
 *
 * Does NOT create historical Oct–Dec invoices.
 * Does NOT touch dojo-codex Firebase.
 */

import { initializeApp, getApps, applicationDefault } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { COLLECTIONS } from "../types/models";
import { SEED, seedStartsAtDate, seedStartsAtUnixSeconds } from "./seedConfig";
import {
  createProductAndRecurringPrice,
  createScheduledSubscription,
  createStripeCustomer,
} from "../_shared/stripe";

function init(): void {
  if (getApps().length === 0) {
    initializeApp({ credential: applicationDefault() });
  }
}

async function run(): Promise<void> {
  init();
  const withStripe = process.argv.includes("--with-stripe");
  const firestore = getFirestore();
  const now = Timestamp.now();
  const startsAt = Timestamp.fromDate(seedStartsAtDate());

  console.log("Seeding billing Firestore (dedicated project)…");
  console.log(
    `  Client: ${SEED.client.name} | TEMP email: ${SEED.client.billingEmail}`
  );
  console.log(
    `  Project: ${SEED.project.name} (${SEED.project.slug})`
  );
  console.log(
    `  Service: ${SEED.service.name} $${SEED.service.amountCents / 100}/${SEED.service.interval} from ${SEED.service.startsAtIso}`
  );
  console.log("  Historical invoices: NONE");

  let stripeCustomerId: string | null = null;
  let stripeProductId: string | null = null;
  let stripePriceId: string | null = null;
  let stripeSubscriptionId: string | null = null;

  if (withStripe) {
    if (!process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_")) {
      throw new Error(
        "--with-stripe requires STRIPE_SECRET_KEY starting with sk_test_"
      );
    }
    console.log("Creating Stripe TEST customer / product / price / subscription…");
    const customer = await createStripeCustomer({
      name: SEED.client.name,
      email: SEED.client.billingEmail,
      metadata: {
        firestoreClientId: SEED.client.id,
        billingEmailIsTemporary: "true",
      },
    });
    stripeCustomerId = customer.id;

    const { product, price } = await createProductAndRecurringPrice({
      productName: `${SEED.project.name} — ${SEED.service.name}`,
      amountCents: SEED.service.amountCents,
      currency: SEED.service.currency,
      interval: SEED.service.interval,
      metadata: {
        firestoreServiceId: SEED.service.id,
        firestoreProjectId: SEED.project.id,
      },
    });
    stripeProductId = product.id;
    stripePriceId = price.id;

    const sub = await createScheduledSubscription({
      customerId: customer.id,
      priceId: price.id,
      billingCycleAnchor: seedStartsAtUnixSeconds(),
      metadata: {
        firestoreSubscriptionId: SEED.subscription.id,
        firestoreServiceId: SEED.service.id,
      },
    });
    stripeSubscriptionId = sub.id;
  }

  const batch = firestore.batch();

  batch.set(
    firestore.collection(COLLECTIONS.clients).doc(SEED.client.id),
    {
      name: SEED.client.name,
      billingEmail: SEED.client.billingEmail,
      billingEmailIsTemporary: SEED.client.billingEmailIsTemporary,
      preferredPaymentMethod: SEED.client.preferredPaymentMethod,
      stripeCustomerId,
      notes: SEED.client.notes,
      createdAt: now,
      updatedAt: now,
    },
    { merge: true }
  );

  batch.set(
    firestore.collection(COLLECTIONS.projects).doc(SEED.project.id),
    {
      clientId: SEED.client.id,
      name: SEED.project.name,
      slug: SEED.project.slug,
      status: SEED.project.status,
      description: SEED.project.description,
      createdAt: now,
      updatedAt: now,
    },
    { merge: true }
  );

  batch.set(
    firestore.collection(COLLECTIONS.services).doc(SEED.service.id),
    {
      clientId: SEED.client.id,
      projectId: SEED.project.id,
      name: SEED.service.name,
      amountCents: SEED.service.amountCents,
      currency: SEED.service.currency,
      interval: SEED.service.interval,
      stripeProductId,
      stripePriceId,
      startsAt,
      active: true,
      createdAt: now,
      updatedAt: now,
    },
    { merge: true }
  );

  batch.set(
    firestore
      .collection(COLLECTIONS.subscriptions)
      .doc(SEED.subscription.id),
    {
      clientId: SEED.client.id,
      projectId: SEED.project.id,
      serviceId: SEED.service.id,
      stripeSubscriptionId,
      status: withStripe ? "trialing" : "scheduled",
      currentPeriodStart: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      createdAt: now,
      updatedAt: now,
    },
    { merge: true }
  );

  batch.set(
    firestore
      .collection(COLLECTIONS.projectIntegrations)
      .doc(SEED.integration.id),
    {
      projectId: SEED.project.id,
      type: SEED.integration.type,
      baseUrl: SEED.integration.baseUrl,
      hmacSecretEnvKey: SEED.integration.hmacSecretEnvKey,
      enabled: SEED.integration.enabled,
      notes: SEED.integration.notes,
      createdAt: now,
      updatedAt: now,
    },
    { merge: true }
  );

  await batch.commit();

  console.log("Seed complete.");
  console.log(`  clients/${SEED.client.id}`);
  console.log(`  projects/${SEED.project.id}`);
  console.log(`  services/${SEED.service.id}`);
  console.log(`  subscriptions/${SEED.subscription.id}`);
  console.log(`  projectIntegrations/${SEED.integration.id} (enabled=false)`);
  if (withStripe) {
    console.log(`  Stripe customer: ${stripeCustomerId}`);
    console.log(`  Stripe price: ${stripePriceId}`);
    console.log(`  Stripe subscription: ${stripeSubscriptionId}`);
  } else {
    console.log("  (Firestore only — re-run with --with-stripe for Stripe test objects)");
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

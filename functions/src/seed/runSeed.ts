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
 *   --print-plan    Print planned docs / Stripe objects; no writes
 *
 * Does NOT create historical Oct–Dec invoices.
 * Does NOT touch dojo-codex Firebase.
 * Refuses placeholder / dojo-codex project ids (see assertBillingProject).
 */

import { initializeApp, getApps, applicationDefault } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { COLLECTIONS } from "../types/models";
import { SEED, seedStartsAtDate, seedStartsAtUnixSeconds } from "./seedConfig";
import {
  assertBillingSeedProject,
  resolveFirebaseProjectId,
} from "./assertBillingProject";
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

function printPlan(withStripe: boolean, projectId: string | undefined): void {
  console.log("Seed plan (no writes)…");
  console.log(`  Target Firebase project: ${projectId ?? "(unset — set before real seed)"}`);
  console.log(`  clients/${SEED.client.id} — ${SEED.client.name} <${SEED.client.billingEmail}> (temporary)`);
  console.log(`  projects/${SEED.project.id} — ${SEED.project.slug}`);
  console.log(
    `  services/${SEED.service.id} — $${SEED.service.amountCents / 100}/${SEED.service.interval} from ${SEED.service.startsAtIso}`
  );
  console.log(`  subscriptions/${SEED.subscription.id} — status ${withStripe ? "trialing" : "scheduled"}`);
  console.log(
    `  projectIntegrations/${SEED.integration.id} — enabled=${SEED.integration.enabled}`
  );
  console.log("  system/billingPolicy — gracePeriodDays=5");
  console.log("  Historical invoices: NONE (no Oct–Dec 2026 docs)");
  if (withStripe) {
    console.log("  Stripe TEST: Customer + Product + Price + Subscription (trial_end 2027-01-01)");
  } else {
    console.log("  Stripe: skipped (pass --with-stripe)");
  }
}

async function run(): Promise<void> {
  const withStripe = process.argv.includes("--with-stripe");
  const printOnly = process.argv.includes("--print-plan");
  const resolvedProject = resolveFirebaseProjectId();

  if (printOnly) {
    printPlan(withStripe, resolvedProject);
    return;
  }

  const projectId = assertBillingSeedProject(resolvedProject);
  init();
  const firestore = getFirestore();
  const now = Timestamp.now();
  const startsAt = Timestamp.fromDate(seedStartsAtDate());

  console.log(`Seeding billing Firestore (project=${projectId})…`);
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
  console.log(
    `  Integration enabled=${SEED.integration.enabled} (must stay false until Codex S2S dry-run approved)`
  );

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
      localAccessState: "active",
      graceStartedAt: null,
      suspendedAt: null,
      canceledAt: null,
      lastFailureReason: null,
      lastAccessNotifyState: null,
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

  batch.set(
    firestore.collection(COLLECTIONS.system).doc("billingPolicy"),
    {
      gracePeriodDays: 5,
      autoSuspend: true,
      autoReactivate: true,
      sendTransactionalEmail: true,
      reconcileIntervalHours: 1,
      updatedAt: now,
      notes:
        "Phase D defaults. Override via env BILLING_GRACE_PERIOD_DAYS / BILLING_AUTO_*. Codex S2S still gated by integration.enabled + BILLING_S2S_DRY_RUN.",
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
  console.log(`  system/billingPolicy (gracePeriodDays=5)`);
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

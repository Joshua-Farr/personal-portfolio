import { onCall, HttpsError } from "firebase-functions/v2/https";
import { initBillingAdmin, db } from "../_shared/admin";
import { parseClaims, assertAdmin, setUserRole } from "../_shared/auth";
import { writeAuditLog } from "../_shared/audit";
import { ensureStripeCustomer } from "../_shared/clients";
import { getStripe } from "../_shared/stripe";
import {
  COLLECTIONS,
  type PreferredPaymentMethod,
  type ProjectStatus,
  type BillingInterval,
  type SubscriptionStatus,
} from "../types/models";
import {
  applyBillingRuntimeEnv,
  stripeSecretKey,
} from "../_shared/params";
import { assertPositiveCents } from "../_shared/money";

function requireString(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new HttpsError("invalid-argument", `${field} is required`);
  }
  return value.trim();
}

function optionalString(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string") {
    throw new HttpsError("invalid-argument", "Expected string");
  }
  return value.trim();
}

/**
 * Admin: create or update a client (Firestore). Optionally ensure Stripe Customer.
 */
export const adminUpsertClient = onCall(
  { secrets: [stripeSecretKey] },
  async (request) => {
    initBillingAdmin();
    applyBillingRuntimeEnv();

    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Sign in required.");
    }
    assertAdmin(parseClaims(request.auth.token as Record<string, unknown>));

    const clientId =
      optionalString(request.data?.clientId) ??
      db().collection(COLLECTIONS.clients).doc().id;
    const name = requireString(request.data?.name, "name");
    const billingEmail = requireString(
      request.data?.billingEmail,
      "billingEmail"
    ).toLowerCase();
    const preferredPaymentMethod = (request.data?.preferredPaymentMethod ??
      "ach") as PreferredPaymentMethod;
    if (
      preferredPaymentMethod !== "ach" &&
      preferredPaymentMethod !== "card"
    ) {
      throw new HttpsError(
        "invalid-argument",
        "preferredPaymentMethod must be ach|card"
      );
    }
    const billingEmailIsTemporary = Boolean(
      request.data?.billingEmailIsTemporary ?? false
    );
    const notes = optionalString(request.data?.notes);
    const ensureStripe = Boolean(request.data?.ensureStripeCustomer ?? true);

    const now = new Date();
    const ref = db().collection(COLLECTIONS.clients).doc(clientId);
    const existing = await ref.get();

    await ref.set(
      {
        name,
        billingEmail,
        billingEmailIsTemporary,
        preferredPaymentMethod,
        ...(notes !== undefined ? { notes } : {}),
        updatedAt: now,
        ...(existing.exists
          ? {}
          : {
              stripeCustomerId: null,
              createdAt: now,
            }),
      },
      { merge: true }
    );

    let stripeCustomerId: string | null =
      (existing.data()?.stripeCustomerId as string | null | undefined) ?? null;
    if (ensureStripe) {
      stripeCustomerId = await ensureStripeCustomer(clientId);
    }

    await writeAuditLog({
      actorUid: request.auth.uid,
      action: existing.exists ? "adminUpdateClient" : "adminCreateClient",
      targetType: "client",
      targetId: clientId,
      meta: { name, billingEmail, ensureStripe },
    });

    return { clientId, stripeCustomerId, created: !existing.exists };
  }
);

/**
 * Admin: create or update a project under a client.
 */
export const adminUpsertProject = onCall(async (request) => {
  initBillingAdmin();

  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Sign in required.");
  }
  assertAdmin(parseClaims(request.auth.token as Record<string, unknown>));

  const projectId =
    optionalString(request.data?.projectId) ??
    db().collection(COLLECTIONS.projects).doc().id;
  const clientId = requireString(request.data?.clientId, "clientId");
  const name = requireString(request.data?.name, "name");
  const slug = requireString(request.data?.slug, "slug")
    .toLowerCase()
    .replace(/\s+/g, "-");
  const status = (request.data?.status ?? "active") as ProjectStatus;
  if (!["active", "paused", "archived"].includes(status)) {
    throw new HttpsError(
      "invalid-argument",
      "status must be active|paused|archived"
    );
  }
  const description = optionalString(request.data?.description);

  const clientSnap = await db()
    .collection(COLLECTIONS.clients)
    .doc(clientId)
    .get();
  if (!clientSnap.exists) {
    throw new HttpsError("not-found", `Client ${clientId} not found`);
  }

  const now = new Date();
  const ref = db().collection(COLLECTIONS.projects).doc(projectId);
  const existing = await ref.get();

  await ref.set(
    {
      clientId,
      name,
      slug,
      status,
      ...(description !== undefined ? { description } : {}),
      updatedAt: now,
      ...(existing.exists ? {} : { createdAt: now }),
    },
    { merge: true }
  );

  await writeAuditLog({
    actorUid: request.auth.uid,
    action: existing.exists ? "adminUpdateProject" : "adminCreateProject",
    targetType: "project",
    targetId: projectId,
    meta: { clientId, name, slug, status },
  });

  return { projectId, created: !existing.exists };
});

/**
 * Admin: create or update a recurring/one-off service (Firestore metadata).
 * Stripe Product/Price creation remains seed / Phase B enrollment paths.
 */
export const adminUpsertService = onCall(async (request) => {
  initBillingAdmin();

  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Sign in required.");
  }
  assertAdmin(parseClaims(request.auth.token as Record<string, unknown>));

  const serviceId =
    optionalString(request.data?.serviceId) ??
    db().collection(COLLECTIONS.services).doc().id;
  const clientId = requireString(request.data?.clientId, "clientId");
  const projectId = requireString(request.data?.projectId, "projectId");
  const name = requireString(request.data?.name, "name");
  let amountCents: number;
  try {
    amountCents = assertPositiveCents(request.data?.amountCents);
  } catch {
    throw new HttpsError("invalid-argument", "amountCents must be positive");
  }
  const currency = (
    optionalString(request.data?.currency) ?? "usd"
  ).toLowerCase();
  const interval = (request.data?.interval ?? "month") as BillingInterval;
  if (interval !== "month" && interval !== "year") {
    throw new HttpsError("invalid-argument", "interval must be month|year");
  }
  const active = request.data?.active !== false;
  const startsAtRaw = request.data?.startsAtIso;
  const startsAt =
    typeof startsAtRaw === "string" && startsAtRaw
      ? new Date(startsAtRaw)
      : undefined;
  if (startsAt && Number.isNaN(startsAt.getTime())) {
    throw new HttpsError("invalid-argument", "startsAtIso is invalid");
  }

  const projectSnap = await db()
    .collection(COLLECTIONS.projects)
    .doc(projectId)
    .get();
  if (!projectSnap.exists) {
    throw new HttpsError("not-found", `Project ${projectId} not found`);
  }
  if (projectSnap.data()?.clientId !== clientId) {
    throw new HttpsError(
      "invalid-argument",
      "projectId does not belong to clientId"
    );
  }

  const now = new Date();
  const ref = db().collection(COLLECTIONS.services).doc(serviceId);
  const existing = await ref.get();

  await ref.set(
    {
      clientId,
      projectId,
      name,
      amountCents,
      currency,
      interval,
      active,
      updatedAt: now,
      ...(startsAt ? { startsAt } : {}),
      ...(existing.exists
        ? {}
        : {
            stripeProductId: null,
            stripePriceId: null,
            startsAt: startsAt ?? now,
            createdAt: now,
          }),
    },
    { merge: true }
  );

  await writeAuditLog({
    actorUid: request.auth.uid,
    action: existing.exists ? "adminUpdateService" : "adminCreateService",
    targetType: "service",
    targetId: serviceId,
    meta: { clientId, projectId, name, amountCents, active },
  });

  return { serviceId, created: !existing.exists };
});

/**
 * Admin: update subscription local fields and optionally Stripe cancel_at_period_end.
 */
export const adminUpdateSubscription = onCall(
  { secrets: [stripeSecretKey] },
  async (request) => {
    initBillingAdmin();
    applyBillingRuntimeEnv();

    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Sign in required.");
    }
    assertAdmin(parseClaims(request.auth.token as Record<string, unknown>));

    const subscriptionId = requireString(
      request.data?.subscriptionId,
      "subscriptionId"
    );
    const ref = db().collection(COLLECTIONS.subscriptions).doc(subscriptionId);
    const snap = await ref.get();
    if (!snap.exists) {
      throw new HttpsError("not-found", `Subscription ${subscriptionId} not found`);
    }

    const data = snap.data()!;
    const patch: Record<string, unknown> = { updatedAt: new Date() };
    const meta: Record<string, unknown> = {};

    if (typeof request.data?.cancelAtPeriodEnd === "boolean") {
      patch.cancelAtPeriodEnd = request.data.cancelAtPeriodEnd;
      meta.cancelAtPeriodEnd = request.data.cancelAtPeriodEnd;

      const stripeSubId = data.stripeSubscriptionId as string | null;
      if (stripeSubId) {
        const stripe = getStripe();
        await stripe.subscriptions.update(stripeSubId, {
          cancel_at_period_end: request.data.cancelAtPeriodEnd,
        });
        meta.stripeSubscriptionId = stripeSubId;
      }
    }

    if (typeof request.data?.status === "string") {
      const status = request.data.status as SubscriptionStatus;
      const allowed: SubscriptionStatus[] = [
        "incomplete",
        "trialing",
        "active",
        "past_due",
        "unpaid",
        "canceled",
        "scheduled",
      ];
      if (!allowed.includes(status)) {
        throw new HttpsError("invalid-argument", "Invalid subscription status");
      }
      // Only allow local status edits when not linked to Stripe (scheduled seed).
      if (data.stripeSubscriptionId && status !== data.status) {
        throw new HttpsError(
          "failed-precondition",
          "Status for Stripe-linked subscriptions is webhook-owned."
        );
      }
      patch.status = status;
      meta.status = status;
      if (status === "canceled") {
        patch.canceledAt = new Date();
        patch.localAccessState = "canceled";
      }
    }

    if (Object.keys(meta).length === 0) {
      throw new HttpsError(
        "invalid-argument",
        "Provide cancelAtPeriodEnd and/or status"
      );
    }

    await ref.set(patch, { merge: true });

    await writeAuditLog({
      actorUid: request.auth.uid,
      action: "adminUpdateSubscription",
      targetType: "subscription",
      targetId: subscriptionId,
      meta,
    });

    return { subscriptionId, updated: meta };
  }
);

/**
 * Admin: attach an Auth user as a client portal member (custom claims + clientUsers).
 */
export const adminAttachClientUser = onCall(async (request) => {
  initBillingAdmin();

  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Sign in required.");
  }
  assertAdmin(parseClaims(request.auth.token as Record<string, unknown>));

  const uid = requireString(request.data?.uid, "uid");
  const email = requireString(request.data?.email, "email").toLowerCase();
  const clientId = requireString(request.data?.clientId, "clientId");

  const clientSnap = await db()
    .collection(COLLECTIONS.clients)
    .doc(clientId)
    .get();
  if (!clientSnap.exists) {
    throw new HttpsError("not-found", `Client ${clientId} not found`);
  }

  await setUserRole({ uid, email, role: "client", clientId });

  await writeAuditLog({
    actorUid: request.auth.uid,
    action: "adminAttachClientUser",
    targetType: "clientUser",
    targetId: uid,
    meta: { clientId, email },
  });

  return { uid, clientId, role: "client" as const };
});

/**
 * Admin: soft-archive a project (status=archived). Keeps history.
 */
export const adminArchiveProject = onCall(async (request) => {
  initBillingAdmin();

  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Sign in required.");
  }
  assertAdmin(parseClaims(request.auth.token as Record<string, unknown>));

  const projectId = requireString(request.data?.projectId, "projectId");
  const ref = db().collection(COLLECTIONS.projects).doc(projectId);
  const snap = await ref.get();
  if (!snap.exists) {
    throw new HttpsError("not-found", `Project ${projectId} not found`);
  }

  await ref.set(
    {
      status: "archived" as ProjectStatus,
      updatedAt: new Date(),
    },
    { merge: true }
  );

  await writeAuditLog({
    actorUid: request.auth.uid,
    action: "adminArchiveProject",
    targetType: "project",
    targetId: projectId,
    meta: { previousStatus: snap.data()?.status ?? null },
  });

  return { projectId, status: "archived" as const };
});


import { onCall, HttpsError } from "firebase-functions/v2/https";
import { initBillingAdmin, db } from "../_shared/admin";
import { parseClaims, assertClient, assertAdmin } from "../_shared/auth";
import {
  createBillingPortalSession,
  createOneTimeCheckoutSession,
  createSubscriptionCheckoutSession,
} from "../_shared/stripe";
import {
  ensureStripeCustomer,
  getServiceOrThrow,
  startsAtToUnix,
} from "../_shared/clients";
import { COLLECTIONS } from "../types/models";
import { appBaseUrl, applyBillingRuntimeEnv, stripeSecretKey } from "../_shared/params";

/**
 * Client: start Checkout to enroll in a recurring service (ACH preferred + card).
 * Uses service.startsAt as trial_end when still in the future (e.g. Jan 1 2027).
 */
export const portalCreateSubscriptionCheckout = onCall(
  { secrets: [stripeSecretKey] },
  async (request) => {
    initBillingAdmin();
    applyBillingRuntimeEnv();
    process.env.APP_BASE_URL = appBaseUrl.value();

    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Sign in required.");
    }
    const claims = parseClaims(request.auth.token as Record<string, unknown>);
    const serviceId = request.data?.serviceId as string | undefined;
    const subscriptionDocId = request.data?.subscriptionId as
      | string
      | undefined;

    if (!serviceId) {
      throw new HttpsError("invalid-argument", "serviceId is required");
    }

    const service = await getServiceOrThrow(serviceId);
    assertClient(claims, service.clientId);

    if (!service.stripePriceId) {
      throw new HttpsError(
        "failed-precondition",
        "Service has no stripePriceId — run seed with --with-stripe first."
      );
    }

    const customerId = await ensureStripeCustomer(service.clientId);
    const trialEnd = startsAtToUnix(service.startsAt);
    const now = Math.floor(Date.now() / 1000);

    const session = await createSubscriptionCheckoutSession({
      customerId,
      priceId: service.stripePriceId,
      trialEndUnix: trialEnd > now ? trialEnd : undefined,
      clientId: service.clientId,
      projectId: service.projectId,
      serviceId: service.id,
      subscriptionDocId,
    });

    await db().collection(COLLECTIONS.auditLog).add({
      actorUid: request.auth.uid,
      action: "portalCreateSubscriptionCheckout",
      targetType: "service",
      targetId: service.id,
      meta: { sessionId: session.id },
      createdAt: new Date(),
    });

    return { url: session.url, sessionId: session.id };
  }
);

/**
 * Client: open Stripe Customer Portal (payment methods, invoices).
 */
export const portalCreateBillingPortalSession = onCall(
  { secrets: [stripeSecretKey] },
  async (request) => {
    initBillingAdmin();
    applyBillingRuntimeEnv();
    process.env.APP_BASE_URL = appBaseUrl.value();

    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Sign in required.");
    }
    const claims = parseClaims(request.auth.token as Record<string, unknown>);
    if (!claims || claims.role !== "client" || !claims.clientId) {
      throw new HttpsError("permission-denied", "Client role required.");
    }

    const customerId = await ensureStripeCustomer(claims.clientId);
    const session = await createBillingPortalSession({ customerId });

    return { url: session.url, sessionId: session.id };
  }
);

/**
 * Admin or owning client: Checkout for a one-time charge (not subscription).
 */
export const createOneTimeCheckout = onCall(
  { secrets: [stripeSecretKey] },
  async (request) => {
    initBillingAdmin();
    applyBillingRuntimeEnv();
    process.env.APP_BASE_URL = appBaseUrl.value();

    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Sign in required.");
    }
    const claims = parseClaims(request.auth.token as Record<string, unknown>);

    const clientId = request.data?.clientId as string | undefined;
    const projectId = request.data?.projectId as string | undefined;
    const amountCents = request.data?.amountCents as number | undefined;
    const description = request.data?.description as string | undefined;
    const serviceId = (request.data?.serviceId as string | undefined) ?? null;

    if (!clientId || !projectId || !amountCents || !description) {
      throw new HttpsError(
        "invalid-argument",
        "clientId, projectId, amountCents, and description are required"
      );
    }
    if (amountCents <= 0) {
      throw new HttpsError("invalid-argument", "amountCents must be positive");
    }

    if (claims?.role === "admin") {
      assertAdmin(claims);
    } else {
      assertClient(claims, clientId);
    }

    const customerId = await ensureStripeCustomer(clientId);
    const session = await createOneTimeCheckoutSession({
      customerId,
      amountCents,
      description,
      clientId,
      projectId,
      serviceId,
    });

    await db().collection(COLLECTIONS.auditLog).add({
      actorUid: request.auth.uid,
      action: "createOneTimeCheckout",
      targetType: "client",
      targetId: clientId,
      meta: { sessionId: session.id, amountCents, projectId },
      createdAt: new Date(),
    });

    return { url: session.url, sessionId: session.id };
  }
);

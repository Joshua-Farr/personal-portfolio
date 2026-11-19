import { onCall, HttpsError } from "firebase-functions/v2/https";
import { initBillingAdmin, db } from "../_shared/admin";
import { parseClaims, assertAdmin } from "../_shared/auth";
import { createOneTimeStripeInvoice } from "../_shared/stripe";
import { ensureStripeCustomer } from "../_shared/clients";
import { COLLECTIONS } from "../types/models";
import { syncInvoiceFromStripe } from "../_shared/stripeSync";
import { applyBillingRuntimeEnv, stripeSecretKey } from "../_shared/params";

/**
 * Admin: create a one-time Stripe invoice (send_invoice) and mirror to Firestore.
 * Never used for historical Oct–Dec backfill — only forward one-offs.
 */
export const adminCreateOneTimeInvoice = onCall(
  { secrets: [stripeSecretKey] },
  async (request) => {
    initBillingAdmin();
    applyBillingRuntimeEnv();

    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Sign in required.");
    }
    const claims = parseClaims(request.auth.token as Record<string, unknown>);
    assertAdmin(claims);

    const clientId = request.data?.clientId as string | undefined;
    const projectId = request.data?.projectId as string | undefined;
    const amountCents = request.data?.amountCents as number | undefined;
    const description = request.data?.description as string | undefined;
    const serviceId = (request.data?.serviceId as string | undefined) ?? null;
    const daysUntilDue =
      (request.data?.daysUntilDue as number | undefined) ?? 14;

    if (!clientId || !projectId || !amountCents || !description) {
      throw new HttpsError(
        "invalid-argument",
        "clientId, projectId, amountCents, and description are required"
      );
    }
    if (amountCents <= 0) {
      throw new HttpsError("invalid-argument", "amountCents must be positive");
    }

    const customerId = await ensureStripeCustomer(clientId);
    const invoice = await createOneTimeStripeInvoice({
      customerId,
      amountCents,
      description,
      clientId,
      projectId,
      serviceId,
      daysUntilDue,
    });

    const invoiceDocId = await syncInvoiceFromStripe(invoice);

    await db().collection(COLLECTIONS.auditLog).add({
      actorUid: request.auth.uid,
      action: "adminCreateOneTimeInvoice",
      targetType: "invoice",
      targetId: invoiceDocId,
      meta: {
        stripeInvoiceId: invoice.id,
        amountCents,
        kind: "one_time",
      },
      createdAt: new Date(),
    });

    return {
      invoiceDocId,
      stripeInvoiceId: invoice.id,
      hostedInvoiceUrl: invoice.hosted_invoice_url,
      status: invoice.status,
      kind: "one_time" as const,
    };
  }
);

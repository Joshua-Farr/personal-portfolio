import { httpsCallable } from "firebase/functions";
import { getBillingFunctions } from "./firebase";

export async function startSubscriptionCheckout(params: {
  serviceId: string;
  subscriptionId?: string;
}): Promise<{ url: string; sessionId: string }> {
  const fn = httpsCallable(getBillingFunctions(), "portalCreateSubscriptionCheckout");
  const result = await fn(params);
  return result.data as { url: string; sessionId: string };
}

export async function openCustomerPortal(): Promise<{
  url: string;
  sessionId: string;
}> {
  const fn = httpsCallable(
    getBillingFunctions(),
    "portalCreateBillingPortalSession"
  );
  const result = await fn({});
  return result.data as { url: string; sessionId: string };
}

export async function startOneTimeCheckout(params: {
  clientId: string;
  projectId: string;
  amountCents: number;
  description: string;
  serviceId?: string;
}): Promise<{ url: string; sessionId: string }> {
  const fn = httpsCallable(getBillingFunctions(), "createOneTimeCheckout");
  const result = await fn(params);
  return result.data as { url: string; sessionId: string };
}

export async function adminCreateOneTimeInvoice(params: {
  clientId: string;
  projectId: string;
  amountCents: number;
  description: string;
  serviceId?: string;
  daysUntilDue?: number;
}): Promise<{
  invoiceDocId: string;
  stripeInvoiceId: string;
  hostedInvoiceUrl: string | null;
  status: string;
  kind: "one_time";
}> {
  const fn = httpsCallable(getBillingFunctions(), "adminCreateOneTimeInvoice");
  const result = await fn(params);
  return result.data as {
    invoiceDocId: string;
    stripeInvoiceId: string;
    hostedInvoiceUrl: string | null;
    status: string;
    kind: "one_time";
  };
}

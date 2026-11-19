import { httpsCallable } from "firebase/functions";
import { getBillingFunctions } from "./firebase";

export async function startSubscriptionCheckout(params: {
  serviceId: string;
  subscriptionId?: string;
}): Promise<{ url: string; sessionId: string }> {
  const fn = httpsCallable(
    getBillingFunctions(),
    "portalCreateSubscriptionCheckout"
  );
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

export async function adminUpsertClient(params: {
  clientId?: string;
  name: string;
  billingEmail: string;
  preferredPaymentMethod?: "ach" | "card";
  billingEmailIsTemporary?: boolean;
  notes?: string;
  ensureStripeCustomer?: boolean;
}): Promise<{
  clientId: string;
  stripeCustomerId: string | null;
  created: boolean;
}> {
  const fn = httpsCallable(getBillingFunctions(), "adminUpsertClient");
  const result = await fn(params);
  return result.data as {
    clientId: string;
    stripeCustomerId: string | null;
    created: boolean;
  };
}

export async function adminUpsertProject(params: {
  projectId?: string;
  clientId: string;
  name: string;
  slug: string;
  status?: "active" | "paused" | "archived";
  description?: string;
}): Promise<{ projectId: string; created: boolean }> {
  const fn = httpsCallable(getBillingFunctions(), "adminUpsertProject");
  const result = await fn(params);
  return result.data as { projectId: string; created: boolean };
}

export async function adminUpsertService(params: {
  serviceId?: string;
  clientId: string;
  projectId: string;
  name: string;
  amountCents: number;
  currency?: string;
  interval?: "month" | "year";
  active?: boolean;
  startsAtIso?: string;
}): Promise<{ serviceId: string; created: boolean }> {
  const fn = httpsCallable(getBillingFunctions(), "adminUpsertService");
  const result = await fn(params);
  return result.data as { serviceId: string; created: boolean };
}

export async function adminUpdateSubscription(params: {
  subscriptionId: string;
  cancelAtPeriodEnd?: boolean;
  status?: string;
}): Promise<{ subscriptionId: string; updated: Record<string, unknown> }> {
  const fn = httpsCallable(getBillingFunctions(), "adminUpdateSubscription");
  const result = await fn(params);
  return result.data as {
    subscriptionId: string;
    updated: Record<string, unknown>;
  };
}

export async function adminArchiveProject(params: {
  projectId: string;
}): Promise<{ projectId: string; status: "archived" }> {
  const fn = httpsCallable(getBillingFunctions(), "adminArchiveProject");
  const result = await fn(params);
  return result.data as { projectId: string; status: "archived" };
}

export async function adminAttachClientUser(params: {
  uid: string;
  email: string;
  clientId: string;
}): Promise<{ uid: string; clientId: string; role: "client" }> {
  const fn = httpsCallable(getBillingFunctions(), "adminAttachClientUser");
  const result = await fn(params);
  return result.data as { uid: string; clientId: string; role: "client" };
}

export async function adminNotifyProjectBillingAccess(params: {
  projectId: string;
  accessState: "active" | "suspended";
  reason?: string;
}): Promise<Record<string, unknown>> {
  const fn = httpsCallable(
    getBillingFunctions(),
    "adminNotifyProjectBillingAccess"
  );
  const result = await fn(params);
  return result.data as Record<string, unknown>;
}

export function callableErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "message" in err) {
    return String((err as { message: unknown }).message);
  }
  return "Request failed";
}

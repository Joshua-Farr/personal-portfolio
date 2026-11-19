import Stripe from "stripe";
import {
  getAppBaseUrl,
  getStripePortalConfigurationId,
  getStripeSecretKey,
} from "./env";

let stripeSingleton: Stripe | null = null;

/**
 * Stripe SDK for the billing Firebase project (test mode only).
 * Guards against accidentally loading live keys.
 */
export function getStripe(): Stripe {
  if (!stripeSingleton) {
    stripeSingleton = new Stripe(getStripeSecretKey(), {
      typescript: true,
      appInfo: {
        name: "joshfarr-billing",
        version: "0.2.0",
      },
    });
  }
  return stripeSingleton;
}

/** ACH preferred, card as alternative — used on Checkout sessions. */
export const PREFERRED_PAYMENT_METHOD_TYPES: Stripe.Checkout.SessionCreateParams.PaymentMethodType[] =
  ["us_bank_account", "card"];

export interface CreateCustomerInput {
  name: string;
  email: string;
  metadata?: Record<string, string>;
}

export async function createStripeCustomer(
  input: CreateCustomerInput
): Promise<Stripe.Customer> {
  const stripe = getStripe();
  return stripe.customers.create({
    name: input.name,
    email: input.email,
    metadata: {
      source: "joshfarr_billing",
      ...input.metadata,
    },
  });
}

export interface CreateProductAndPriceInput {
  productName: string;
  amountCents: number;
  currency?: string;
  interval: "month" | "year";
  metadata?: Record<string, string>;
}

/**
 * Creates a Stripe Product + recurring Price.
 */
export async function createProductAndRecurringPrice(
  input: CreateProductAndPriceInput
): Promise<{ product: Stripe.Product; price: Stripe.Price }> {
  const stripe = getStripe();
  const product = await stripe.products.create({
    name: input.productName,
    metadata: {
      source: "joshfarr_billing",
      ...input.metadata,
    },
  });
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: input.amountCents,
    currency: input.currency ?? "usd",
    recurring: { interval: input.interval },
    metadata: {
      source: "joshfarr_billing",
      ...input.metadata,
    },
  });
  return { product, price };
}

export interface CreateOneTimePriceInput {
  productName: string;
  amountCents: number;
  currency?: string;
  metadata?: Record<string, string>;
}

export async function createOneTimeProductAndPrice(
  input: CreateOneTimePriceInput
): Promise<{ product: Stripe.Product; price: Stripe.Price }> {
  const stripe = getStripe();
  const product = await stripe.products.create({
    name: input.productName,
    metadata: {
      source: "joshfarr_billing",
      kind: "one_time",
      ...input.metadata,
    },
  });
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: input.amountCents,
    currency: input.currency ?? "usd",
    metadata: {
      source: "joshfarr_billing",
      kind: "one_time",
      ...input.metadata,
    },
  });
  return { product, price };
}

export interface ScheduleSubscriptionInput {
  customerId: string;
  priceId: string;
  /** Unix seconds — first invoice / billing anchor (seed: 2027-01-01). */
  billingCycleAnchor: number;
  metadata?: Record<string, string>;
}

/**
 * Creates a subscription that does not bill until billingCycleAnchor (trial_end).
 */
export async function createScheduledSubscription(
  input: ScheduleSubscriptionInput
): Promise<Stripe.Subscription> {
  const stripe = getStripe();
  const now = Math.floor(Date.now() / 1000);
  if (input.billingCycleAnchor <= now) {
    throw new Error(
      "billingCycleAnchor must be in the future for seed (Jan 1 2027)."
    );
  }

  return stripe.subscriptions.create({
    customer: input.customerId,
    items: [{ price: input.priceId }],
    trial_end: input.billingCycleAnchor,
    payment_behavior: "default_incomplete",
    collection_method: "charge_automatically",
    payment_settings: {
      payment_method_types: ["us_bank_account", "card"],
      save_default_payment_method: "on_subscription",
    },
    metadata: {
      source: "joshfarr_billing",
      ...input.metadata,
    },
    expand: ["latest_invoice"],
  });
}

export interface SubscriptionCheckoutInput {
  customerId: string;
  priceId: string;
  /** Unix seconds; omit if subscription should start immediately. */
  trialEndUnix?: number;
  clientId: string;
  projectId: string;
  serviceId: string;
  subscriptionDocId?: string;
  successPath?: string;
  cancelPath?: string;
}

/**
 * Checkout Session for subscription enrollment (ACH preferred + card).
 */
export async function createSubscriptionCheckoutSession(
  input: SubscriptionCheckoutInput
): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();
  const base = getAppBaseUrl().replace(/\/$/, "");
  const successPath = input.successPath ?? "/portal?checkout=success";
  const cancelPath = input.cancelPath ?? "/portal?checkout=cancel";

  const subscriptionData: Stripe.Checkout.SessionCreateParams.SubscriptionData =
    {
      metadata: {
        source: "joshfarr_billing",
        firestoreClientId: input.clientId,
        firestoreProjectId: input.projectId,
        firestoreServiceId: input.serviceId,
        ...(input.subscriptionDocId
          ? { firestoreSubscriptionId: input.subscriptionDocId }
          : {}),
      },
    };

  if (input.trialEndUnix !== undefined) {
    const now = Math.floor(Date.now() / 1000);
    if (input.trialEndUnix <= now) {
      throw new Error("trialEndUnix must be in the future when provided.");
    }
    subscriptionData.trial_end = input.trialEndUnix;
  }

  return stripe.checkout.sessions.create({
    mode: "subscription",
    customer: input.customerId,
    line_items: [{ price: input.priceId, quantity: 1 }],
    payment_method_types: PREFERRED_PAYMENT_METHOD_TYPES,
    payment_method_options: {
      us_bank_account: {
        financial_connections: {
          permissions: ["payment_method"],
        },
      },
    },
    success_url: `${base}${successPath}`,
    cancel_url: `${base}${cancelPath}`,
    subscription_data: subscriptionData,
    metadata: {
      source: "joshfarr_billing",
      kind: "subscription_enrollment",
      firestoreClientId: input.clientId,
      firestoreProjectId: input.projectId,
      firestoreServiceId: input.serviceId,
    },
  });
}

export interface OneTimeCheckoutInput {
  customerId: string;
  amountCents: number;
  currency?: string;
  description: string;
  clientId: string;
  projectId: string;
  serviceId?: string | null;
  successPath?: string;
  cancelPath?: string;
}

/**
 * Checkout Session for a one-time payment (not a subscription invoice).
 */
export async function createOneTimeCheckoutSession(
  input: OneTimeCheckoutInput
): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();
  const base = getAppBaseUrl().replace(/\/$/, "");
  const successPath = input.successPath ?? "/portal?checkout=success";
  const cancelPath = input.cancelPath ?? "/portal?checkout=cancel";

  return stripe.checkout.sessions.create({
    mode: "payment",
    customer: input.customerId,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: input.currency ?? "usd",
          unit_amount: input.amountCents,
          product_data: {
            name: input.description,
            metadata: {
              source: "joshfarr_billing",
              kind: "one_time",
            },
          },
        },
      },
    ],
    payment_method_types: PREFERRED_PAYMENT_METHOD_TYPES,
    payment_method_options: {
      us_bank_account: {
        financial_connections: {
          permissions: ["payment_method"],
        },
      },
    },
    success_url: `${base}${successPath}`,
    cancel_url: `${base}${cancelPath}`,
    invoice_creation: { enabled: true },
    payment_intent_data: {
      metadata: {
        source: "joshfarr_billing",
        kind: "one_time",
        firestoreClientId: input.clientId,
        firestoreProjectId: input.projectId,
        ...(input.serviceId
          ? { firestoreServiceId: input.serviceId }
          : {}),
      },
    },
    metadata: {
      source: "joshfarr_billing",
      kind: "one_time",
      firestoreClientId: input.clientId,
      firestoreProjectId: input.projectId,
      ...(input.serviceId ? { firestoreServiceId: input.serviceId } : {}),
    },
  });
}

export interface PortalSessionInput {
  customerId: string;
  returnPath?: string;
}

export async function createBillingPortalSession(
  input: PortalSessionInput
): Promise<Stripe.BillingPortal.Session> {
  const stripe = getStripe();
  const base = getAppBaseUrl().replace(/\/$/, "");
  const returnPath = input.returnPath ?? "/portal/billing";
  const configuration = getStripePortalConfigurationId();

  return stripe.billingPortal.sessions.create({
    customer: input.customerId,
    return_url: `${base}${returnPath}`,
    ...(configuration ? { configuration } : {}),
  });
}

export interface OneTimeStripeInvoiceInput {
  customerId: string;
  amountCents: number;
  currency?: string;
  description: string;
  clientId: string;
  projectId: string;
  serviceId?: string | null;
  daysUntilDue?: number;
}

/**
 * Creates an open Stripe Invoice for a one-time charge (ACH/card collect later).
 * Distinct from subscription invoices — no subscription id on the invoice.
 */
export async function createOneTimeStripeInvoice(
  input: OneTimeStripeInvoiceInput
): Promise<Stripe.Invoice> {
  const stripe = getStripe();
  const metadata = {
    source: "joshfarr_billing",
    kind: "one_time",
    firestoreClientId: input.clientId,
    firestoreProjectId: input.projectId,
    ...(input.serviceId ? { firestoreServiceId: input.serviceId } : {}),
  };

  await stripe.invoiceItems.create({
    customer: input.customerId,
    amount: input.amountCents,
    currency: input.currency ?? "usd",
    description: input.description,
    metadata,
  });

  const invoice = await stripe.invoices.create({
    customer: input.customerId,
    collection_method: "send_invoice",
    days_until_due: input.daysUntilDue ?? 14,
    pending_invoice_items_behavior: "include",
    metadata,
    payment_settings: {
      payment_method_types: ["us_bank_account", "card"],
    },
  });

  return stripe.invoices.finalizeInvoice(invoice.id);
}

export function assertStripeTestMode(event: Stripe.Event): void {
  if (event.livemode) {
    throw new Error(
      "Received a live-mode Stripe webhook. Live mode is forbidden until go-live approval."
    );
  }
}

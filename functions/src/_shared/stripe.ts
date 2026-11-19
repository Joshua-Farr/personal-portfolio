import Stripe from "stripe";
import { getStripeSecretKey } from "./env";

let stripeSingleton: Stripe | null = null;

/**
 * Stripe SDK for the billing Firebase project (test mode only).
 * Guards against accidentally loading live keys.
 */
export function getStripe(): Stripe {
  if (!stripeSingleton) {
    stripeSingleton = new Stripe(getStripeSecretKey(), {
      // Use the SDK's pinned LatestApiVersion; keep test-mode enforcement in getStripeSecretKey().
      typescript: true,
      appInfo: {
        name: "joshfarr-billing",
        version: "0.1.0",
      },
    });
  }
  return stripeSingleton;
}

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
 * Creates a Stripe Product + recurring Price. Prefer ACH collection later via Portal config.
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

export interface ScheduleSubscriptionInput {
  customerId: string;
  priceId: string;
  /** Unix seconds — first invoice / billing anchor (seed: 2027-01-01). */
  billingCycleAnchor: number;
  metadata?: Record<string, string>;
}

/**
 * Creates a subscription that does not bill until billingCycleAnchor.
 * Uses trial_end so Stripe does not charge before the start date.
 * Phase B will refine with schedules / test clocks as needed.
 */
export async function createScheduledSubscription(
  input: ScheduleSubscriptionInput
): Promise<Stripe.Subscription> {
  const stripe = getStripe();
  const now = Math.floor(Date.now() / 1000);
  if (input.billingCycleAnchor <= now) {
    throw new Error(
      "billingCycleAnchor must be in the future for Phase A seed (Jan 1 2027)."
    );
  }

  return stripe.subscriptions.create({
    customer: input.customerId,
    items: [{ price: input.priceId }],
    trial_end: input.billingCycleAnchor,
    payment_behavior: "default_incomplete",
    collection_method: "charge_automatically",
    metadata: {
      source: "joshfarr_billing",
      ...input.metadata,
    },
    expand: ["latest_invoice"],
  });
}

export function assertStripeTestMode(event: Stripe.Event): void {
  if (event.livemode) {
    throw new Error(
      "Received a live-mode Stripe webhook. Live mode is forbidden until go-live approval."
    );
  }
}

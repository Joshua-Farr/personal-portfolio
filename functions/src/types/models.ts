/**
 * Firestore document shapes for joshfarr.com billing.
 * Business logic must not hardcode Impact / Codex / OPD — seed/config only.
 */

/** Firestore Timestamp or Date (Admin SDK writes Dates; reads may be Timestamp). */
export type FirestoreTime = { toDate(): Date } | Date;

export type UserRole = "admin" | "client";

export type PreferredPaymentMethod = "ach" | "card";

export type ProjectStatus = "active" | "paused" | "archived";

export type BillingInterval = "month" | "year";

export type SubscriptionStatus =
  | "incomplete"
  | "trialing"
  | "active"
  | "past_due"
  | "unpaid"
  | "canceled"
  | "scheduled";

export type InvoiceKind = "subscription" | "one_time";

export type InvoiceStatus =
  | "draft"
  | "open"
  | "paid"
  | "void"
  | "uncollectible";

export type PaymentStatus = "pending" | "succeeded" | "failed" | "refunded";

export type ProjectIntegrationType = "codex_billing_access";

export interface ClientDoc {
  name: string;
  billingEmail: string;
  /** Mark temporary contacts so they are swapped before live handoff. */
  billingEmailIsTemporary: boolean;
  preferredPaymentMethod: PreferredPaymentMethod;
  stripeCustomerId: string | null;
  notes?: string;
  createdAt: FirestoreTime;
  updatedAt: FirestoreTime;
}

export interface ClientUserDoc {
  uid: string;
  email: string;
  role: UserRole;
  /** Required when role === "client"; null for admins. */
  clientId: string | null;
  displayName?: string;
  createdAt: FirestoreTime;
  updatedAt: FirestoreTime;
}

export interface ProjectDoc {
  clientId: string;
  name: string;
  slug: string;
  status: ProjectStatus;
  description?: string;
  createdAt: FirestoreTime;
  updatedAt: FirestoreTime;
}

export interface ServiceDoc {
  clientId: string;
  projectId: string;
  name: string;
  amountCents: number;
  currency: string;
  interval: BillingInterval;
  stripeProductId: string | null;
  stripePriceId: string | null;
  /** First billable period start (Impact/Codex seed: 2027-01-01). */
  startsAt: FirestoreTime;
  active: boolean;
  createdAt: FirestoreTime;
  updatedAt: FirestoreTime;
}

export interface SubscriptionDoc {
  clientId: string;
  projectId: string;
  serviceId: string;
  stripeSubscriptionId: string | null;
  status: SubscriptionStatus;
  currentPeriodStart: FirestoreTime | null;
  currentPeriodEnd: FirestoreTime | null;
  cancelAtPeriodEnd: boolean;
  createdAt: FirestoreTime;
  updatedAt: FirestoreTime;
}

export interface InvoiceDoc {
  clientId: string;
  projectId: string;
  serviceId: string | null;
  subscriptionId: string | null;
  stripeInvoiceId: string | null;
  kind: InvoiceKind;
  amountCents: number;
  currency: string;
  status: InvoiceStatus;
  periodStart: FirestoreTime | null;
  periodEnd: FirestoreTime | null;
  hostedInvoiceUrl: string | null;
  /** Never seed kind=historical; Impact billing starts Jan 2027. */
  createdAt: FirestoreTime;
  updatedAt: FirestoreTime;
}

export interface PaymentDoc {
  clientId: string;
  invoiceId: string | null;
  stripePaymentIntentId: string | null;
  stripeChargeId: string | null;
  amountCents: number;
  currency: string;
  status: PaymentStatus;
  method: PreferredPaymentMethod | "unknown";
  /** Mirrors invoice kind when known — subscription vs one_time. */
  kind?: InvoiceKind | null;
  createdAt: FirestoreTime;
  updatedAt: FirestoreTime;
}

export interface ProjectIntegrationDoc {
  projectId: string;
  type: ProjectIntegrationType;
  baseUrl: string;
  /** Name of Functions secret / env key holding the HMAC secret — never store the secret in Firestore. */
  hmacSecretEnvKey: string;
  enabled: boolean;
  createdAt: FirestoreTime;
  updatedAt: FirestoreTime;
}

export interface AccessEventDoc {
  projectId: string;
  integrationId: string;
  eventId: string;
  direction: "outbound";
  payloadSummary: Record<string, unknown>;
  httpStatus: number | null;
  success: boolean;
  errorMessage: string | null;
  createdAt: FirestoreTime;
}

export interface StripeWebhookEventDoc {
  eventId: string;
  type: string;
  processedAt: FirestoreTime;
  livemode: boolean;
}

export interface AuditLogDoc {
  actorUid: string;
  action: string;
  targetType: string;
  targetId: string;
  meta?: Record<string, unknown>;
  createdAt: FirestoreTime;
}

/** Collection name constants — keep in sync with firestore.rules */
export const COLLECTIONS = {
  clients: "clients",
  clientUsers: "clientUsers",
  projects: "projects",
  services: "services",
  subscriptions: "subscriptions",
  invoices: "invoices",
  payments: "payments",
  projectIntegrations: "projectIntegrations",
  accessEvents: "accessEvents",
  stripeWebhookEvents: "stripeWebhookEvents",
  auditLog: "auditLog",
} as const;

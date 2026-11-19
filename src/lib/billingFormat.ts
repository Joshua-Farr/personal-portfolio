import type { Timestamp } from "firebase/firestore";

export type FirestoreTimeLike =
  | Date
  | Timestamp
  | { toDate(): Date }
  | string
  | number
  | null
  | undefined;

export function toDate(value: FirestoreTimeLike): Date | null {
  if (value == null) return null;
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (typeof value === "object" && "toDate" in value) {
    try {
      return value.toDate();
    } catch {
      return null;
    }
  }
  return null;
}

export function formatMoney(
  amountCents: number,
  currency = "usd"
): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amountCents / 100);
  } catch {
    return `$${(amountCents / 100).toFixed(2)}`;
  }
}

export function formatDate(value: FirestoreTimeLike): string {
  const d = toDate(value);
  if (!d) return "—";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function invoiceStatusTone(
  status: string
): "ok" | "warn" | "bad" | "neutral" {
  if (status === "paid") return "ok";
  if (status === "open" || status === "draft") return "warn";
  if (status === "void" || status === "uncollectible") return "bad";
  return "neutral";
}

export function subscriptionStatusTone(
  status: string
): "ok" | "warn" | "bad" | "neutral" {
  if (status === "active" || status === "trialing" || status === "scheduled") {
    return "ok";
  }
  if (status === "past_due") return "warn";
  if (status === "unpaid" || status === "canceled" || status === "incomplete") {
    return "bad";
  }
  return "neutral";
}

/** MRR contribution: monthly services only; yearly ≈ amount/12. */
export function mrrFromService(params: {
  amountCents: number;
  interval: string;
  active?: boolean;
}): number {
  if (params.active === false) return 0;
  if (params.interval === "year") {
    return Math.round(params.amountCents / 12);
  }
  return params.amountCents;
}

import type { SubscriptionStatus } from "../types/models";
import type { BillingAccessState } from "./codexBilling";

export function mapSubscriptionStatusToAccessState(
  status: SubscriptionStatus
): BillingAccessState | null {
  switch (status) {
    case "past_due":
    case "unpaid":
    case "canceled":
      return "suspended";
    case "active":
    case "trialing":
      return "active";
    default:
      return null;
  }
}

export function shouldNotifyAccessTransition(
  previous: SubscriptionStatus | null | undefined,
  next: SubscriptionStatus
): BillingAccessState | null {
  const nextState = mapSubscriptionStatusToAccessState(next);
  if (!nextState) return null;
  const prevState = previous
    ? mapSubscriptionStatusToAccessState(previous)
    : null;
  if (prevState === nextState) return null;
  return nextState;
}

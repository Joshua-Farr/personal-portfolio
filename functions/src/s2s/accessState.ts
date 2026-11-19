import type { SubscriptionStatus } from "../types/models";
import type { BillingAccessState } from "./codexBilling";

/**
 * Phase D: past_due / unpaid do NOT immediately suspend Codex.
 * They enter local grace first; suspend is decided by billingState + schedule.
 * This helper maps only statuses that imply an immediate Codex access target
 * when ignoring grace (used by admin tools / legacy callers).
 *
 * Prefer `decideBillingTransition` for webhook / reconcile paths.
 */
export function mapSubscriptionStatusToAccessState(
  status: SubscriptionStatus
): BillingAccessState | null {
  switch (status) {
    case "unpaid":
    case "canceled":
      // unpaid past grace → suspended; canceled → suspended (separate path).
      // past_due intentionally omitted — grace first.
      return "suspended";
    case "past_due":
      return null;
    case "active":
    case "trialing":
      return "active";
    default:
      return null;
  }
}

/**
 * Legacy helper retained for admin/manual tools.
 * Phase D webhooks use `applySubscriptionBillingTransition` instead —
 * past_due no longer triggers an immediate suspend notify.
 */
export function shouldNotifyAccessTransition(
  previous: SubscriptionStatus | null | undefined,
  next: SubscriptionStatus
): BillingAccessState | null {
  // past_due alone never notifies (grace).
  if (next === "past_due") return null;

  const nextState = mapSubscriptionStatusToAccessState(next);
  if (!nextState) return null;

  // Leaving past_due/unpaid/canceled into healthy → restore.
  if (nextState === "active") {
    if (
      previous === "past_due" ||
      previous === "unpaid" ||
      previous === "canceled" ||
      previous === undefined ||
      previous === null
    ) {
      // canceled → active is unusual; billingState blocks canceled reactivation.
      if (previous === "canceled") return null;
      if (previous === "past_due" || previous === "unpaid") return "active";
      if (!previous) return null;
    }
    const prevState = previous
      ? mapSubscriptionStatusToAccessState(previous)
      : null;
    if (prevState === nextState) return null;
    if (prevState === "suspended") return "active";
    return null;
  }

  if (nextState === "suspended") {
    if (next === "canceled") {
      if (previous === "canceled") return null;
      return "suspended";
    }
    if (next === "unpaid") {
      // unpaid may still be in grace if we just entered — prefer billingState.
      // For this legacy helper, treat unpaid as suspend-worthy only from healthy.
      if (previous === "active" || previous === "trialing") return null;
      if (previous === "past_due") return null;
      return null;
    }
  }

  return null;
}

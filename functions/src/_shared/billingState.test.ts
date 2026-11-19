import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  decideBillingTransition,
  isAchProcessingPayment,
  normalizeLocalAccessState,
} from "./billingState";
import {
  DEFAULT_BILLING_FAILURE_POLICY,
  isGraceExpired,
  policyFromEnv,
} from "./billingPolicy";
import { renderTransactionalEmail, formatUsdCents } from "../email/templates";

const policy = {
  gracePeriodDays: 5,
  autoSuspend: true,
  autoReactivate: true,
};

describe("decideBillingTransition", () => {
  const now = new Date("2027-02-10T12:00:00.000Z");

  it("enters grace on past_due from active (no Codex notify yet)", () => {
    const d = decideBillingTransition({
      localAccessState: "active",
      stripeStatus: "past_due",
      graceStartedAt: null,
      policy,
      now,
    });
    assert.equal(d.action, "enter_grace");
    assert.equal(d.nextLocalState, "grace");
    assert.equal(d.notifyAccessState, null);
  });

  it("does not treat ACH processing as failure", () => {
    const d = decideBillingTransition({
      localAccessState: "active",
      stripeStatus: "past_due",
      graceStartedAt: null,
      policy,
      now,
      achProcessing: true,
    });
    assert.equal(d.action, "none");
    assert.equal(d.reason, "ach_processing_not_failure");
  });

  it("stays in grace until period expires", () => {
    const started = new Date("2027-02-08T12:00:00.000Z"); // 2 days ago
    const d = decideBillingTransition({
      localAccessState: "grace",
      stripeStatus: "past_due",
      graceStartedAt: started,
      policy,
      now,
    });
    assert.equal(d.action, "none");
    assert.equal(d.nextLocalState, "grace");
  });

  it("suspends after grace expires and notifies Codex", () => {
    const started = new Date("2027-02-01T12:00:00.000Z"); // 9 days ago
    const d = decideBillingTransition({
      localAccessState: "grace",
      stripeStatus: "past_due",
      graceStartedAt: started,
      policy,
      now,
    });
    assert.equal(d.action, "suspend");
    assert.equal(d.nextLocalState, "suspended");
    assert.equal(d.notifyAccessState, "suspended");
  });

  it("reactivates from suspended on healthy status", () => {
    const d = decideBillingTransition({
      localAccessState: "suspended",
      stripeStatus: "active",
      graceStartedAt: null,
      policy,
      now,
    });
    assert.equal(d.action, "reactivate");
    assert.equal(d.notifyAccessState, "active");
  });

  it("reactivates from grace when payment recovers", () => {
    const d = decideBillingTransition({
      localAccessState: "grace",
      stripeStatus: "active",
      graceStartedAt: new Date("2027-02-09T12:00:00.000Z"),
      policy,
      now,
    });
    assert.equal(d.action, "reactivate");
    assert.equal(d.notifyAccessState, "active");
  });

  it("marks canceled separately and notifies suspend", () => {
    const d = decideBillingTransition({
      localAccessState: "grace",
      stripeStatus: "canceled",
      graceStartedAt: new Date("2027-02-09T12:00:00.000Z"),
      policy,
      now,
    });
    assert.equal(d.action, "mark_canceled");
    assert.equal(d.nextLocalState, "canceled");
    assert.equal(d.notifyAccessState, "suspended");
  });

  it("does not reactivate canceled on healthy / old invoice pay", () => {
    const d = decideBillingTransition({
      localAccessState: "canceled",
      stripeStatus: "active",
      graceStartedAt: null,
      policy,
      now,
    });
    assert.equal(d.action, "keep_canceled");
    assert.equal(d.notifyAccessState, null);
    assert.equal(d.reason, "canceled_ignore_payment");
  });

  it("respects autoSuspend=false", () => {
    const started = new Date("2027-01-01T12:00:00.000Z");
    const d = decideBillingTransition({
      localAccessState: "grace",
      stripeStatus: "unpaid",
      graceStartedAt: started,
      policy: { ...policy, autoSuspend: false },
      now,
    });
    assert.equal(d.action, "none");
    assert.equal(d.nextLocalState, "grace");
  });

  it("respects autoReactivate=false", () => {
    const d = decideBillingTransition({
      localAccessState: "suspended",
      stripeStatus: "active",
      graceStartedAt: null,
      policy: { ...policy, autoReactivate: false },
      now,
    });
    assert.equal(d.action, "none");
    assert.equal(d.reason, "auto_reactivate_disabled");
  });
});

describe("isAchProcessingPayment", () => {
  it("detects processing ACH", () => {
    assert.equal(
      isAchProcessingPayment({
        status: "processing",
        payment_method: { type: "us_bank_account" } as never,
      }),
      true
    );
  });

  it("ignores succeeded card", () => {
    assert.equal(
      isAchProcessingPayment({
        status: "succeeded",
        payment_method: { type: "card" } as never,
      }),
      false
    );
  });

  it("treats processing without PM as non-failure (conservative)", () => {
    assert.equal(
      isAchProcessingPayment({
        status: "processing",
        payment_method: "pm_123" as never,
      }),
      true
    );
  });
});

describe("grace helpers + policy env", () => {
  it("isGraceExpired after N days", () => {
    const start = new Date("2027-01-01T00:00:00.000Z");
    assert.equal(
      isGraceExpired(start, 5, new Date("2027-01-05T23:59:59.000Z")),
      false
    );
    assert.equal(
      isGraceExpired(start, 5, new Date("2027-01-06T00:00:00.000Z")),
      true
    );
  });

  it("policyFromEnv overlays grace days", () => {
    const prev = process.env.BILLING_GRACE_PERIOD_DAYS;
    process.env.BILLING_GRACE_PERIOD_DAYS = "7";
    try {
      const p = policyFromEnv(DEFAULT_BILLING_FAILURE_POLICY);
      assert.equal(p.gracePeriodDays, 7);
    } finally {
      if (prev === undefined) delete process.env.BILLING_GRACE_PERIOD_DAYS;
      else process.env.BILLING_GRACE_PERIOD_DAYS = prev;
    }
  });

  it("normalizeLocalAccessState infers legacy past_due as grace", () => {
    assert.equal(normalizeLocalAccessState(undefined, "past_due"), "grace");
    assert.equal(normalizeLocalAccessState(undefined, "canceled"), "canceled");
    assert.equal(normalizeLocalAccessState("suspended", "past_due"), "suspended");
  });
});

describe("email templates", () => {
  it("renders all Phase D kinds", () => {
    const kinds = [
      "invoice",
      "payment_succeeded",
      "payment_failed",
      "grace",
      "suspension",
      "reactivation",
    ] as const;
    for (const kind of kinds) {
      const r = renderTransactionalEmail(kind, {
        clientName: "Impact",
        projectName: "Codex",
        amountLabel: formatUsdCents(150_000),
        gracePeriodDays: 5,
        invoiceUrl: "https://invoice.stripe.com/test",
      });
      assert.ok(r.subject.length > 0);
      assert.match(r.html, /Impact/);
      assert.match(r.html, /Josh Farr/);
    }
  });
});

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type Stripe from "stripe";
import {
  mapStripeSubscriptionStatus,
  resolveInvoiceKind,
  mapPaymentMethodType,
  mapStripeInvoiceStatus,
} from "./stripeSync";

describe("mapStripeSubscriptionStatus", () => {
  it("maps common Stripe statuses", () => {
    assert.equal(mapStripeSubscriptionStatus("trialing"), "trialing");
    assert.equal(mapStripeSubscriptionStatus("active"), "active");
    assert.equal(mapStripeSubscriptionStatus("past_due"), "past_due");
    assert.equal(mapStripeSubscriptionStatus("canceled"), "canceled");
  });
});

describe("resolveInvoiceKind", () => {
  it("marks subscription invoices when subscription id is present", () => {
    const invoice = {
      id: "in_sub",
      subscription: "sub_123",
      metadata: {},
      billing_reason: "subscription_cycle",
    } as unknown as Stripe.Invoice;
    assert.equal(resolveInvoiceKind(invoice), "subscription");
  });

  it("marks one_time when no subscription and metadata says so", () => {
    const invoice = {
      id: "in_ot",
      subscription: null,
      metadata: { kind: "one_time" },
      billing_reason: "manual",
    } as unknown as Stripe.Invoice;
    assert.equal(resolveInvoiceKind(invoice), "one_time");
  });

  it("defaults to one_time for manual invoices without subscription", () => {
    const invoice = {
      id: "in_manual",
      subscription: null,
      metadata: {},
      billing_reason: "manual",
    } as unknown as Stripe.Invoice;
    assert.equal(resolveInvoiceKind(invoice), "one_time");
  });

  it("uses billing_reason subscription_* as subscription", () => {
    const invoice = {
      id: "in_create",
      subscription: null,
      metadata: {},
      billing_reason: "subscription_create",
    } as unknown as Stripe.Invoice;
    assert.equal(resolveInvoiceKind(invoice), "subscription");
  });
});

describe("payment method + invoice status maps", () => {
  it("prefers ACH mapping for us_bank_account", () => {
    assert.equal(mapPaymentMethodType("us_bank_account"), "ach");
    assert.equal(mapPaymentMethodType("card"), "card");
    assert.equal(mapPaymentMethodType("link"), "unknown");
  });

  it("maps invoice statuses", () => {
    assert.equal(mapStripeInvoiceStatus("paid"), "paid");
    assert.equal(mapStripeInvoiceStatus("open"), "open");
    assert.equal(mapStripeInvoiceStatus(null), "draft");
  });
});

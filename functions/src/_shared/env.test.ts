import assert from "node:assert/strict";
import { describe, it, beforeEach, afterEach } from "node:test";
import { getStripeSecretKey } from "./env";
import { SEED, seedStartsAtDate } from "../seed/seedConfig";

describe("billing env guards", () => {
  const original = process.env.STRIPE_SECRET_KEY;

  afterEach(() => {
    if (original === undefined) {
      delete process.env.STRIPE_SECRET_KEY;
    } else {
      process.env.STRIPE_SECRET_KEY = original;
    }
  });

  it("rejects missing Stripe secret", () => {
    delete process.env.STRIPE_SECRET_KEY;
    assert.throws(() => getStripeSecretKey(), /Missing required/);
  });

  it("rejects live Stripe secrets", () => {
    process.env.STRIPE_SECRET_KEY = "sk_live_fake";
    assert.throws(() => getStripeSecretKey(), /TEST secret/);
  });

  it("accepts test Stripe secrets", () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_fake";
    assert.equal(getStripeSecretKey(), "sk_test_fake");
  });
});

describe("seed config", () => {
  beforeEach(() => {
    // no-op — pure config
  });

  it("marks Impact billing email temporary", () => {
    assert.equal(SEED.client.billingEmail, "joshua.farr2015@gmail.com");
    assert.equal(SEED.client.billingEmailIsTemporary, true);
  });

  it("starts service on 2027-01-01 UTC", () => {
    const d = seedStartsAtDate();
    assert.equal(d.toISOString(), "2027-01-01T00:00:00.000Z");
    assert.equal(SEED.service.amountCents, 150_000);
  });

  it("keeps Codex integration disabled in Phase A", () => {
    assert.equal(SEED.integration.enabled, false);
    assert.equal(SEED.integration.type, "codex_billing_access");
  });
});

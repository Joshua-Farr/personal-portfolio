import assert from "node:assert/strict";
import { describe, it, beforeEach, afterEach } from "node:test";
import {
  getBillingEmailDryRun,
  getBillingS2sDryRun,
  getStripeSecretKey,
} from "./env";
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

describe("dry-run defaults (Codex + email)", () => {
  const s2s = process.env.BILLING_S2S_DRY_RUN;
  const email = process.env.BILLING_EMAIL_DRY_RUN;

  afterEach(() => {
    if (s2s === undefined) delete process.env.BILLING_S2S_DRY_RUN;
    else process.env.BILLING_S2S_DRY_RUN = s2s;
    if (email === undefined) delete process.env.BILLING_EMAIL_DRY_RUN;
    else process.env.BILLING_EMAIL_DRY_RUN = email;
  });

  it("defaults S2S and email dry-run to true when unset", () => {
    delete process.env.BILLING_S2S_DRY_RUN;
    delete process.env.BILLING_EMAIL_DRY_RUN;
    assert.equal(getBillingS2sDryRun(), true);
    assert.equal(getBillingEmailDryRun(), true);
  });

  it("allows explicit false", () => {
    process.env.BILLING_S2S_DRY_RUN = "false";
    process.env.BILLING_EMAIL_DRY_RUN = "false";
    assert.equal(getBillingS2sDryRun(), false);
    assert.equal(getBillingEmailDryRun(), false);
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

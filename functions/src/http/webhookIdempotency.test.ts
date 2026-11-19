import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  decideWebhookClaim,
  shouldReleaseClaimOnFailure,
} from "./webhookIdempotency";
import { assertStripeTestMode } from "../_shared/stripe";
import type Stripe from "stripe";

describe("webhook idempotency claim", () => {
  it("processes when event id is unseen", () => {
    assert.deepEqual(decideWebhookClaim(false), { action: "process" });
  });

  it("skips duplicates when event id already claimed", () => {
    assert.deepEqual(decideWebhookClaim(true), { action: "skip_duplicate" });
  });

  it("releases claim on handler failure so Stripe can retry", () => {
    assert.equal(shouldReleaseClaimOnFailure(false), true);
    assert.equal(shouldReleaseClaimOnFailure(true), false);
  });
});

describe("assertStripeTestMode", () => {
  it("rejects livemode events", () => {
    const live = { id: "evt_live", livemode: true } as Stripe.Event;
    assert.throws(() => assertStripeTestMode(live), /live-mode|Live mode/i);
  });

  it("accepts test-mode events", () => {
    const test = { id: "evt_test", livemode: false } as Stripe.Event;
    assert.doesNotThrow(() => assertStripeTestMode(test));
  });
});

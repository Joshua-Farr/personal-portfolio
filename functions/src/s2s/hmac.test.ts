import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  signMetafyStyleBody,
  verifyMetafyStyleSignature,
} from "./hmac";
import {
  mapSubscriptionStatusToAccessState,
  shouldNotifyAccessTransition,
} from "./accessState";

describe("Metafy-style HMAC (Codex parity)", () => {
  const secret = "whsec_billing_test";
  const bodyStr = '{"eventId":"evt1","accessState":"suspended"}';
  const rawBody = Buffer.from(bodyStr, "utf8");
  const timestamp = new Date().toISOString();

  it("signs and verifies like Metafy verifyWebhook", () => {
    const sig = signMetafyStyleBody(secret, timestamp, bodyStr);
    assert.match(sig, /^sha256=[0-9a-f]+$/);
    const r = verifyMetafyStyleSignature(rawBody, sig, timestamp, secret);
    assert.equal(r.ok, true);
  });

  it("rejects tampered body", () => {
    const sig = signMetafyStyleBody(secret, timestamp, bodyStr);
    const tampered = Buffer.from(bodyStr.replace("evt1", "evt2"), "utf8");
    const r = verifyMetafyStyleSignature(tampered, sig, timestamp, secret);
    assert.equal(r.ok, false);
    assert.equal(r.reason, "signature_mismatch");
  });

  it("rejects stale timestamp", () => {
    const old = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const sig = signMetafyStyleBody(secret, old, bodyStr);
    const r = verifyMetafyStyleSignature(rawBody, sig, old, secret);
    assert.equal(r.ok, false);
    assert.equal(r.reason, "timestamp_stale");
  });
});

describe("subscription → accessState transitions", () => {
  it("maps suspend-worthy statuses", () => {
    assert.equal(mapSubscriptionStatusToAccessState("past_due"), "suspended");
    assert.equal(mapSubscriptionStatusToAccessState("unpaid"), "suspended");
    assert.equal(mapSubscriptionStatusToAccessState("canceled"), "suspended");
  });

  it("maps restore-worthy statuses", () => {
    assert.equal(mapSubscriptionStatusToAccessState("active"), "active");
    assert.equal(mapSubscriptionStatusToAccessState("trialing"), "active");
  });

  it("notifies only on accessState change", () => {
    assert.equal(
      shouldNotifyAccessTransition("active", "past_due"),
      "suspended"
    );
    assert.equal(
      shouldNotifyAccessTransition("past_due", "active"),
      "active"
    );
    assert.equal(shouldNotifyAccessTransition("past_due", "unpaid"), null);
    assert.equal(shouldNotifyAccessTransition("trialing", "active"), null);
    assert.equal(shouldNotifyAccessTransition(null, "scheduled"), null);
  });
});

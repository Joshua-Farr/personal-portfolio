import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  BILLING_S2S_SIGNATURE_HEADER,
  BILLING_S2S_TIMESTAMP_HEADER,
  verifyMetafyStyleSignature,
} from "./hmac";
import { postCodexBillingStatus } from "./codexBilling";

describe("S2S contract — postCodexBillingStatus", () => {
  const secret = "whsec_billing_contract_test";
  const payload = {
    eventId: "billing_contract_evt_1",
    accessState: "suspended" as const,
    reason: "subscription_status:grace→suspended",
    projectSlug: "one-piece-dojo-codex",
    subscriptionStatus: "past_due",
    occurredAt: "2027-02-10T12:00:00.000Z",
  };

  it("fails closed when HMAC secret is missing", async () => {
    const result = await postCodexBillingStatus({
      baseUrl: "https://onepiecedojo.gg/api/internal/billing/status",
      payload,
      dryRun: false,
      hmacSecret: "",
      fetchImpl: async () => {
        throw new Error("fetch should not run");
      },
    });
    assert.equal(result.ok, false);
    assert.match(result.errorMessage ?? "", /BILLING_S2S_HMAC_SECRET/);
    assert.equal(result.httpStatus, null);
  });

  it("dry-run signs but does not HTTP POST", async () => {
    let fetchCalled = false;
    const result = await postCodexBillingStatus({
      baseUrl: "https://onepiecedojo.gg/api/internal/billing/status",
      payload,
      dryRun: true,
      hmacSecret: secret,
      fetchImpl: async () => {
        fetchCalled = true;
        return new Response("should not", { status: 500 });
      },
    });
    assert.equal(result.ok, true);
    assert.equal(result.dryRun, true);
    assert.equal(result.httpStatus, null);
    assert.equal(fetchCalled, false);
  });

  it("POSTs Metafy-identical headers and body Codex #56 can verify", async () => {
    type Captured = {
      url: string;
      method?: string;
      headers: HeadersInit | undefined;
      body: string;
    };
    const box: { current: Captured | null } = { current: null };

    const result = await postCodexBillingStatus({
      baseUrl: "https://onepiecedojo.gg/api/internal/billing/status",
      payload,
      dryRun: false,
      hmacSecret: secret,
      fetchImpl: async (url, init) => {
        box.current = {
          url: String(url),
          method: init?.method,
          headers: init?.headers,
          body: String(init?.body),
        };
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      },
    });

    assert.equal(result.ok, true);
    assert.equal(result.dryRun, false);
    assert.equal(result.httpStatus, 200);
    assert.ok(box.current);
    const captured = box.current as Captured;

    const headers = new Headers(captured.headers);
    const timestamp = headers.get(BILLING_S2S_TIMESTAMP_HEADER);
    const signature = headers.get(BILLING_S2S_SIGNATURE_HEADER);
    assert.ok(timestamp);
    assert.ok(signature);
    assert.match(signature!, /^sha256=[0-9a-f]+$/);
    assert.equal(headers.get("Content-Type"), "application/json");
    assert.equal(captured.method, "POST");
    assert.equal(
      captured.url,
      "https://onepiecedojo.gg/api/internal/billing/status"
    );

    const parsed = JSON.parse(captured.body);
    assert.equal(parsed.eventId, payload.eventId);
    assert.equal(parsed.accessState, "suspended");
    assert.equal(parsed.projectSlug, "one-piece-dojo-codex");
    assert.equal(parsed.occurredAt, payload.occurredAt);

    const verify = verifyMetafyStyleSignature(
      Buffer.from(captured.body, "utf8"),
      signature!,
      timestamp!,
      secret
    );
    assert.equal(verify.ok, true);
  });

  it("returns http failure without throwing", async () => {
    const result = await postCodexBillingStatus({
      baseUrl: "https://onepiecedojo.gg/api/internal/billing/status",
      payload,
      dryRun: false,
      hmacSecret: secret,
      fetchImpl: async () =>
        new Response("unauthorized", { status: 401 }),
    });
    assert.equal(result.ok, false);
    assert.equal(result.httpStatus, 401);
    assert.equal(result.errorMessage, "HTTP 401");
  });

  it("never includes maintenanceMode in the payload contract", () => {
    const keys = Object.keys(payload);
    assert.ok(!keys.includes("maintenanceMode"));
  });
});

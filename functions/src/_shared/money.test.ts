import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { assertPositiveCents } from "./money";

describe("assertPositiveCents", () => {
  it("accepts positive amountCents", () => {
    assert.equal(assertPositiveCents(150_000), 150_000);
    assert.equal(assertPositiveCents("500"), 500);
  });

  it("rejects non-positive amountCents", () => {
    assert.throws(() => assertPositiveCents(0));
    assert.throws(() => assertPositiveCents(-1));
    assert.throws(() => assertPositiveCents("nope"));
  });
});

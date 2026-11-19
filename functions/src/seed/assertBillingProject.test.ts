import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  assertBillingSeedProject,
  resolveFirebaseProjectId,
} from "./assertBillingProject";

describe("resolveFirebaseProjectId", () => {
  it("prefers GCLOUD_PROJECT", () => {
    assert.equal(
      resolveFirebaseProjectId({
        GCLOUD_PROJECT: "joshfarr-billing",
        GOOGLE_CLOUD_PROJECT: "other",
      }),
      "joshfarr-billing"
    );
  });

  it("parses FIREBASE_CONFIG", () => {
    assert.equal(
      resolveFirebaseProjectId({
        FIREBASE_CONFIG: JSON.stringify({ projectId: "joshfarr-billing" }),
      }),
      "joshfarr-billing"
    );
  });
});

describe("assertBillingSeedProject", () => {
  it("accepts a real billing project id", () => {
    assert.equal(assertBillingSeedProject("joshfarr-billing"), "joshfarr-billing");
  });

  it("rejects missing project", () => {
    assert.throws(() => assertBillingSeedProject(undefined), /No Firebase project/);
  });

  it("rejects dojo-codex", () => {
    assert.throws(() => assertBillingSeedProject("dojo-codex"), /Refusing to seed/);
  });

  it("rejects .firebaserc placeholder", () => {
    assert.throws(
      () =>
        assertBillingSeedProject("REPLACE_WITH_NEW_BILLING_FIREBASE_PROJECT_ID"),
      /Refusing to seed/
    );
  });
});

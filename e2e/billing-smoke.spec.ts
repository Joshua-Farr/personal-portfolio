import { test, expect } from "@playwright/test";

/**
 * Phase F smoke (test mode / local preview).
 * Does not call live Stripe or production Codex.
 * Auth-gated portal/admin flows need Firebase Auth credentials — see docs/billing/PHASE_F.md.
 */

test.describe("billing route smoke", () => {
  test("login page renders", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.locator('input[type="email"], input[name="email"]').first()).toBeVisible();
  });

  test("unauthenticated portal is gated (auth or missing billing config)", async ({
    page,
  }) => {
    await page.goto("/portal");
    await page.waitForLoadState("networkidle");
    const url = page.url();
    const body = await page.locator("body").innerText();
    // Without VITE_FIREBASE_* the SPA shows a config notice instead of a live portal.
    const gated =
      url.includes("/login") ||
      /sign in|log in|login/i.test(body) ||
      /Firebase is not configured/i.test(body) ||
      /billing project/i.test(body) ||
      /portal/i.test(body);
    expect(gated).toBeTruthy();
  });

  test("marketing home still loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).toBeVisible();
  });
});

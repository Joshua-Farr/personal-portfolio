import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { initBillingAdmin } from "../_shared/admin";
import { setUserRole } from "../_shared/auth";
import { getAdminEmailAllowlist } from "../_shared/env";

const adminAllowlist = defineSecret("ADMIN_EMAIL_ALLOWLIST");

/**
 * Callable: grant the signed-in user admin claims if their email is allowlisted.
 * First-time bootstrap for the dedicated billing Firebase project.
 */
export const bootstrapAdmin = onCall(
  {
    secrets: [adminAllowlist],
  },
  async (request) => {
    initBillingAdmin();
    process.env.ADMIN_EMAIL_ALLOWLIST = adminAllowlist.value();

    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Sign in required.");
    }

    const email = request.auth.token.email;
    if (!email || typeof email !== "string") {
      throw new HttpsError("failed-precondition", "Auth user has no email.");
    }

    const allowlist = getAdminEmailAllowlist();
    if (!allowlist.includes(email.toLowerCase())) {
      throw new HttpsError(
        "permission-denied",
        "Email is not on ADMIN_EMAIL_ALLOWLIST."
      );
    }

    await setUserRole({
      uid: request.auth.uid,
      email,
      role: "admin",
      clientId: null,
    });

    return { ok: true, role: "admin" as const };
  }
);

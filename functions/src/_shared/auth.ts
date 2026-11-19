import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { HttpsError } from "firebase-functions/v2/https";
import { COLLECTIONS, UserRole } from "../types/models";
import { getAdminEmailAllowlist } from "./env";

export interface AuthClaims {
  role: UserRole;
  clientId: string | null;
}

export function assertAdmin(claims: AuthClaims | undefined): void {
  if (!claims || claims.role !== "admin") {
    throw new HttpsError("permission-denied", "Admin role required.");
  }
}

export function assertClient(
  claims: AuthClaims | undefined,
  clientId: string
): void {
  if (!claims || claims.role !== "client" || claims.clientId !== clientId) {
    throw new HttpsError("permission-denied", "Client access denied.");
  }
}

export function parseClaims(
  token: Record<string, unknown> | undefined
): AuthClaims | undefined {
  if (!token || typeof token.role !== "string") {
    return undefined;
  }
  if (token.role !== "admin" && token.role !== "client") {
    return undefined;
  }
  return {
    role: token.role,
    clientId:
      typeof token.clientId === "string" ? token.clientId : null,
  };
}

/**
 * Sets custom claims and mirrors membership in clientUsers.
 * Admin emails must appear on ADMIN_EMAIL_ALLOWLIST for bootstrap.
 */
export async function setUserRole(params: {
  uid: string;
  email: string;
  role: UserRole;
  clientId: string | null;
}): Promise<void> {
  const { uid, email, role, clientId } = params;

  if (role === "admin") {
    const allowlist = getAdminEmailAllowlist();
    if (
      allowlist.length > 0 &&
      !allowlist.includes(email.toLowerCase())
    ) {
      throw new HttpsError(
        "permission-denied",
        "Email is not on ADMIN_EMAIL_ALLOWLIST."
      );
    }
  }

  if (role === "client" && !clientId) {
    throw new HttpsError(
      "invalid-argument",
      "clientId is required for client role."
    );
  }

  const claims: AuthClaims = {
    role,
    clientId: role === "admin" ? null : clientId,
  };

  await getAuth().setCustomUserClaims(uid, claims);

  const now = new Date();
  await getFirestore()
    .collection(COLLECTIONS.clientUsers)
    .doc(uid)
    .set(
      {
        uid,
        email: email.toLowerCase(),
        role,
        clientId: claims.clientId,
        updatedAt: now,
        createdAt: now,
      },
      { merge: true }
    );
}

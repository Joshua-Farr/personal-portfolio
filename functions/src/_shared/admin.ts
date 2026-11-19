import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

/**
 * Initialize Admin SDK for THIS billing Firebase project only.
 * Do not pass a service account from dojo-codex or initialize a second app
 * for Codex — cross-project Admin access is forbidden.
 */
export function initBillingAdmin(): void {
  if (getApps().length === 0) {
    initializeApp();
  }
}

export function db() {
  initBillingAdmin();
  return getFirestore();
}

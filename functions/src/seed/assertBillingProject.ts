/**
 * Guard seed / CLI ops so they never run against dojo-codex or the
 * committed .firebaserc placeholder.
 */

const FORBIDDEN_PROJECT_IDS = new Set([
  "dojo-codex",
  "REPLACE_WITH_NEW_BILLING_FIREBASE_PROJECT_ID",
]);

export function resolveFirebaseProjectId(
  env: NodeJS.ProcessEnv = process.env
): string | undefined {
  const fromEnv =
    env.GCLOUD_PROJECT?.trim() ||
    env.GOOGLE_CLOUD_PROJECT?.trim() ||
    env.GCP_PROJECT?.trim();
  if (fromEnv) return fromEnv;

  const raw = env.FIREBASE_CONFIG?.trim();
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw) as { projectId?: unknown };
    if (typeof parsed.projectId === "string" && parsed.projectId.trim()) {
      return parsed.projectId.trim();
    }
  } catch {
    // ignore malformed FIREBASE_CONFIG
  }
  return undefined;
}

export function assertBillingSeedProject(
  projectId: string | undefined
): string {
  if (!projectId) {
    throw new Error(
      "No Firebase project id resolved. Run `firebase use <billing-project-id>` (or set GCLOUD_PROJECT) after creating the dedicated billing project. Do not use dojo-codex."
    );
  }
  if (
    FORBIDDEN_PROJECT_IDS.has(projectId) ||
    projectId.startsWith("REPLACE_WITH_") ||
    projectId.includes("YOUR_BILLING")
  ) {
    throw new Error(
      `Refusing to seed Firebase project "${projectId}". Create a dedicated billing project (suggested id: joshfarr-billing), update .firebaserc from .firebaserc.example, then re-run. Never seed dojo-codex.`
    );
  }
  return projectId;
}

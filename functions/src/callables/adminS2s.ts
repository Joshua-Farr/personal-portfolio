import { onCall, HttpsError } from "firebase-functions/v2/https";
import { initBillingAdmin, db } from "../_shared/admin";
import { parseClaims, assertAdmin } from "../_shared/auth";
import { COLLECTIONS } from "../types/models";
import {
  applyBillingRuntimeEnv,
  billingS2sHmacSecret,
} from "../_shared/params";
import { notifyProjectBillingAccess } from "../s2s/notifyProjectAccess";
import type { BillingAccessState } from "../s2s/codexBilling";
import { getBillingS2sDryRun } from "../_shared/env";

/**
 * Admin: manually notify Codex of site-level billing access (dry-run by default).
 * Does not use dojo-codex credentials — HTTP HMAC only.
 */
export const adminNotifyProjectBillingAccess = onCall(
  { secrets: [billingS2sHmacSecret] },
  async (request) => {
    initBillingAdmin();
    applyBillingRuntimeEnv({ includeS2s: true });

    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Sign in required.");
    }
    const claims = parseClaims(request.auth.token as Record<string, unknown>);
    assertAdmin(claims);

    const projectId = request.data?.projectId as string | undefined;
    const accessState = request.data?.accessState as
      | BillingAccessState
      | undefined;
    const reason =
      (request.data?.reason as string | undefined) ??
      "admin_manual_notify";

    if (!projectId || (accessState !== "active" && accessState !== "suspended")) {
      throw new HttpsError(
        "invalid-argument",
        "projectId and accessState ('active'|'suspended') are required"
      );
    }

    const projectSnap = await db()
      .collection(COLLECTIONS.projects)
      .doc(projectId)
      .get();
    if (!projectSnap.exists) {
      throw new HttpsError("not-found", `Project ${projectId} not found`);
    }
    const slug =
      typeof projectSnap.data()?.slug === "string"
        ? (projectSnap.data()!.slug as string)
        : undefined;

    const result = await notifyProjectBillingAccess({
      projectId,
      accessState,
      reason,
      projectSlug: slug,
    });

    await db().collection(COLLECTIONS.auditLog).add({
      actorUid: request.auth.uid,
      action: "adminNotifyProjectBillingAccess",
      targetType: "project",
      targetId: projectId,
      meta: {
        accessState,
        dryRun: getBillingS2sDryRun(),
        notified: result.notified,
      },
      createdAt: new Date(),
    });

    return {
      ...result,
      dryRun: getBillingS2sDryRun(),
      warning:
        "Production Codex must not be suspended until dry-run is approved. Keep projectIntegrations.enabled=false and/or BILLING_S2S_DRY_RUN=true until then.",
    };
  }
);

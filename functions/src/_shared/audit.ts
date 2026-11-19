import { db } from "./admin";
import { COLLECTIONS } from "../types/models";

export async function writeAuditLog(params: {
  actorUid: string;
  action: string;
  targetType: string;
  targetId: string;
  meta?: Record<string, unknown>;
}): Promise<string> {
  const ref = await db().collection(COLLECTIONS.auditLog).add({
    actorUid: params.actorUid,
    action: params.action,
    targetType: params.targetType,
    targetId: params.targetId,
    ...(params.meta ? { meta: params.meta } : {}),
    createdAt: new Date(),
  });
  return ref.id;
}

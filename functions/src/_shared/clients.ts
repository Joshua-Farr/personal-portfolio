import { HttpsError } from "firebase-functions/v2/https";
import { db } from "./admin";
import { COLLECTIONS, ClientDoc, ServiceDoc } from "../types/models";
import { createStripeCustomer } from "./stripe";

export async function getClientOrThrow(clientId: string): Promise<ClientDoc & { id: string }> {
  const snap = await db().collection(COLLECTIONS.clients).doc(clientId).get();
  if (!snap.exists) {
    throw new HttpsError("not-found", `Client ${clientId} not found`);
  }
  return { id: snap.id, ...(snap.data() as ClientDoc) };
}

export async function ensureStripeCustomer(clientId: string): Promise<string> {
  const client = await getClientOrThrow(clientId);
  if (client.stripeCustomerId) {
    return client.stripeCustomerId;
  }

  const customer = await createStripeCustomer({
    name: client.name,
    email: client.billingEmail,
    metadata: {
      firestoreClientId: clientId,
      billingEmailIsTemporary: client.billingEmailIsTemporary ? "true" : "false",
    },
  });

  await db()
    .collection(COLLECTIONS.clients)
    .doc(clientId)
    .set(
      {
        stripeCustomerId: customer.id,
        updatedAt: new Date(),
      },
      { merge: true }
    );

  return customer.id;
}

export async function getServiceOrThrow(
  serviceId: string
): Promise<ServiceDoc & { id: string }> {
  const snap = await db().collection(COLLECTIONS.services).doc(serviceId).get();
  if (!snap.exists) {
    throw new HttpsError("not-found", `Service ${serviceId} not found`);
  }
  return { id: snap.id, ...(snap.data() as ServiceDoc) };
}

export function startsAtToUnix(startsAt: ServiceDoc["startsAt"]): number {
  if (startsAt instanceof Date) {
    return Math.floor(startsAt.getTime() / 1000);
  }
  if (typeof startsAt === "object" && startsAt && "toDate" in startsAt) {
    return Math.floor(startsAt.toDate().getTime() / 1000);
  }
  throw new HttpsError("failed-precondition", "Service startsAt is invalid");
}

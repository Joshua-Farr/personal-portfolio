import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
  type DocumentData,
} from "firebase/firestore";
import { getBillingFirestore } from "./firebase";
import { toDate } from "./billingFormat";

export type WithId<T = DocumentData> = T & { id: string };

function mapDocs<T = DocumentData>(snap: {
  docs: { id: string; data(): DocumentData }[];
}): WithId<T>[] {
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as T) }));
}

function sortByName(rows: WithId[]): WithId[] {
  return [...rows].sort((a, b) =>
    String(a.name ?? a.id).localeCompare(String(b.name ?? b.id))
  );
}

function sortByCreatedDesc(rows: WithId[]): WithId[] {
  return [...rows].sort((a, b) => {
    const da = toDate(a.createdAt as never)?.getTime() ?? 0;
    const db = toDate(b.createdAt as never)?.getTime() ?? 0;
    return db - da;
  });
}

export async function getClient(clientId: string) {
  const snap = await getDoc(doc(getBillingFirestore(), "clients", clientId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as WithId;
}

export async function listClients() {
  const snap = await getDocs(collection(getBillingFirestore(), "clients"));
  return sortByName(mapDocs(snap));
}

export async function listProjects(clientId?: string) {
  const col = collection(getBillingFirestore(), "projects");
  const snap = clientId
    ? await getDocs(query(col, where("clientId", "==", clientId)))
    : await getDocs(col);
  return sortByName(mapDocs(snap));
}

export async function getProject(projectId: string) {
  const snap = await getDoc(doc(getBillingFirestore(), "projects", projectId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as WithId;
}

export async function listServices(clientId?: string) {
  const col = collection(getBillingFirestore(), "services");
  const snap = clientId
    ? await getDocs(query(col, where("clientId", "==", clientId)))
    : await getDocs(col);
  return sortByName(mapDocs(snap));
}

export async function listSubscriptions(clientId?: string) {
  const col = collection(getBillingFirestore(), "subscriptions");
  const snap = clientId
    ? await getDocs(query(col, where("clientId", "==", clientId)))
    : await getDocs(col);
  return mapDocs(snap);
}

export async function getSubscription(subscriptionId: string) {
  const snap = await getDoc(
    doc(getBillingFirestore(), "subscriptions", subscriptionId)
  );
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as WithId;
}

export async function listInvoices(clientId?: string) {
  const col = collection(getBillingFirestore(), "invoices");
  const snap = clientId
    ? await getDocs(query(col, where("clientId", "==", clientId)))
    : await getDocs(col);
  return sortByCreatedDesc(mapDocs(snap));
}

export async function getInvoice(invoiceId: string) {
  const snap = await getDoc(doc(getBillingFirestore(), "invoices", invoiceId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as WithId;
}

export async function listAuditLog(limit = 50) {
  try {
    const snap = await getDocs(
      query(
        collection(getBillingFirestore(), "auditLog"),
        orderBy("createdAt", "desc")
      )
    );
    return mapDocs(snap).slice(0, limit);
  } catch {
    const snap = await getDocs(collection(getBillingFirestore(), "auditLog"));
    return sortByCreatedDesc(mapDocs(snap)).slice(0, limit);
  }
}

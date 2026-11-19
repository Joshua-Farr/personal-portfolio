import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAsyncLoad } from "../../../hooks/useAsyncLoad";
import {
  listClients,
  listInvoices,
  listProjects,
} from "../../../lib/billingData";
import {
  adminCreateOneTimeInvoice,
  callableErrorMessage,
} from "../../../lib/billingApi";
import {
  formatDate,
  formatMoney,
  invoiceStatusTone,
} from "../../../lib/billingFormat";
import {
  Card,
  CardTitle,
  ErrorText,
  Form,
  Input,
  Label,
  Muted,
  PrimaryButton,
  Select,
  StatusBadge,
  Table,
} from "../../../components/billing/billingStyles";

export function AdminInvoices() {
  const { data, error, loading, reload } = useAsyncLoad(async () => {
    const [invoices, clients, projects] = await Promise.all([
      listInvoices(),
      listClients(),
      listProjects(),
    ]);
    return { invoices, clients, projects };
  }, []);

  const [clientId, setClientId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [amount, setAmount] = useState("500");
  const [description, setDescription] = useState("One-time project fee");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    if (!data) return;
    if (!clientId && data.clients[0]) {
      setClientId(data.clients[0].id);
    }
  }, [data, clientId]);

  useEffect(() => {
    if (!data || !clientId) return;
    const projects = data.projects.filter((p) => p.clientId === clientId);
    if (!projects.some((p) => p.id === projectId)) {
      setProjectId(projects[0]?.id ?? "");
    }
  }, [data, clientId, projectId]);

  const onCreate = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setFormError(null);
    setResult(null);
    try {
      const amountCents = Math.round(Number(amount) * 100);
      if (!Number.isFinite(amountCents) || amountCents <= 0) {
        throw new Error("Enter a positive amount in USD");
      }
      const res = await adminCreateOneTimeInvoice({
        clientId,
        projectId,
        amountCents,
        description: description.trim(),
      });
      setResult(
        `Created ${res.invoiceDocId} (${res.stripeInvoiceId}) — ${res.status}`
      );
      reload();
    } catch (err) {
      setFormError(callableErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Muted>Loading invoices…</Muted>;
  if (error) return <ErrorText>{error}</ErrorText>;
  if (!data) return null;

  const clientProjects = data.projects.filter((p) => p.clientId === clientId);

  return (
    <>
      <Card>
        <CardTitle>Invoices</CardTitle>
        {data.invoices.length === 0 ? (
          <Muted>No invoices yet.</Muted>
        ) : (
          <Table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Client</th>
                <th>Amount</th>
                <th>Kind</th>
                <th>Status</th>
                <th>Pay link</th>
              </tr>
            </thead>
            <tbody>
              {data.invoices.map((inv) => (
                <tr key={inv.id}>
                  <td>{formatDate(inv.createdAt as never)}</td>
                  <td>
                    <Link to={`/admin/clients/${String(inv.clientId)}`}>
                      {String(inv.clientId)}
                    </Link>
                  </td>
                  <td>
                    {formatMoney(
                      Number(inv.amountCents),
                      String(inv.currency ?? "usd")
                    )}
                  </td>
                  <td>{String(inv.kind)}</td>
                  <td>
                    <StatusBadge
                      $tone={invoiceStatusTone(String(inv.status))}
                    >
                      {String(inv.status)}
                    </StatusBadge>
                  </td>
                  <td>
                    {typeof inv.hostedInvoiceUrl === "string" ? (
                      <a
                        href={inv.hostedInvoiceUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open →
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <Card>
        <CardTitle>Create one-time invoice</CardTitle>
        <Muted>
          Stripe send_invoice (test). Audited. Not for historical backfill.
        </Muted>
        <Form onSubmit={onCreate}>
          <Label>
            Client
            <Select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              required
              disabled={busy}
            >
              {data.clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {String(c.name)}
                </option>
              ))}
            </Select>
          </Label>
          <Label>
            Project
            <Select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              required
              disabled={busy}
            >
              {clientProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {String(p.name)}
                </option>
              ))}
            </Select>
          </Label>
          <Label>
            Amount (USD)
            <Input
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              disabled={busy}
            />
          </Label>
          <Label>
            Description
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              disabled={busy}
            />
          </Label>
          <PrimaryButton type="submit" disabled={busy || !projectId}>
            {busy ? "Creating…" : "Create one-time invoice"}
          </PrimaryButton>
        </Form>
        {formError && <ErrorText>{formError}</ErrorText>}
        {result && <Muted style={{ marginTop: "0.75rem" }}>{result}</Muted>}
      </Card>
    </>
  );
}

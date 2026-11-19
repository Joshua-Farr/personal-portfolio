import { FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAsyncLoad } from "../../../hooks/useAsyncLoad";
import {
  getClient,
  listProjects,
  listServices,
  listSubscriptions,
  listInvoices,
} from "../../../lib/billingData";
import {
  adminUpsertClient,
  adminAttachClientUser,
  adminUpsertProject,
  callableErrorMessage,
} from "../../../lib/billingApi";
import { formatMoney } from "../../../lib/billingFormat";
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
  Table,
  TextArea,
} from "../../../components/billing/billingStyles";

export function AdminClientDetail() {
  const { id } = useParams<{ id: string }>();
  const { data, error, loading, reload } = useAsyncLoad(async () => {
    if (!id) return null;
    const [client, projects, services, subscriptions, invoices] =
      await Promise.all([
        getClient(id),
        listProjects(id),
        listServices(id),
        listSubscriptions(id),
        listInvoices(id),
      ]);
    return { client, projects, services, subscriptions, invoices };
  }, [id]);

  const [name, setName] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  const [method, setMethod] = useState<"ach" | "card">("ach");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [projectName, setProjectName] = useState("");
  const [projectSlug, setProjectSlug] = useState("");

  const [memberUid, setMemberUid] = useState("");
  const [memberEmail, setMemberEmail] = useState("");

  useEffect(() => {
    if (!data?.client) return;
    setName(String(data.client.name ?? ""));
    setBillingEmail(String(data.client.billingEmail ?? ""));
    setMethod(
      data.client.preferredPaymentMethod === "card" ? "card" : "ach"
    );
    setNotes(String(data.client.notes ?? ""));
  }, [data?.client]);

  const onSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      await adminUpsertClient({
        clientId: id,
        name: name.trim(),
        billingEmail: billingEmail.trim(),
        preferredPaymentMethod: method,
        notes: notes.trim() || undefined,
        ensureStripeCustomer: true,
      });
      setMsg("Client updated");
      reload();
    } catch (error_) {
      setErr(callableErrorMessage(error_));
    } finally {
      setBusy(false);
    }
  };

  const onAddProject = async (e: FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      const res = await adminUpsertProject({
        clientId: id,
        name: projectName.trim(),
        slug: projectSlug.trim(),
        status: "active",
      });
      setMsg(`Project ${res.projectId} created`);
      setProjectName("");
      setProjectSlug("");
      reload();
    } catch (error_) {
      setErr(callableErrorMessage(error_));
    } finally {
      setBusy(false);
    }
  };

  const onAttachUser = async (e: FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      await adminAttachClientUser({
        uid: memberUid.trim(),
        email: memberEmail.trim(),
        clientId: id,
      });
      setMsg("Client user attached (claims + clientUsers)");
      setMemberUid("");
      setMemberEmail("");
    } catch (error_) {
      setErr(callableErrorMessage(error_));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Muted>Loading client…</Muted>;
  if (error) return <ErrorText>{error}</ErrorText>;
  if (!data?.client) return <Muted>Client not found.</Muted>;

  return (
    <>
      <Muted>
        <Link to="/admin/clients">← Clients</Link>
      </Muted>

      <Card>
        <CardTitle>{String(data.client.name)}</CardTitle>
        <Muted>
          Id <code>{data.client.id}</code> · Stripe{" "}
          <code>{String(data.client.stripeCustomerId ?? "—")}</code>
        </Muted>
        <Form onSubmit={onSave}>
          <Label>
            Name
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={busy}
            />
          </Label>
          <Label>
            Billing email
            <Input
              type="email"
              value={billingEmail}
              onChange={(e) => setBillingEmail(e.target.value)}
              required
              disabled={busy}
            />
          </Label>
          <Label>
            Preferred method
            <Select
              value={method}
              onChange={(e) => setMethod(e.target.value as "ach" | "card")}
              disabled={busy}
            >
              <option value="ach">ACH</option>
              <option value="card">Card</option>
            </Select>
          </Label>
          <Label>
            Notes
            <TextArea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={busy}
            />
          </Label>
          <PrimaryButton type="submit" disabled={busy}>
            {busy ? "Saving…" : "Save client"}
          </PrimaryButton>
        </Form>
      </Card>

      <Card>
        <CardTitle>Projects</CardTitle>
        {data.projects.length === 0 ? (
          <Muted>No projects.</Muted>
        ) : (
          <Table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Slug</th>
              </tr>
            </thead>
            <tbody>
              {data.projects.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link to={`/admin/projects/${p.id}`}>{String(p.name)}</Link>
                  </td>
                  <td>{String(p.status)}</td>
                  <td>
                    <code>{String(p.slug)}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
        <Form onSubmit={onAddProject}>
          <Label>
            New project name
            <Input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
              disabled={busy}
            />
          </Label>
          <Label>
            Slug
            <Input
              value={projectSlug}
              onChange={(e) => setProjectSlug(e.target.value)}
              required
              disabled={busy}
            />
          </Label>
          <PrimaryButton type="submit" disabled={busy}>
            Add project
          </PrimaryButton>
        </Form>
      </Card>

      <Card>
        <CardTitle>Services & subscriptions</CardTitle>
        <Table>
          <thead>
            <tr>
              <th>Service</th>
              <th>Amount</th>
              <th>Active</th>
            </tr>
          </thead>
          <tbody>
            {data.services.map((s) => (
              <tr key={s.id}>
                <td>{String(s.name)}</td>
                <td>
                  {formatMoney(
                    Number(s.amountCents),
                    String(s.currency ?? "usd")
                  )}
                  /{String(s.interval)}
                </td>
                <td>{s.active === false ? "no" : "yes"}</td>
              </tr>
            ))}
          </tbody>
        </Table>
        <Muted style={{ marginTop: "1rem" }}>
          {data.subscriptions.length} subscription(s) ·{" "}
          {data.invoices.length} invoice(s) — see{" "}
          <Link to="/admin/subscriptions">Subscriptions</Link> /{" "}
          <Link to="/admin/invoices">Invoices</Link>
        </Muted>
      </Card>

      <Card>
        <CardTitle>Attach portal user</CardTitle>
        <Muted>
          Sets custom claims role=client and mirrors clientUsers. User must
          already exist in Auth.
        </Muted>
        <Form onSubmit={onAttachUser}>
          <Label>
            Auth uid
            <Input
              value={memberUid}
              onChange={(e) => setMemberUid(e.target.value)}
              required
              disabled={busy}
            />
          </Label>
          <Label>
            Email
            <Input
              type="email"
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
              required
              disabled={busy}
            />
          </Label>
          <PrimaryButton type="submit" disabled={busy}>
            Attach user
          </PrimaryButton>
        </Form>
      </Card>

      {err && <ErrorText>{err}</ErrorText>}
      {msg && <Muted style={{ marginTop: "0.75rem" }}>{msg}</Muted>}
    </>
  );
}

import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { useAsyncLoad } from "../../../hooks/useAsyncLoad";
import { listClients } from "../../../lib/billingData";
import {
  adminUpsertClient,
  callableErrorMessage,
} from "../../../lib/billingApi";
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

export function AdminClients() {
  const { data, error, loading, reload } = useAsyncLoad(
    () => listClients(),
    []
  );
  const [name, setName] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  const [method, setMethod] = useState<"ach" | "card">("ach");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const onCreate = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setFormError(null);
    setResult(null);
    try {
      const res = await adminUpsertClient({
        name: name.trim(),
        billingEmail: billingEmail.trim(),
        preferredPaymentMethod: method,
        notes: notes.trim() || undefined,
        billingEmailIsTemporary: true,
        ensureStripeCustomer: true,
      });
      setResult(
        `Created ${res.clientId}` +
          (res.stripeCustomerId ? ` · Stripe ${res.stripeCustomerId}` : "")
      );
      setName("");
      setBillingEmail("");
      setNotes("");
      reload();
    } catch (err) {
      setFormError(callableErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Card>
        <CardTitle>Clients</CardTitle>
        {loading && <Muted>Loading…</Muted>}
        {error && <ErrorText>{error}</ErrorText>}
        {data && data.length > 0 && (
          <Table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Billing email</th>
                <th>Method</th>
                <th>Stripe</th>
              </tr>
            </thead>
            <tbody>
              {data.map((c) => (
                <tr key={c.id}>
                  <td>
                    <Link to={`/admin/clients/${c.id}`}>{String(c.name)}</Link>
                  </td>
                  <td>
                    {String(c.billingEmail)}
                    {c.billingEmailIsTemporary ? " (temp)" : ""}
                  </td>
                  <td>{String(c.preferredPaymentMethod)}</td>
                  <td>
                    <code style={{ fontSize: "0.8rem" }}>
                      {String(c.stripeCustomerId ?? "—")}
                    </code>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
        {data && data.length === 0 && <Muted>No clients yet.</Muted>}
      </Card>

      <Card>
        <CardTitle>Create client</CardTitle>
        <Muted>
          Creates Firestore client + Stripe Customer (test). Writes an audit log
          entry.
        </Muted>
        <Form onSubmit={onCreate}>
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
            {busy ? "Saving…" : "Create client"}
          </PrimaryButton>
        </Form>
        {formError && <ErrorText>{formError}</ErrorText>}
        {result && <Muted style={{ marginTop: "0.75rem" }}>{result}</Muted>}
      </Card>
    </>
  );
}

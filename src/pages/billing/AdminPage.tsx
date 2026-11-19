import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { RequireAuth } from "../../components/billing/RequireAuth";
import { useAuth } from "../../lib/AuthContext";
import { adminCreateOneTimeInvoice } from "../../lib/billingApi";
import {
  Badge,
  Brand,
  Card,
  CardTitle,
  ErrorText,
  Form,
  Input,
  Label,
  Muted,
  Panel,
  PanelText,
  PanelTitle,
  PrimaryButton,
  Shell,
  TextButton,
  TopBar,
} from "../../components/billing/billingStyles";

const DEFAULT_CLIENT_ID = "client_impact";
const DEFAULT_PROJECT_ID = "project_one_piece_dojo_codex";

function AdminContent() {
  const { user, signOut } = useAuth();
  const [amount, setAmount] = useState("500");
  const [description, setDescription] = useState("One-time project fee");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const onCreateInvoice = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setBusy(true);
    try {
      const amountCents = Math.round(Number(amount) * 100);
      if (!Number.isFinite(amountCents) || amountCents <= 0) {
        throw new Error("Enter a positive amount in USD");
      }
      const res = await adminCreateOneTimeInvoice({
        clientId: DEFAULT_CLIENT_ID,
        projectId: DEFAULT_PROJECT_ID,
        amountCents,
        description: description.trim(),
      });
      setResult(
        `Created one-time invoice ${res.invoiceDocId} (${res.stripeInvoiceId}) — ${res.status}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create invoice");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Shell>
      <TopBar>
        <Brand>JOSHFARR · Admin</Brand>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <Muted style={{ margin: 0 }}>{user?.email}</Muted>
          <TextButton type="button" onClick={() => void signOut()}>
            Sign out
          </TextButton>
        </div>
      </TopBar>

      <Panel>
        <PanelTitle>Billing admin</PanelTitle>
        <PanelText>
          Phase B: create one-time invoices (distinct from subscriptions). Auth
          and data stay on the dedicated billing Firebase project — not
          dojo-codex. Stripe test mode only.
        </PanelText>
        <Badge>Stripe test mode only</Badge>
      </Panel>

      <Card>
        <CardTitle>Create one-time invoice</CardTitle>
        <Muted>
          Does not create historical Oct–Dec invoices. Defaults target the Impact
          / Codex seed ids (config defaults in UI only).
        </Muted>
        <Form onSubmit={onCreateInvoice}>
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
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              disabled={busy}
            />
          </Label>
          <PrimaryButton type="submit" disabled={busy}>
            {busy ? "Creating…" : "Create one-time invoice"}
          </PrimaryButton>
        </Form>
        {error && <ErrorText>{error}</ErrorText>}
        {result && <Muted style={{ marginTop: "0.75rem" }}>{result}</Muted>}
      </Card>

      <Card>
        <CardTitle>Seed snapshot</CardTitle>
        <Muted>
          Impact → One Piece Dojo Codex → $1,500/mo from Jan 1 2027. Temporary
          billing email: joshua.farr2015@gmail.com.
        </Muted>
      </Card>

      <Card>
        <CardTitle>Client portal</CardTitle>
        <Muted>
          <Link to="/portal">Client portal →</Link> (requires client role claims)
        </Muted>
      </Card>
    </Shell>
  );
}

export function AdminPage() {
  return (
    <RequireAuth role="admin">
      <AdminContent />
    </RequireAuth>
  );
}

import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { RequireAuth } from "../../components/billing/RequireAuth";
import { useAuth } from "../../lib/AuthContext";
import {
  openCustomerPortal,
  startSubscriptionCheckout,
} from "../../lib/billingApi";
import {
  Badge,
  Brand,
  Card,
  CardTitle,
  ErrorText,
  Muted,
  Panel,
  PanelText,
  PanelTitle,
  PrimaryButton,
  Shell,
  TextButton,
  TopBar,
} from "../../components/billing/billingStyles";

/** Seed service id — UI default only; callables resolve by id, not hardcoded business rules. */
const DEFAULT_SERVICE_ID = "service_codex_maintenance";
const DEFAULT_SUBSCRIPTION_ID = "subscription_codex_maintenance";

function PortalContent() {
  const { user, clientId, signOut } = useAuth();
  const [params] = useSearchParams();
  const checkoutState = params.get("checkout");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (label: string, fn: () => Promise<{ url: string }>) => {
    setError(null);
    setBusy(label);
    try {
      const { url } = await fn();
      if (!url) throw new Error("No Stripe URL returned");
      window.location.assign(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
      setBusy(null);
    }
  };

  return (
    <Shell>
      <TopBar>
        <Brand>JOSHFARR · Portal</Brand>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <Muted style={{ margin: 0 }}>{user?.email}</Muted>
          <TextButton type="button" onClick={() => void signOut()}>
            Sign out
          </TextButton>
        </div>
      </TopBar>

      <Panel>
        <PanelTitle>Client billing portal</PanelTitle>
        <PanelText>
          Enroll in recurring services via Checkout (ACH preferred, card
          alternative), manage payment methods in the Stripe Customer Portal, and
          track subscription vs one-time invoices synced from webhooks.
        </PanelText>
        <Badge>Client id: {clientId ?? "pending claim"}</Badge>
        {checkoutState === "success" && (
          <Badge style={{ marginLeft: "0.5rem" }}>Checkout completed</Badge>
        )}
        {checkoutState === "cancel" && (
          <Badge style={{ marginLeft: "0.5rem" }}>Checkout canceled</Badge>
        )}
      </Panel>

      <Card>
        <CardTitle>Subscription enrollment</CardTitle>
        <Muted>
          Recurring service starts on the service <code>startsAt</code> date
          (Impact/Codex seed: Jan 1 2027). No historical Oct–Dec invoices.
        </Muted>
        <PrimaryButton
          type="button"
          style={{ marginTop: "1rem" }}
          disabled={!!busy}
          onClick={() =>
            void run("checkout", () =>
              startSubscriptionCheckout({
                serviceId: DEFAULT_SERVICE_ID,
                subscriptionId: DEFAULT_SUBSCRIPTION_ID,
              })
            )
          }
        >
          {busy === "checkout" ? "Redirecting…" : "Start subscription Checkout"}
        </PrimaryButton>
      </Card>

      <Card>
        <CardTitle>Payment methods</CardTitle>
        <Muted>
          Opens Stripe Customer Portal (test mode). Prefer ACH; card remains
          available.
        </Muted>
        <PrimaryButton
          type="button"
          style={{ marginTop: "1rem" }}
          disabled={!!busy}
          onClick={() => void run("portal", () => openCustomerPortal())}
        >
          {busy === "portal" ? "Redirecting…" : "Open Customer Portal"}
        </PrimaryButton>
      </Card>

      <Card>
        <CardTitle>Invoices</CardTitle>
        <Muted>
          Subscription and one-time invoices are written by Stripe webhooks into
          Firestore (<code>kind: subscription | one_time</code>). Full list UI is
          Phase E — data sync is live in Phase B.
        </Muted>
      </Card>

      {error && <ErrorText style={{ marginTop: "1rem" }}>{error}</ErrorText>}

      <Card>
        <CardTitle>Help</CardTitle>
        <Muted>
          <Link to="/">Back to joshfarr.com →</Link>
        </Muted>
      </Card>
    </Shell>
  );
}

export function PortalPage() {
  return (
    <RequireAuth role="client">
      <PortalContent />
    </RequireAuth>
  );
}

import { Link } from "react-router-dom";
import { RequireAuth } from "../../components/billing/RequireAuth";
import { useAuth } from "../../lib/AuthContext";
import {
  Badge,
  Brand,
  Card,
  CardTitle,
  Muted,
  Panel,
  PanelText,
  PanelTitle,
  Shell,
  TextButton,
  TopBar,
} from "../../components/billing/billingStyles";

function PortalContent() {
  const { user, clientId, signOut } = useAuth();

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
          Phase A shell for invoices, payment methods, and project status.
          Checkout and ACH flows arrive in Phase B.
        </PanelText>
        <Badge>Client id: {clientId ?? "pending claim"}</Badge>
      </Panel>

      <Card>
        <CardTitle>Your projects</CardTitle>
        <Muted>
          Project and invoice lists will load from Firestore once membership
          claims and seed data are in place. No historical invoices before Jan
          2027.
        </Muted>
      </Card>

      <Card>
        <CardTitle>Help</CardTitle>
        <Muted>
          Questions? Reach out via the main site contact.{" "}
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

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

function AdminContent() {
  const { user, signOut } = useAuth();

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
          Phase A shell. Full client / project / invoice management lands in
          Phase E. Data and Auth are on the dedicated billing Firebase project
          (not dojo-codex).
        </PanelText>
        <Badge>Stripe test mode only</Badge>
      </Panel>

      <Card>
        <CardTitle>Seed snapshot (config, not hardcoded logic)</CardTitle>
        <Muted>
          After running the seed script you should see Impact → One Piece Dojo
          Codex → $1,500/mo starting Jan 1 2027. Temporary billing email:{" "}
          joshua.farr2015@gmail.com. No historical Oct–Dec invoices.
        </Muted>
        <Muted style={{ marginTop: "0.75rem" }}>
          See <code>docs/billing/SEED.md</code> and{" "}
          <code>functions/src/seed/</code>.
        </Muted>
      </Card>

      <Card>
        <CardTitle>Next</CardTitle>
        <Muted>
          Phase B: Checkout, subscriptions, webhook → Firestore sync.{" "}
          <Link to="/portal">Client portal shell →</Link>
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

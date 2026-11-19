import { Link } from "react-router-dom";
import { useAsyncLoad } from "../../../hooks/useAsyncLoad";
import {
  listClients,
  listInvoices,
  listProjects,
  listServices,
  listSubscriptions,
} from "../../../lib/billingData";
import {
  formatMoney,
  mrrFromService,
  subscriptionStatusTone,
} from "../../../lib/billingFormat";
import {
  Badge,
  Card,
  CardTitle,
  ErrorText,
  Muted,
  Panel,
  PanelText,
  PanelTitle,
  Stat,
  StatGrid,
  StatLabel,
  StatValue,
  StatusBadge,
  Table,
} from "../../../components/billing/billingStyles";

const MRR_STATUSES = new Set([
  "active",
  "trialing",
  "scheduled",
  "past_due",
]);

export function AdminOverview() {
  const { data, error, loading } = useAsyncLoad(async () => {
    const [clients, projects, services, subscriptions, invoices] =
      await Promise.all([
        listClients(),
        listProjects(),
        listServices(),
        listSubscriptions(),
        listInvoices(),
      ]);
    return { clients, projects, services, subscriptions, invoices };
  }, []);

  if (loading) return <Muted>Loading admin overview…</Muted>;
  if (error) return <ErrorText>{error}</ErrorText>;
  if (!data) return null;

  const mrrCents = data.subscriptions.reduce((sum, sub) => {
    if (!MRR_STATUSES.has(String(sub.status))) return sum;
    const service = data.services.find((s) => s.id === sub.serviceId);
    if (!service) return sum;
    return (
      sum +
      mrrFromService({
        amountCents: Number(service.amountCents),
        interval: String(service.interval),
        active: service.active !== false,
      })
    );
  }, 0);

  const outstandingCents = data.invoices
    .filter((i) => i.status === "open" || i.status === "draft")
    .reduce((sum, i) => sum + Number(i.amountCents ?? 0), 0);

  const pastDue = data.subscriptions.filter(
    (s) => s.status === "past_due" || s.status === "unpaid"
  );

  return (
    <>
      <Panel>
        <PanelTitle>Billing admin</PanelTitle>
        <PanelText>
          Dedicated Firebase billing project (isolated from dojo-codex). Stripe
          test mode only — no live charges until explicit go-live.
        </PanelText>
        <Badge>Stripe test mode</Badge>
        <StatGrid>
          <Stat>
            <StatLabel>MRR</StatLabel>
            <StatValue>{formatMoney(mrrCents)}</StatValue>
          </Stat>
          <Stat>
            <StatLabel>Outstanding</StatLabel>
            <StatValue>{formatMoney(outstandingCents)}</StatValue>
          </Stat>
          <Stat>
            <StatLabel>Clients</StatLabel>
            <StatValue>{data.clients.length}</StatValue>
          </Stat>
          <Stat>
            <StatLabel>Open invoices</StatLabel>
            <StatValue>
              {
                data.invoices.filter(
                  (i) => i.status === "open" || i.status === "draft"
                ).length
              }
            </StatValue>
          </Stat>
        </StatGrid>
      </Panel>

      <Card>
        <CardTitle>Attention</CardTitle>
        {pastDue.length === 0 ? (
          <Muted>No past_due / unpaid subscriptions.</Muted>
        ) : (
          <Table>
            <thead>
              <tr>
                <th>Subscription</th>
                <th>Client</th>
                <th>Status</th>
                <th>Access</th>
              </tr>
            </thead>
            <tbody>
              {pastDue.map((s) => (
                <tr key={s.id}>
                  <td>
                    <Link to="/admin/subscriptions">{s.id}</Link>
                  </td>
                  <td>{String(s.clientId)}</td>
                  <td>
                    <StatusBadge
                      $tone={subscriptionStatusTone(String(s.status))}
                    >
                      {String(s.status)}
                    </StatusBadge>
                  </td>
                  <td>{String(s.localAccessState ?? "—")}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <Card>
        <CardTitle>Quick links</CardTitle>
        <Muted>
          <Link to="/admin/clients">Manage clients</Link>
          {" · "}
          <Link to="/admin/invoices">Create invoices</Link>
          {" · "}
          <Link to="/admin/audit">Audit log</Link>
        </Muted>
      </Card>
    </>
  );
}

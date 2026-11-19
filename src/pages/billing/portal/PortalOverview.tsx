import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../../../lib/AuthContext";
import { useAsyncLoad } from "../../../hooks/useAsyncLoad";
import {
  listInvoices,
  listProjects,
  listServices,
  listSubscriptions,
  getClient,
} from "../../../lib/billingData";
import {
  formatDate,
  formatMoney,
  subscriptionStatusTone,
} from "../../../lib/billingFormat";
import {
  startSubscriptionCheckout,
  callableErrorMessage,
} from "../../../lib/billingApi";
import { useState } from "react";
import {
  Badge,
  Card,
  CardTitle,
  ErrorText,
  Inline,
  Muted,
  Panel,
  PanelText,
  PanelTitle,
  PrimaryButton,
  StatusBadge,
  Table,
} from "../../../components/billing/billingStyles";

export function PortalOverview() {
  const { clientId } = useAuth();
  const [params] = useSearchParams();
  const checkoutState = params.get("checkout");
  const [busy, setBusy] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, error, loading } = useAsyncLoad(async () => {
    if (!clientId) return null;
    const [client, projects, services, subscriptions, invoices] =
      await Promise.all([
        getClient(clientId),
        listProjects(clientId),
        listServices(clientId),
        listSubscriptions(clientId),
        listInvoices(clientId),
      ]);
    return { client, projects, services, subscriptions, invoices };
  }, [clientId]);

  const openInvoices =
    data?.invoices.filter((i) => i.status === "open" || i.status === "draft") ??
    [];

  const enroll = async (serviceId: string, subscriptionId?: string) => {
    setActionError(null);
    setBusy(serviceId);
    try {
      const { url } = await startSubscriptionCheckout({
        serviceId,
        subscriptionId,
      });
      if (!url) throw new Error("No Stripe URL returned");
      window.location.assign(url);
    } catch (err) {
      setActionError(callableErrorMessage(err));
      setBusy(null);
    }
  };

  if (loading) return <Muted>Loading portal…</Muted>;
  if (error) return <ErrorText>{error}</ErrorText>;
  if (!clientId) {
    return (
      <Muted>
        Your account is signed in but has no client claim yet. Ask an admin to
        attach your user to a client.
      </Muted>
    );
  }
  if (!data) return null;

  return (
    <>
      <Panel>
        <PanelTitle>{String(data.client?.name ?? "Client")} billing</PanelTitle>
        <PanelText>
          Review projects, subscription status, and open invoices. Pay via hosted
          Stripe links (test mode). ACH preferred.
        </PanelText>
        <Inline>
          <Badge>Client id: {clientId}</Badge>
          {checkoutState === "success" && <Badge>Checkout completed</Badge>}
          {checkoutState === "cancel" && <Badge>Checkout canceled</Badge>}
        </Inline>
      </Panel>

      <Card>
        <CardTitle>Projects</CardTitle>
        {data.projects.length === 0 ? (
          <Muted>No projects yet.</Muted>
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
                  <td>{String(p.name)}</td>
                  <td>
                    <StatusBadge $tone="neutral">
                      {String(p.status)}
                    </StatusBadge>
                  </td>
                  <td>
                    <code>{String(p.slug)}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <Card>
        <CardTitle>Subscriptions</CardTitle>
        {data.subscriptions.length === 0 ? (
          <Muted>No subscriptions yet.</Muted>
        ) : (
          <Table>
            <thead>
              <tr>
                <th>Service</th>
                <th>Status</th>
                <th>Access</th>
                <th>Period</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data.subscriptions.map((sub) => {
                const service = data.services.find(
                  (s) => s.id === sub.serviceId
                );
                const needsCheckout =
                  !sub.stripeSubscriptionId &&
                  (sub.status === "scheduled" || sub.status === "incomplete");
                return (
                  <tr key={sub.id}>
                    <td>
                      {String(service?.name ?? sub.serviceId)}
                      {service && (
                        <Muted style={{ margin: "0.25rem 0 0" }}>
                          {formatMoney(
                            Number(service.amountCents),
                            String(service.currency ?? "usd")
                          )}
                          /{String(service.interval)}
                          {service.startsAt
                            ? ` · starts ${formatDate(service.startsAt as never)}`
                            : ""}
                        </Muted>
                      )}
                    </td>
                    <td>
                      <StatusBadge
                        $tone={subscriptionStatusTone(String(sub.status))}
                      >
                        {String(sub.status)}
                      </StatusBadge>
                    </td>
                    <td>{String(sub.localAccessState ?? "—")}</td>
                    <td>
                      {formatDate(sub.currentPeriodStart as never)} –{" "}
                      {formatDate(sub.currentPeriodEnd as never)}
                    </td>
                    <td>
                      {needsCheckout && service && (
                        <PrimaryButton
                          type="button"
                          disabled={!!busy}
                          onClick={() =>
                            void enroll(String(service.id), sub.id)
                          }
                        >
                          {busy === service.id ? "Redirecting…" : "Enroll / pay"}
                        </PrimaryButton>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Card>

      <Card>
        <CardTitle>Open invoices</CardTitle>
        {openInvoices.length === 0 ? (
          <Muted>
            Nothing due right now.{" "}
            <Link to="/portal/invoices">View all invoices →</Link>
          </Muted>
        ) : (
          <>
            <Table>
              <thead>
                <tr>
                  <th>Amount</th>
                  <th>Kind</th>
                  <th>Status</th>
                  <th>Pay</th>
                </tr>
              </thead>
              <tbody>
                {openInvoices.slice(0, 5).map((inv) => (
                  <tr key={inv.id}>
                    <td>
                      <Link to={`/portal/invoices/${inv.id}`}>
                        {formatMoney(
                          Number(inv.amountCents),
                          String(inv.currency ?? "usd")
                        )}
                      </Link>
                    </td>
                    <td>{String(inv.kind)}</td>
                    <td>{String(inv.status)}</td>
                    <td>
                      {typeof inv.hostedInvoiceUrl === "string" ? (
                        <a
                          href={inv.hostedInvoiceUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Pay invoice →
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Muted style={{ marginTop: "0.75rem" }}>
              <Link to="/portal/invoices">All invoices →</Link>
            </Muted>
          </>
        )}
      </Card>

      {actionError && <ErrorText style={{ marginTop: "1rem" }}>{actionError}</ErrorText>}
    </>
  );
}

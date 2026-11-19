import { useState } from "react";
import { Link } from "react-router-dom";
import { useAsyncLoad } from "../../../hooks/useAsyncLoad";
import {
  listServices,
  listSubscriptions,
} from "../../../lib/billingData";
import {
  adminUpdateSubscription,
  callableErrorMessage,
} from "../../../lib/billingApi";
import {
  formatDate,
  formatMoney,
  subscriptionStatusTone,
} from "../../../lib/billingFormat";
import {
  Card,
  CardTitle,
  ErrorText,
  Inline,
  Muted,
  PrimaryButton,
  SecondaryButton,
  StatusBadge,
  Table,
} from "../../../components/billing/billingStyles";

export function AdminSubscriptions() {
  const { data, error, loading, reload } = useAsyncLoad(async () => {
    const [subscriptions, services] = await Promise.all([
      listSubscriptions(),
      listServices(),
    ]);
    return { subscriptions, services };
  }, []);

  const [busyId, setBusyId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const runUpdate = async (
    subscriptionId: string,
    patch: { cancelAtPeriodEnd?: boolean; status?: string }
  ) => {
    setBusyId(subscriptionId);
    setErr(null);
    setMsg(null);
    try {
      const res = await adminUpdateSubscription({
        subscriptionId,
        ...patch,
      });
      setMsg(`Updated ${res.subscriptionId}`);
      reload();
    } catch (error_) {
      setErr(callableErrorMessage(error_));
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <Muted>Loading subscriptions…</Muted>;
  if (error) return <ErrorText>{error}</ErrorText>;
  if (!data) return null;

  return (
    <Card>
      <CardTitle>Subscriptions</CardTitle>
      <Muted>
        Stripe-linked status is webhook-owned. Local scheduled docs can set
        status; cancel-at-period-end syncs to Stripe when linked.
      </Muted>
      {data.subscriptions.length === 0 ? (
        <Muted style={{ marginTop: "1rem" }}>No subscriptions.</Muted>
      ) : (
        <Table>
          <thead>
            <tr>
              <th>Service</th>
              <th>Client</th>
              <th>Status</th>
              <th>Access</th>
              <th>Period</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.subscriptions.map((sub) => {
              const service = data.services.find(
                (s) => s.id === sub.serviceId
              );
              const busy = busyId === sub.id;
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
                      </Muted>
                    )}
                    <Muted style={{ margin: "0.15rem 0 0", fontSize: "0.8rem" }}>
                      <code>{sub.id}</code>
                    </Muted>
                  </td>
                  <td>
                    <Link to={`/admin/clients/${String(sub.clientId)}`}>
                      {String(sub.clientId)}
                    </Link>
                  </td>
                  <td>
                    <StatusBadge
                      $tone={subscriptionStatusTone(String(sub.status))}
                    >
                      {String(sub.status)}
                    </StatusBadge>
                    {sub.cancelAtPeriodEnd ? (
                      <Muted style={{ margin: "0.25rem 0 0" }}>
                        cancels at period end
                      </Muted>
                    ) : null}
                  </td>
                  <td>{String(sub.localAccessState ?? "—")}</td>
                  <td>
                    {formatDate(sub.currentPeriodStart as never)} –{" "}
                    {formatDate(sub.currentPeriodEnd as never)}
                  </td>
                  <td>
                    <Inline>
                      {sub.stripeSubscriptionId ? (
                        <PrimaryButton
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            void runUpdate(sub.id, {
                              cancelAtPeriodEnd: !sub.cancelAtPeriodEnd,
                            })
                          }
                        >
                          {sub.cancelAtPeriodEnd
                            ? "Keep renewing"
                            : "Cancel at period end"}
                        </PrimaryButton>
                      ) : (
                        <SecondaryButton
                          type="button"
                          disabled={busy || sub.status === "canceled"}
                          onClick={() =>
                            void runUpdate(sub.id, { status: "canceled" })
                          }
                        >
                          Mark canceled
                        </SecondaryButton>
                      )}
                    </Inline>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}
      {err && <ErrorText style={{ marginTop: "0.75rem" }}>{err}</ErrorText>}
      {msg && <Muted style={{ marginTop: "0.75rem" }}>{msg}</Muted>}
    </Card>
  );
}

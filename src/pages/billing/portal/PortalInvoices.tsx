import { Link } from "react-router-dom";
import { useAuth } from "../../../lib/AuthContext";
import { useAsyncLoad } from "../../../hooks/useAsyncLoad";
import { listInvoices } from "../../../lib/billingData";
import {
  formatDate,
  formatMoney,
  invoiceStatusTone,
} from "../../../lib/billingFormat";
import {
  Card,
  CardTitle,
  ErrorText,
  Muted,
  StatusBadge,
  Table,
} from "../../../components/billing/billingStyles";

export function PortalInvoices() {
  const { clientId } = useAuth();
  const { data, error, loading } = useAsyncLoad(async () => {
    if (!clientId) return [];
    return listInvoices(clientId);
  }, [clientId]);

  if (loading) return <Muted>Loading invoices…</Muted>;
  if (error) return <ErrorText>{error}</ErrorText>;

  return (
    <Card>
      <CardTitle>Invoices</CardTitle>
      <Muted>
        Subscription and one-time invoices synced from Stripe webhooks (test
        mode). No historical Oct–Dec 2026 invoices.
      </Muted>
      {!data || data.length === 0 ? (
        <Muted style={{ marginTop: "1rem" }}>No invoices yet.</Muted>
      ) : (
        <Table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Amount</th>
              <th>Kind</th>
              <th>Status</th>
              <th>Period</th>
              <th>Pay</th>
            </tr>
          </thead>
          <tbody>
            {data.map((inv) => (
              <tr key={inv.id}>
                <td>
                  <Link to={`/portal/invoices/${inv.id}`}>
                    {formatDate(inv.createdAt as never)}
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
                  <StatusBadge $tone={invoiceStatusTone(String(inv.status))}>
                    {String(inv.status)}
                  </StatusBadge>
                </td>
                <td>
                  {formatDate(inv.periodStart as never)} –{" "}
                  {formatDate(inv.periodEnd as never)}
                </td>
                <td>
                  {typeof inv.hostedInvoiceUrl === "string" &&
                  (inv.status === "open" || inv.status === "draft") ? (
                    <a
                      href={inv.hostedInvoiceUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Pay →
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
  );
}

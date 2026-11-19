import { Link, useParams } from "react-router-dom";
import { useAuth } from "../../../lib/AuthContext";
import { useAsyncLoad } from "../../../hooks/useAsyncLoad";
import { getInvoice } from "../../../lib/billingData";
import {
  formatDate,
  formatMoney,
  invoiceStatusTone,
} from "../../../lib/billingFormat";
import {
  Card,
  CardTitle,
  ErrorText,
  Inline,
  Muted,
  PrimaryButton,
  StatusBadge,
} from "../../../components/billing/billingStyles";

export function PortalInvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const { clientId } = useAuth();

  const { data, error, loading } = useAsyncLoad(async () => {
    if (!id) return null;
    return getInvoice(id);
  }, [id]);

  if (loading) return <Muted>Loading invoice…</Muted>;
  if (error) return <ErrorText>{error}</ErrorText>;
  if (!data) return <Muted>Invoice not found.</Muted>;
  if (clientId && data.clientId !== clientId) {
    return <ErrorText>This invoice is not for your account.</ErrorText>;
  }

  const canPay =
    typeof data.hostedInvoiceUrl === "string" &&
    (data.status === "open" || data.status === "draft");

  return (
    <Card>
      <Muted>
        <Link to="/portal/invoices">← Invoices</Link>
      </Muted>
      <CardTitle style={{ marginTop: "0.75rem" }}>
        Invoice{" "}
        {formatMoney(Number(data.amountCents), String(data.currency ?? "usd"))}
      </CardTitle>
      <Inline style={{ marginTop: "0.75rem" }}>
        <StatusBadge $tone={invoiceStatusTone(String(data.status))}>
          {String(data.status)}
        </StatusBadge>
        <Muted style={{ margin: 0 }}>Kind: {String(data.kind)}</Muted>
      </Inline>
      <Muted style={{ marginTop: "1rem" }}>
        Created {formatDate(data.createdAt as never)}
        <br />
        Period {formatDate(data.periodStart as never)} –{" "}
        {formatDate(data.periodEnd as never)}
        <br />
        Stripe id:{" "}
        <code>{String(data.stripeInvoiceId ?? "—")}</code>
      </Muted>
      {canPay && (
        <PrimaryButton
          type="button"
          style={{ marginTop: "1.25rem" }}
          onClick={() =>
            window.open(String(data.hostedInvoiceUrl), "_blank", "noopener")
          }
        >
          Pay with Stripe
        </PrimaryButton>
      )}
    </Card>
  );
}

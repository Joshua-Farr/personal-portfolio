import { useState } from "react";
import {
  openCustomerPortal,
  callableErrorMessage,
} from "../../../lib/billingApi";
import {
  Card,
  CardTitle,
  ErrorText,
  Muted,
  PrimaryButton,
} from "../../../components/billing/billingStyles";

export function PortalBilling() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openPortal = async () => {
    setError(null);
    setBusy(true);
    try {
      const { url } = await openCustomerPortal();
      if (!url) throw new Error("No Stripe portal URL returned");
      window.location.assign(url);
    } catch (err) {
      setError(callableErrorMessage(err));
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardTitle>Payment methods</CardTitle>
      <Muted>
        Opens the Stripe Customer Portal (test mode). Prefer ACH / US bank
        account; card remains available as a fallback.
      </Muted>
      <PrimaryButton
        type="button"
        style={{ marginTop: "1.25rem" }}
        disabled={busy}
        onClick={() => void openPortal()}
      >
        {busy ? "Redirecting…" : "Open Customer Portal"}
      </PrimaryButton>
      {error && <ErrorText style={{ marginTop: "0.75rem" }}>{error}</ErrorText>}
    </Card>
  );
}

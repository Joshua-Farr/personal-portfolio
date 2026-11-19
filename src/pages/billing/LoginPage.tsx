import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { httpsCallable } from "firebase/functions";
import { useAuth } from "../../lib/AuthContext";
import { getBillingFunctions, isFirebaseConfigured } from "../../lib/firebase";
import {
  Brand,
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
  TopBar,
} from "../../components/billing/billingStyles";

export function LoginPage() {
  const { user, role, loading, configured, signIn, refreshClaims } = useAuth();
  const location = useLocation();
  const from =
    (location.state as { from?: string } | null)?.from ??
    (role === "admin" ? "/admin" : "/portal");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user && role === "admin") {
    return <Navigate to="/admin" replace />;
  }
  if (!loading && user && role === "client") {
    return <Navigate to="/portal" replace />;
  }
  if (!loading && user && !role) {
    // Signed in but no claims yet — stay on login to allow bootstrap
  } else if (!loading && user) {
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
      await refreshClaims();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setSubmitting(false);
    }
  };

  const onBootstrapAdmin = async () => {
    setError(null);
    setSubmitting(true);
    try {
      if (!isFirebaseConfigured()) {
        throw new Error("Firebase not configured");
      }
      const fn = httpsCallable(getBillingFunctions(), "bootstrapAdmin");
      await fn({});
      await refreshClaims();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bootstrap failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Shell>
      <TopBar>
        <Brand>JOSHFARR</Brand>
        <Link to="/" style={{ color: "#3b3b3b", fontWeight: 500 }}>
          Back to site
        </Link>
      </TopBar>

      <Panel>
        <PanelTitle>Client billing login</PanelTitle>
        <PanelText>
          Sign in to the admin console or client portal. Auth lives in the
          dedicated joshfarr.com billing Firebase project — separate from Codex.
        </PanelText>

        {!configured && (
          <Muted style={{ color: "#5be9b9", marginTop: "1rem" }}>
            Frontend env not set yet. Configure VITE_FIREBASE_* (see
            docs/billing/SETUP.md).
          </Muted>
        )}

        <Form onSubmit={onSubmit}>
          <Label>
            Email
            <Input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={!configured || submitting}
            />
          </Label>
          <Label>
            Password
            <Input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={!configured || submitting}
            />
          </Label>
          {error && <ErrorText>{error}</ErrorText>}
          <PrimaryButton type="submit" disabled={!configured || submitting}>
            {submitting ? "Signing in…" : "Sign in"}
          </PrimaryButton>
        </Form>

        {user && !role && (
          <div style={{ marginTop: "1.25rem" }}>
            <Muted style={{ color: "rgba(255,255,255,0.85)" }}>
              Signed in, but no role claims yet. If you are on the admin
              allowlist, bootstrap admin access:
            </Muted>
            <PrimaryButton
              type="button"
              style={{ marginTop: "0.75rem" }}
              onClick={onBootstrapAdmin}
              disabled={submitting}
            >
              Bootstrap admin role
            </PrimaryButton>
          </div>
        )}
      </Panel>
    </Shell>
  );
}

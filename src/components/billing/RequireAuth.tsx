import { Navigate, useLocation } from "react-router-dom";
import { useAuth, type AppRole } from "../../lib/AuthContext";
import { Muted, Shell } from "./billingStyles";

type Props = {
  children: React.ReactNode;
  role?: AppRole;
};

export function RequireAuth({ children, role }: Props) {
  const { user, role: currentRole, loading, configured } = useAuth();
  const location = useLocation();

  if (!configured) {
    return (
      <Shell>
        <Muted>
          Billing Firebase is not configured yet. Add VITE_FIREBASE_* for the
          dedicated billing project (not dojo-codex). See docs/billing/SETUP.md.
        </Muted>
      </Shell>
    );
  }

  if (loading) {
    return (
      <Shell>
        <Muted>Loading…</Muted>
      </Shell>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (role && currentRole !== role) {
    if (currentRole === "admin") {
      return <Navigate to="/admin" replace />;
    }
    if (currentRole === "client") {
      return <Navigate to="/portal" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

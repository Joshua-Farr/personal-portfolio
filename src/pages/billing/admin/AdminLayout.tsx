import { NavLink, Outlet, Link } from "react-router-dom";
import styled from "styled-components";
import { RequireAuth } from "../../../components/billing/RequireAuth";
import { BillingThemeProvider } from "../../../components/billing/BillingThemeProvider";
import { useAuth } from "../../../lib/AuthContext";
import {
  Brand,
  Muted,
  Nav,
  Shell,
  TextButton,
  TopBar,
} from "../../../components/billing/billingStyles";

const StyledNavLink = styled(NavLink)`
  color: var(--billing-text, #3b3b3b);
  font-weight: 500;
  text-decoration: none;
  border-bottom: 2px solid transparent;
  padding-bottom: 0.15rem;

  &.active {
    color: var(--billing-navy, #141c3a);
    font-weight: 600;
    border-bottom-color: var(--billing-mint, #5be9b9);
  }

  &:hover {
    color: var(--billing-navy, #141c3a);
  }
`;

function AdminChrome() {
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

      <Nav>
        <StyledNavLink to="/admin" end>
          Overview
        </StyledNavLink>
        <StyledNavLink to="/admin/clients">Clients</StyledNavLink>
        <StyledNavLink to="/admin/projects">Projects</StyledNavLink>
        <StyledNavLink to="/admin/invoices">Invoices</StyledNavLink>
        <StyledNavLink to="/admin/subscriptions">Subscriptions</StyledNavLink>
        <StyledNavLink to="/admin/audit">Audit log</StyledNavLink>
        <Link to="/portal" style={{ marginLeft: "auto", fontWeight: 500 }}>
          Client portal →
        </Link>
      </Nav>

      <Outlet />
    </Shell>
  );
}

export function AdminLayout() {
  return (
    <RequireAuth role="admin">
      <BillingThemeProvider>
        <AdminChrome />
      </BillingThemeProvider>
    </RequireAuth>
  );
}

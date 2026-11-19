import { NavLink, Outlet, Link } from "react-router-dom";
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
import styled from "styled-components";

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

function PortalChrome() {
  const { user, signOut } = useAuth();

  return (
    <Shell>
      <TopBar>
        <Brand>JOSHFARR · Portal</Brand>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <Muted style={{ margin: 0 }}>{user?.email}</Muted>
          <TextButton type="button" onClick={() => void signOut()}>
            Sign out
          </TextButton>
        </div>
      </TopBar>

      <Nav>
        <StyledNavLink to="/portal" end>
          Overview
        </StyledNavLink>
        <StyledNavLink to="/portal/invoices">Invoices</StyledNavLink>
        <StyledNavLink to="/portal/billing">Payment methods</StyledNavLink>
        <Link to="/" style={{ marginLeft: "auto", fontWeight: 500 }}>
          joshfarr.com →
        </Link>
      </Nav>

      <Outlet />
    </Shell>
  );
}

export function PortalLayout() {
  return (
    <RequireAuth role="client">
      <BillingThemeProvider>
        <PortalChrome />
      </BillingThemeProvider>
    </RequireAuth>
  );
}

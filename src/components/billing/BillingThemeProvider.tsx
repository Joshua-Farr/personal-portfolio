import { ThemeProvider } from "styled-components";
import { billingTheme, billingCssVars } from "./billingTheme";
import styled from "styled-components";
import { useEffect, type ReactNode } from "react";

const Root = styled.div`
  ${billingCssVars}
  min-height: 100vh;
  color: var(--billing-text);
`;

/** Applies portal tokens + wider layout; marketing body max-width unchanged elsewhere. */
export function BillingThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.body.classList.add("billing-layout");
    return () => document.body.classList.remove("billing-layout");
  }, []);

  return (
    <ThemeProvider theme={billingTheme}>
      <Root>{children}</Root>
    </ThemeProvider>
  );
}

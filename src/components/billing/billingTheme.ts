/** Portal-only design tokens (navy/mint). Marketing pages stay untouched. */

export const billingTheme = {
  colors: {
    navy: "#141c3a",
    mint: "#5be9b9",
    text: "#3b3b3b",
    black: "#000000",
    white: "#ffffff",
    danger: "#b00020",
    border: "#cfcfcf",
    linkHover: "#535bf2",
    mutedBg: "rgba(91, 233, 185, 0.12)",
  },
  radii: {
    panel: "17px",
    card: "10px",
    badge: "8px",
  },
  shadow: "0px 3px 15px rgba(0, 0, 0, 0.2)",
} as const;

export type BillingTheme = typeof billingTheme;

export const billingCssVars = `
  --billing-navy: ${billingTheme.colors.navy};
  --billing-mint: ${billingTheme.colors.mint};
  --billing-text: ${billingTheme.colors.text};
  --billing-black: ${billingTheme.colors.black};
  --billing-white: ${billingTheme.colors.white};
  --billing-danger: ${billingTheme.colors.danger};
  --billing-border: ${billingTheme.colors.border};
  --billing-link-hover: ${billingTheme.colors.linkHover};
  --billing-radius-panel: ${billingTheme.radii.panel};
  --billing-radius-card: ${billingTheme.radii.card};
  --billing-shadow: ${billingTheme.shadow};
`;

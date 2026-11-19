import styled from "styled-components";

/** Shared portal chrome — navy/mint language from the marketing site, no redesign. */

export const Shell = styled.div`
  min-height: 100vh;
  padding: 2rem 0 4rem;
  color: var(--billing-text, #3b3b3b);
`;

export const TopBar = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

export const Brand = styled.span`
  font-size: 1.25rem;
  font-weight: 500;
  color: var(--billing-black, #000);
  letter-spacing: 0.02em;
`;

export const Nav = styled.nav`
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem 1rem;
  margin-bottom: 1.75rem;
`;

export const NavLink = styled.a<{ $active?: boolean }>`
  color: ${(p) =>
    p.$active ? "var(--billing-navy, #141c3a)" : "var(--billing-text, #3b3b3b)"};
  font-weight: ${(p) => (p.$active ? 600 : 500)};
  text-decoration: none;
  border-bottom: 2px solid
    ${(p) => (p.$active ? "var(--billing-mint, #5be9b9)" : "transparent")};
  padding-bottom: 0.15rem;

  &:hover {
    color: var(--billing-navy, #141c3a);
  }
`;

export const Panel = styled.section`
  background: var(--billing-navy, #141c3a);
  color: var(--billing-white, #ffffff);
  border-radius: var(--billing-radius-panel, 17px);
  padding: 2rem;
  box-shadow: var(--billing-shadow, 0px 3px 15px rgba(0, 0, 0, 0.2));
`;

export const PanelTitle = styled.h1`
  color: var(--billing-white, #ffffff);
  font-size: 1.75rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
`;

export const PanelText = styled.p`
  color: rgba(255, 255, 255, 0.85);
  font-weight: 300;
  font-size: 1.05rem;
  max-width: 36rem;
`;

export const Card = styled.section`
  margin-top: 1.5rem;
  padding: 1.5rem;
  border-radius: var(--billing-radius-card, 10px);
  background: #ffffff;
  box-shadow: var(--billing-shadow, 0px 3px 15px rgba(0, 0, 0, 0.2));
  color: var(--billing-text, #3b3b3b);
`;

export const CardTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: var(--billing-text, #3b3b3b);
`;

export const Muted = styled.p`
  font-weight: 300;
  color: var(--billing-text, #3b3b3b);
  opacity: 0.85;
`;

export const PrimaryButton = styled.button`
  appearance: none;
  border: 2px solid var(--billing-mint, #5be9b9);
  background: transparent;
  color: var(--billing-navy, #141c3a);
  border-radius: var(--billing-radius-panel, 17px);
  padding: 0.65rem 1.25rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;

  &:hover:not(:disabled) {
    background: var(--billing-mint, #5be9b9);
    color: var(--billing-navy, #141c3a);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const SecondaryButton = styled(PrimaryButton)`
  border-color: var(--billing-navy, #141c3a);
  color: var(--billing-navy, #141c3a);

  &:hover:not(:disabled) {
    background: var(--billing-navy, #141c3a);
    color: var(--billing-white, #ffffff);
  }
`;

export const GhostLink = styled.a`
  color: var(--billing-mint, #5be9b9);
  font-weight: 500;

  &:hover {
    color: var(--billing-white, #ffffff);
  }
`;

export const TextButton = styled.button`
  appearance: none;
  border: none;
  background: transparent;
  color: var(--billing-text, #3b3b3b);
  font-weight: 500;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;

  &:hover {
    color: var(--billing-link-hover, #535bf2);
  }
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 28rem;
  margin-top: 1.25rem;
`;

export const FormRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-end;
`;

export const Label = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-weight: 500;
  font-size: 0.95rem;
  flex: 1;
  min-width: 10rem;
`;

export const Input = styled.input`
  border: 1px solid var(--billing-border, #cfcfcf);
  border-radius: var(--billing-radius-card, 10px);
  padding: 0.65rem 0.85rem;
  color: var(--billing-text, #3b3b3b);
  background: #fff;

  &:focus {
    outline: 2px solid var(--billing-mint, #5be9b9);
    outline-offset: 1px;
  }
`;

export const Select = styled.select`
  border: 1px solid var(--billing-border, #cfcfcf);
  border-radius: var(--billing-radius-card, 10px);
  padding: 0.65rem 0.85rem;
  color: var(--billing-text, #3b3b3b);
  background: #fff;

  &:focus {
    outline: 2px solid var(--billing-mint, #5be9b9);
    outline-offset: 1px;
  }
`;

export const TextArea = styled.textarea`
  border: 1px solid var(--billing-border, #cfcfcf);
  border-radius: var(--billing-radius-card, 10px);
  padding: 0.65rem 0.85rem;
  color: var(--billing-text, #3b3b3b);
  background: #fff;
  min-height: 4.5rem;
  resize: vertical;

  &:focus {
    outline: 2px solid var(--billing-mint, #5be9b9);
    outline-offset: 1px;
  }
`;

export const ErrorText = styled.p`
  color: var(--billing-danger, #b00020);
  font-size: 0.95rem;
`;

export const Badge = styled.span`
  display: inline-block;
  margin-top: 0.75rem;
  padding: 0.25rem 0.6rem;
  border-radius: 8px;
  background: rgba(91, 233, 185, 0.2);
  color: var(--billing-mint, #5be9b9);
  font-size: 0.85rem;
  font-weight: 500;
`;

export const StatusBadge = styled.span<{ $tone?: "ok" | "warn" | "bad" | "neutral" }>`
  display: inline-block;
  padding: 0.2rem 0.55rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 500;
  background: ${(p) =>
    p.$tone === "ok"
      ? "rgba(91, 233, 185, 0.25)"
      : p.$tone === "warn"
        ? "rgba(255, 193, 7, 0.25)"
        : p.$tone === "bad"
          ? "rgba(176, 0, 32, 0.12)"
          : "rgba(20, 28, 58, 0.08)"};
  color: ${(p) =>
    p.$tone === "ok"
      ? "#0a7a55"
      : p.$tone === "warn"
        ? "#8a6d00"
        : p.$tone === "bad"
          ? "#b00020"
          : "var(--billing-navy, #141c3a)"};
`;

export const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
  margin-top: 1.25rem;
`;

export const Stat = styled.div`
  background: rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 1rem 1.15rem;
`;

export const StatLabel = styled.div`
  font-size: 0.85rem;
  opacity: 0.8;
  margin-bottom: 0.35rem;
`;

export const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 500;
  color: var(--billing-mint, #5be9b9);
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  font-size: 0.95rem;

  th,
  td {
    text-align: left;
    padding: 0.65rem 0.5rem;
    border-bottom: 1px solid #eee;
    vertical-align: top;
  }

  th {
    font-weight: 500;
    color: var(--billing-navy, #141c3a);
    font-size: 0.85rem;
  }

  a {
    color: var(--billing-navy, #141c3a);
    font-weight: 500;
  }
`;

export const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const Inline = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
`;

import styled from "styled-components";

/** Shared portal chrome — navy/mint language from the marketing site, no redesign. */

export const Shell = styled.div`
  min-height: 100vh;
  padding: 2rem 0 4rem;
  color: #3b3b3b;
`;

export const TopBar = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 2.5rem;
`;

export const Brand = styled.span`
  font-size: 1.25rem;
  font-weight: 500;
  color: #000;
  letter-spacing: 0.02em;
`;

export const Panel = styled.section`
  background: #141c3a;
  color: #ffffff;
  border-radius: 17px;
  padding: 2rem;
  box-shadow: 0px 3px 15px rgba(0, 0, 0, 0.2);
`;

export const PanelTitle = styled.h1`
  color: #ffffff;
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
  border-radius: 10px;
  background: #ffffff;
  box-shadow: 0px 3px 15px rgba(0, 0, 0, 0.2);
  color: #3b3b3b;
`;

export const CardTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #3b3b3b;
`;

export const Muted = styled.p`
  font-weight: 300;
  color: #3b3b3b;
  opacity: 0.85;
`;

export const PrimaryButton = styled.button`
  appearance: none;
  border: 2px solid #5be9b9;
  background: transparent;
  color: #141c3a;
  border-radius: 17px;
  padding: 0.65rem 1.25rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;

  &:hover:not(:disabled) {
    background: #5be9b9;
    color: #141c3a;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const GhostLink = styled.a`
  color: #5be9b9;
  font-weight: 500;

  &:hover {
    color: #ffffff;
  }
`;

export const TextButton = styled.button`
  appearance: none;
  border: none;
  background: transparent;
  color: #3b3b3b;
  font-weight: 500;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;

  &:hover {
    color: #535bf2;
  }
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 22rem;
  margin-top: 1.25rem;
`;

export const Label = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-weight: 500;
  font-size: 0.95rem;
`;

export const Input = styled.input`
  border: 1px solid #cfcfcf;
  border-radius: 10px;
  padding: 0.65rem 0.85rem;
  color: #3b3b3b;
  background: #fff;

  &:focus {
    outline: 2px solid #5be9b9;
    outline-offset: 1px;
  }
`;

export const ErrorText = styled.p`
  color: #b00020;
  font-size: 0.95rem;
`;

export const Badge = styled.span`
  display: inline-block;
  margin-top: 0.75rem;
  padding: 0.25rem 0.6rem;
  border-radius: 8px;
  background: rgba(91, 233, 185, 0.2);
  color: #5be9b9;
  font-size: 0.85rem;
  font-weight: 500;
`;

/** Shared money helpers for billing callables (no Firebase deps). */

export function assertPositiveCents(amountCents: unknown): number {
  const n = Number(amountCents);
  if (!Number.isFinite(n) || n <= 0) {
    throw new Error("amountCents must be positive");
  }
  return n;
}

/**
 * Shared price helpers. The backend re-validates every price (greater than 0, at most 2 decimals, at most
 * MAX_SERVICE_PRICE); these only give instant feedback and consistent ₹ formatting.
 */

/** Mirrors the backend default for app.pricing.max-price. */
export const MAX_SERVICE_PRICE = 100000;

/** Returns an error message for an invalid price string, or null when it is valid. Blank is NOT handled here. */
export function validatePriceInput(raw: string): string | null {
  const t = raw.trim();
  if (!/^\d+(\.\d{1,2})?$/.test(t)) return 'Enter a valid amount, e.g. 499 or 499.50 (numbers only).';
  const n = Number(t);
  if (n <= 0) return 'Price must be greater than ₹0.';
  if (n > MAX_SERVICE_PRICE) return `Price cannot be more than ₹${MAX_SERVICE_PRICE.toLocaleString('en-IN')}.`;
  return null;
}

/** 500 -> "₹500", 499.5 -> "₹499.50", 1500 -> "₹1,500". */
export function formatRupees(value: number | string): string {
  const n = Number(value);
  const hasPaise = Math.abs(n * 100 - Math.round(n) * 100) > 0.001;
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: hasPaise ? 2 : 0, maximumFractionDigits: 2 })}`;
}

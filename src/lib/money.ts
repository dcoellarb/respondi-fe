/** Formats minor currency units (e.g. cents) as a decimal string. */
export function formatMinorAsDecimal(priceMinor: number) {
  return (priceMinor / 100).toFixed(2);
}

/** Parses a decimal price string into minor units. Returns null if invalid. */
export function parseDecimalToMinor(value: string): number | null {
  const trimmed = value.trim().replace(",", ".");
  if (!trimmed) return null;
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) return null;
  const [whole, fraction = ""] = trimmed.split(".");
  const cents = (fraction + "00").slice(0, 2);
  const minor = Number(whole) * 100 + Number(cents);
  if (!Number.isFinite(minor) || minor < 0) return null;
  return minor;
}

export const PRICE_DECIMAL_PATTERN = /^\d+([.,]\d{1,2})?$/;

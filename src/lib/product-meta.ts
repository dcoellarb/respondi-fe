/**
 * Helpers for catalog items saved before the API stored kind/plans/rules
 * as first-class fields (meta was embedded in description).
 */

export type ProductKind = "product" | "service";

export type ProductMetaPlan = {
  name: string;
  priceMinor: number;
  rules?: string | null;
};

export type ProductMeta = {
  v: 1;
  kind: ProductKind;
  priceRules?: string | null;
  pricingRules?: string | null;
  plans?: ProductMetaPlan[];
};

const MARKER_START = "\n\n<!--respondi-meta:";
const MARKER_END = "-->";

export function stripProductMeta(description: string): string {
  const idx = description.lastIndexOf(MARKER_START);
  if (idx === -1) return description;
  return description.slice(0, idx).trimEnd();
}

export function parseProductMeta(
  description: string | null | undefined,
): ProductMeta | null {
  if (!description) return null;
  const start = description.lastIndexOf(MARKER_START);
  if (start === -1) return null;
  const jsonStart = start + MARKER_START.length;
  const end = description.indexOf(MARKER_END, jsonStart);
  if (end === -1) return null;
  try {
    const parsed = JSON.parse(description.slice(jsonStart, end)) as ProductMeta;
    if (parsed?.v !== 1) return null;
    if (parsed.kind !== "product" && parsed.kind !== "service") return null;
    return parsed;
  } catch {
    return null;
  }
}

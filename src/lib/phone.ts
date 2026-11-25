/** E.164 after compacting: + and 8–15 digits, first digit after + is 1–9. Matches the API. */
export const E164_PHONE_PATTERN = /^\+[1-9]\d{7,14}$/;

/** Strip spaces and common phone punctuation before validating. */
export function compactPhone(value: string) {
  return value.trim().replace(/[\s().-]/g, "");
}

/** Returns compact E.164 or null when the value is not a valid business phone. */
export function normalizePhone(value: string): string | null {
  const compact = compactPhone(value);
  return E164_PHONE_PATTERN.test(compact) ? compact : null;
}

export function isE164Phone(value: string) {
  return normalizePhone(value) !== null;
}

const UPI_ID_PATTERN =
  /^[a-zA-Z0-9][a-zA-Z0-9.\-_]{1,255}@[a-zA-Z][a-zA-Z0-9.\-]{1,63}$/;

export function normalizeUpiId(upiId: string): string {
  return upiId.trim().toLowerCase();
}

export function isValidUpiId(upiId: string): boolean {
  const normalized = normalizeUpiId(upiId);
  if (normalized.length < 5 || normalized.length > 320) {
    return false;
  }
  return UPI_ID_PATTERN.test(normalized);
}

export function validateUpiId(upiId: string): string {
  const normalized = normalizeUpiId(upiId);
  if (!isValidUpiId(normalized)) {
    throw new Error("Enter a valid UPI ID such as name@bank.");
  }
  return normalized;
}

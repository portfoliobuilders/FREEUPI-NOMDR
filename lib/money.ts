const PAISA_PER_RUPEE = 100;
const MAX_SAFE_PAISE = Number.MAX_SAFE_INTEGER;

export class MoneyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MoneyError";
  }
}

function assertSafeInteger(value: number, label: string): void {
  if (!Number.isSafeInteger(value)) {
    throw new MoneyError(`${label} must be a safe integer in paise.`);
  }
}

function stripGrouping(input: string): string {
  return input.replace(/[,\s]/g, "").trim();
}

/**
 * Convert a rupee amount to paise using integer arithmetic only.
 * Accepts "10.50", "10", "10.5", or 10.5 (the latter is converted via decimal string).
 */
export function rupeesToPaise(rupees: string | number): number {
  const raw =
    typeof rupees === "number" ? String(rupees) : stripGrouping(rupees);

  if (!raw) {
    throw new MoneyError("Amount is required.");
  }

  const match = /^(-)?(\d+)(?:\.(\d{1,2}))?$/.exec(raw);

  if (!match) {
    throw new MoneyError("Enter a valid amount with up to 2 decimal places.");
  }

  const sign = match[1] === "-" ? -1 : 1;
  const whole = match[2] ?? "0";
  const fraction = (match[3] ?? "").padEnd(2, "0");
  const paise = Number.parseInt(`${whole}${fraction}`, 10) * sign;

  assertSafeInteger(paise, "Amount");
  return paise;
}

/**
 * Convert paise to a rupee decimal string with exactly 2 fractional digits.
 * Returns a string to avoid floating-point money values.
 */
export function paiseToRupees(paise: number): string {
  assertSafeInteger(paise, "Amount");
  const negative = paise < 0;
  const absolute = Math.abs(paise);
  const rupees = Math.floor(absolute / PAISA_PER_RUPEE);
  const remainder = absolute % PAISA_PER_RUPEE;
  return `${negative ? "-" : ""}${rupees}.${remainder.toString().padStart(2, "0")}`;
}

function formatIndianInteger(value: number): string {
  const digits = Math.abs(value).toString();
  if (digits.length <= 3) {
    return digits;
  }

  const lastThree = digits.slice(-3);
  const rest = digits.slice(0, -3);
  const grouped = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return `${grouped},${lastThree}`;
}

export function formatINR(paise: number): string {
  assertSafeInteger(paise, "Amount");
  const negative = paise < 0;
  const absolute = Math.abs(paise);
  const rupees = Math.floor(absolute / PAISA_PER_RUPEE);
  const remainder = absolute % PAISA_PER_RUPEE;
  const formatted = `${formatIndianInteger(rupees)}.${remainder
    .toString()
    .padStart(2, "0")}`;
  return `${negative ? "-" : ""}₹${formatted}`;
}

export function sumPaise(amounts: readonly number[]): number {
  let total = 0;
  for (const amount of amounts) {
    assertSafeInteger(amount, "Amount");
    total += amount;
    if (!Number.isSafeInteger(total) || Math.abs(total) > MAX_SAFE_PAISE) {
      throw new MoneyError("Amount total exceeds the supported range.");
    }
  }
  return total;
}

export function isPositivePaise(paise: number): boolean {
  return Number.isSafeInteger(paise) && paise > 0;
}

export const MIN_PAYMENT_PAISE = 1;
export const MAX_INVOICE_PAISE = 10_00_00_000 * PAISA_PER_RUPEE;

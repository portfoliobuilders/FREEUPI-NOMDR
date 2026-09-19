import { MIN_PAYMENT_PAISE } from "@/lib/money";

export class AutoSplitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AutoSplitError";
  }
}

export const DEFAULT_MAX_PAYMENT_RUPEES = "1999";
export const DEFAULT_MAX_PAYMENT_PAISE = 199_900;
export const MAX_AUTO_SPLIT_PAYMENTS = 100;

/**
 * Split a total into as many max-sized integer payments as needed,
 * with the exact remainder on the final payment. Uses paise only.
 */
export function createAutoSplit(
  totalPaise: number,
  maxPaymentPaise: number,
): number[] {
  if (!Number.isSafeInteger(totalPaise) || totalPaise <= 0) {
    throw new AutoSplitError("Enter a valid invoice amount.");
  }
  if (!Number.isSafeInteger(maxPaymentPaise) || maxPaymentPaise <= 0) {
    throw new AutoSplitError("Enter a valid maximum amount per payment.");
  }
  if (maxPaymentPaise < MIN_PAYMENT_PAISE) {
    throw new AutoSplitError("Each payment must be at least ₹0.01.");
  }

  if (totalPaise <= maxPaymentPaise) {
    return [totalPaise];
  }

  const fullCount = Math.floor(totalPaise / maxPaymentPaise);
  const remainder = totalPaise % maxPaymentPaise;
  const paymentCount = remainder === 0 ? fullCount : fullCount + 1;

  if (paymentCount > MAX_AUTO_SPLIT_PAYMENTS) {
    throw new AutoSplitError(
      "This plan would create too many payment requests. Increase the maximum amount per payment.",
    );
  }

  const amounts: number[] = [];
  for (let index = 0; index < fullCount; index += 1) {
    amounts.push(maxPaymentPaise);
  }
  if (remainder > 0) {
    amounts.push(remainder);
  }

  return amounts;
}

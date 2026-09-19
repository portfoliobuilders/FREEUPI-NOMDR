import { isValidUpiId } from "@/lib/upi/validate-upi-id";
import type { PaymentStructure } from "@/lib/payments/payment-form-schema";

export interface GenerateReadinessInput {
  merchantName: string;
  upiId: string;
  totalPaise: number;
  reference: string;
  structure: PaymentStructure;
  customValid: boolean;
  autoValid: boolean;
  isSubmitting: boolean;
}

const MISSING_MERCHANT = "a merchant name";
const MISSING_UPI = "a valid UPI ID";
const MISSING_AMOUNT = "an amount";
const MISSING_REFERENCE = "an invoice / payment reference";

function formatList(items: string[]): string {
  if (items.length === 1) {
    return items[0];
  }
  if (items.length === 2) {
    return `${items[0]} and ${items[1]}`;
  }
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

export function generateBlockedReason(
  input: GenerateReadinessInput,
): string | null {
  if (input.isSubmitting) {
    return null;
  }

  if (input.structure === "custom" && !input.customValid) {
    return "Allocate the full amount (remaining ₹0.00) before generating QR codes.";
  }

  if (input.structure === "auto" && input.totalPaise > 0 && !input.autoValid) {
    return "Enter a valid maximum amount per payment.";
  }

  const missing: string[] = [];
  if (input.merchantName.trim().length < 2) {
    missing.push(MISSING_MERCHANT);
  }
  if (!isValidUpiId(input.upiId)) {
    missing.push(MISSING_UPI);
  }
  if (input.totalPaise <= 0) {
    missing.push(MISSING_AMOUNT);
  }
  if (input.reference.trim().length < 1) {
    missing.push(MISSING_REFERENCE);
  }

  if (missing.length === 0) {
    return null;
  }

  return `Enter ${formatList(missing)} to generate QR codes.`;
}

export function isGenerateButtonEnabled(input: GenerateReadinessInput): boolean {
  if (input.isSubmitting) {
    return false;
  }
  if (input.structure === "custom" && !input.customValid) {
    return false;
  }
  return true;
}

const NATIVE_TEXT_FIELDS = [
  "merchantName",
  "upiId",
  "totalAmountRupees",
  "reference",
  "note",
  "maxPaymentRupees",
] as const;

export function mergeAutofilledValues<T extends Record<string, unknown>>(
  current: T,
  native: FormData,
): Partial<T> {
  const patch: Partial<T> = {};
  for (const name of NATIVE_TEXT_FIELDS) {
    const nativeValue = String(native.get(name) ?? "");
    const rhfValue = String(current[name] ?? "");
    if (nativeValue.length > 0 && rhfValue.length === 0) {
      (patch as Record<string, string>)[name] = nativeValue;
    }
  }
  return patch;
}

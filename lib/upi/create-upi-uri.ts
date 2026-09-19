import { paiseToRupees } from "@/lib/money";
import { validateUpiId } from "@/lib/upi/validate-upi-id";
import { sanitizePaymentText } from "@/lib/security/sanitize";

export interface CreateUpiUriInput {
  upiId: string;
  payeeName: string;
  amountInPaise: number;
  note?: string;
  reference?: string;
}

export function createUpiUri({
  upiId,
  payeeName,
  amountInPaise,
  note,
  reference,
}: CreateUpiUriInput): string {
  const pa = validateUpiId(upiId);
  const pn = sanitizePaymentText(payeeName, 80);
  if (!pn) {
    throw new Error("Payee name is required.");
  }
  if (!Number.isSafeInteger(amountInPaise) || amountInPaise <= 0) {
    throw new Error("UPI amount must be a positive integer in paise.");
  }

  const params = new URLSearchParams();
  params.set("pa", pa);
  params.set("pn", pn);
  params.set("am", paiseToRupees(amountInPaise));
  params.set("cu", "INR");

  const tn = sanitizePaymentText(note ?? "", 50);
  if (tn) {
    params.set("tn", tn);
  }

  const tr = sanitizePaymentText(reference ?? "", 35);
  if (tr) {
    params.set("tr", tr);
  }

  return `upi://pay?${params.toString()}`;
}

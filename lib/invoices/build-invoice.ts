import { createUpiUri } from "@/lib/upi/create-upi-uri";
import { sanitizePaymentText } from "@/lib/security/sanitize";
import { normalizeUpiId } from "@/lib/upi/validate-upi-id";
import type { Invoice, PaymentRequest } from "@/types";
import type { PaymentPlan } from "@/lib/payments/create-payment-plan";

export interface BuildInvoiceInput {
  merchantName: string;
  upiId: string;
  reference: string;
  note: string;
  plan: PaymentPlan;
  userId?: string | null;
  id?: string;
  source?: Invoice["source"];
}

function createId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  throw new Error("Secure UUID generation is not available.");
}

export function buildInvoice(input: BuildInvoiceInput): Invoice {
  const now = new Date().toISOString();
  const invoiceId = input.id ?? createId();
  const merchantName = sanitizePaymentText(input.merchantName, 80);
  const upiId = normalizeUpiId(input.upiId);
  const reference = sanitizePaymentText(input.reference, 35);
  const note = sanitizePaymentText(input.note, 50);

  const payments: PaymentRequest[] = input.plan.amountsPaise.map(
    (amountPaise, index) => {
      const sequenceNumber = index + 1;
      const paymentId = createId();
      const paymentNote = note || reference;
      const paymentReference = `${reference}-${sequenceNumber}`;

      return {
        id: paymentId,
        invoiceId,
        sequenceNumber,
        amountPaise,
        upiUri: createUpiUri({
          upiId,
          payeeName: merchantName,
          amountInPaise: amountPaise,
          note: paymentNote,
          reference: paymentReference,
        }),
        status: "pending",
        manuallyVerified: false,
        createdAt: now,
        paidAt: null,
      };
    },
  );

  return {
    id: invoiceId,
    userId: input.userId ?? null,
    merchantName,
    upiId,
    totalAmountPaise: input.plan.totalAmountPaise,
    reference,
    note,
    status: "ready",
    createdAt: now,
    updatedAt: now,
    payments,
    source: input.source ?? "local",
  };
}

import type { Invoice, PaymentRequest, PaymentStatus } from "@/types";

export function collectedPaise(invoice: Pick<Invoice, "payments">): number {
  return invoice.payments.reduce((total, payment) => {
    return payment.status === "paid" ? total + payment.amountPaise : total;
  }, 0);
}

export function remainingPaise(invoice: Invoice): number {
  return invoice.totalAmountPaise - collectedPaise(invoice);
}

export function progressPercent(invoice: Invoice): number {
  if (invoice.totalAmountPaise <= 0) {
    return 0;
  }
  return Math.round((collectedPaise(invoice) * 100) / invoice.totalAmountPaise);
}

export function deriveInvoiceStatus(
  invoice: Pick<Invoice, "status" | "payments">,
): Invoice["status"] {
  if (invoice.status === "archived" || invoice.status === "expired") {
    return invoice.status;
  }

  const paidCount = invoice.payments.filter((payment) => payment.status === "paid").length;
  if (paidCount === 0) {
    return "ready";
  }
  if (paidCount === invoice.payments.length) {
    return "completed";
  }
  return "partially_paid";
}

export function withUpdatedPaymentStatus(
  invoice: Invoice,
  paymentId: string,
  status: PaymentStatus,
  options: { manuallyVerified: boolean },
): Invoice {
  const payments: PaymentRequest[] = invoice.payments.map((payment) => {
    if (payment.id !== paymentId) {
      return payment;
    }
    return {
      ...payment,
      status,
      manuallyVerified: status === "paid" ? options.manuallyVerified : false,
      paidAt: status === "paid" ? new Date().toISOString() : null,
    };
  });

  const next: Invoice = {
    ...invoice,
    payments,
    updatedAt: new Date().toISOString(),
  };
  next.status = deriveInvoiceStatus(next);
  return next;
}

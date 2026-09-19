"use client";

import { useEffect } from "react";
import { PaymentQr } from "@/components/qr/payment-qr";
import { useLocalInvoice } from "@/hooks/use-local-invoices";
import { formatINR } from "@/lib/money";
import type { Invoice } from "@/types";

export function PrintView({
  invoiceId,
  cloudInvoice,
}: {
  invoiceId: string;
  cloudInvoice: Invoice | null;
}) {
  const localInvoice = useLocalInvoice(invoiceId);
  const invoice = cloudInvoice ?? localInvoice;

  useEffect(() => {
    if (!invoice) {
      return undefined;
    }
    const timer = window.setTimeout(() => window.print(), 400);
    return () => window.clearTimeout(timer);
  }, [invoice]);

  if (!invoice) {
    return (
      <div className="p-10 text-center text-sm text-muted-foreground">
        Invoice not found for printing.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[210mm] bg-white p-6 print:p-0">
      <header className="mb-6 border-b border-border pb-4">
        <p className="text-xs font-medium tracking-wide text-primary uppercase">
          FREEUPI
        </p>
        <h1 className="text-2xl font-semibold">UPI payment requests</h1>
        <p className="text-sm text-muted-foreground">
          {invoice.merchantName} · {invoice.reference}
        </p>
      </header>

      <div className="grid gap-6">
        {invoice.payments.map((payment) => (
          <article
            key={payment.id}
            className="print-page grid gap-4 rounded-2xl border border-border p-4 sm:grid-cols-[220px_1fr]"
          >
            <PaymentQr
              value={payment.upiUri}
              label={`Printable QR for payment ${payment.sequenceNumber}`}
              size={200}
            />
            <div className="space-y-2 text-sm">
              <p className="font-semibold">
                Payment {payment.sequenceNumber} of {invoice.payments.length}
              </p>
              <p className="text-2xl font-semibold tabular-nums">
                {formatINR(payment.amountPaise)}
              </p>
              <p>
                <span className="text-muted-foreground">Merchant Name: </span>
                {invoice.merchantName}
              </p>
              <p>
                <span className="text-muted-foreground">Invoice Reference: </span>
                {invoice.reference}
              </p>
              <p className="break-all">
                <span className="text-muted-foreground">UPI ID: </span>
                {invoice.upiId}
              </p>
              <p>
                <span className="text-muted-foreground">Payment Note: </span>
                {invoice.note || "—"}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

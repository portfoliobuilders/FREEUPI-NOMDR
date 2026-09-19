"use client";

import Link from "next/link";
import { Printer } from "lucide-react";
import { toast } from "sonner";
import { PaymentGrid } from "@/components/payment/payment-grid";
import { PaymentSummary } from "@/components/payment/payment-summary";
import { ComplianceNotice } from "@/components/compliance/compliance-notice";
import { buttonVariants } from "@/components/ui/button";
import { formatINR } from "@/lib/money";
import { useLocalInvoice } from "@/hooks/use-local-invoices";
import { saveLocalInvoice } from "@/lib/storage/local-invoices";
import { withUpdatedPaymentStatus } from "@/lib/payments/invoice-status";
import { createManualPaymentVerificationProvider } from "@/lib/payments/verification";
import { updateCloudPaymentStatus } from "@/app/actions/invoices";
import { useState } from "react";
import type { Invoice, PaymentStatus } from "@/types";

const verifier = createManualPaymentVerificationProvider();

export function InvoiceDetail({
  invoiceId,
  cloudInvoice,
}: {
  invoiceId: string;
  cloudInvoice: Invoice | null;
}) {
  const localInvoice = useLocalInvoice(invoiceId);
  const [override, setOverride] = useState<Invoice | null>(null);
  const invoice = override ?? cloudInvoice ?? localInvoice;

  async function handleStatusChange(paymentId: string, status: PaymentStatus) {
    if (!invoice) {
      return;
    }

    if (invoice.source === "cloud") {
      const result = await updateCloudPaymentStatus({
        invoiceId: invoice.id,
        paymentId,
        status,
      });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
    } else {
      await verifier.verifyPayment({
        paymentId,
        invoiceId: invoice.id,
        status,
      });
    }

    const next = withUpdatedPaymentStatus(invoice, paymentId, status, {
      manuallyVerified: true,
    });
    if (next.source === "local") {
      saveLocalInvoice(next);
    }
    setOverride(next);
    toast.success(
      status === "paid" ? "Manually marked as paid" : `Payment updated to ${status}.`,
    );
  }

  if (!invoice) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-white p-10 text-center">
        <h1 className="text-xl font-semibold">Invoice not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This invoice is not in your account and was not found on this device.
        </p>
        <Link href="/" className={buttonVariants({ className: "mt-4 h-10" })}>
          Create a payment
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Invoice</p>
          <h1 className="text-2xl font-semibold tracking-tight">
            {invoice.reference}
          </h1>
        </div>
        <Link
          href={`/print/${invoice.id}`}
          className={buttonVariants({ variant: "outline", className: "h-10" })}
        >
          <Printer className="size-4" />
          Print All
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <PaymentSummary invoice={invoice} />
        <div className="rounded-2xl border border-border bg-white p-5 text-sm">
          <dl className="grid gap-3">
            <Info label="Invoice Amount" value={formatINR(invoice.totalAmountPaise)} />
            <Info label="Merchant Name" value={invoice.merchantName} />
            <Info label="UPI ID" value={invoice.upiId} />
            <Info label="Reference" value={invoice.reference} />
            <Info label="Notes" value={invoice.note || "—"} />
            <Info
              label="Created Date"
              value={new Intl.DateTimeFormat("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(new Date(invoice.createdAt))}
            />
          </dl>
          <p className="mt-4 text-xs leading-5 text-muted-foreground">
            Status changes are recorded in FREEUPI only. They do not confirm that
            a bank or PSP has settled the payment.
          </p>
        </div>
      </div>

      <PaymentGrid invoice={invoice} onStatusChange={handleStatusChange} />
      <ComplianceNotice />
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium break-all">{value}</dd>
    </div>
  );
}

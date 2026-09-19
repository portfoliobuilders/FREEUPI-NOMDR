"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Download, Printer, Save } from "lucide-react";
import JSZip from "jszip";
import { toast } from "sonner";
import { PaymentForm } from "@/components/payment/payment-form";
import { PaymentGrid } from "@/components/payment/payment-grid";
import { PaymentSummary } from "@/components/payment/payment-summary";
import { ComplianceNotice } from "@/components/compliance/compliance-notice";
import { Button, buttonVariants } from "@/components/ui/button";
import { formatINR, rupeesToPaise } from "@/lib/money";
import { createPaymentPlan } from "@/lib/payments/create-payment-plan";
import { validatePaymentPlan } from "@/lib/payments/validate-payment-plan";
import { buildInvoice } from "@/lib/invoices/build-invoice";
import { saveLocalInvoice } from "@/lib/storage/local-invoices";
import { withUpdatedPaymentStatus } from "@/lib/payments/invoice-status";
import { createManualPaymentVerificationProvider } from "@/lib/payments/verification";
import { dataUrlToBlob, downloadDataUrl, qrDataUrl } from "@/lib/qr/download";
import { saveInvoiceToAccount } from "@/app/actions/invoices";
import type { PaymentFormValues } from "@/lib/payments/payment-form-schema";
import type { Invoice, PaymentStatus } from "@/types";

const verifier = createManualPaymentVerificationProvider();

export function HomeGenerator() {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function handleGenerate(values: PaymentFormValues) {
    setBusy(true);
    try {
      const totalAmountPaise = rupeesToPaise(values.totalAmountRupees);
      const customAmountsPaise = (values.customPayments ?? []).map((row) =>
        rupeesToPaise(row.amount || "0"),
      );
      const plan = createPaymentPlan({
        totalAmountPaise,
        structure: values.structure,
        instalmentCount: values.instalmentCount,
        customAmountsPaise,
      });
      const validation = validatePaymentPlan(plan);
      if (!validation.valid) {
        toast.error(validation.errors[0] ?? "Payment plan is invalid.");
        return;
      }

      const next = buildInvoice({
        merchantName: values.merchantName,
        upiId: values.upiId,
        reference: values.reference,
        note: values.note,
        plan,
        source: "local",
      });
      saveLocalInvoice(next);
      setInvoice(next);
      toast.success("QR payment requests generated.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not generate payments.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleStatusChange(paymentId: string, status: PaymentStatus) {
    if (!invoice) {
      return;
    }
    const result = await verifier.verifyPayment({
      paymentId,
      invoiceId: invoice.id,
      status,
    });
    const next = withUpdatedPaymentStatus(invoice, paymentId, result.status, {
      manuallyVerified: !result.automaticallyVerified,
    });
    saveLocalInvoice(next);
    setInvoice(next);
    if (status === "paid") {
      toast.success("Manually marked as paid");
    } else {
      toast.success(`Payment updated to ${status}.`);
    }
  }

  async function handleSave() {
    if (!invoice) {
      return;
    }
    setBusy(true);
    try {
      const result = await saveInvoiceToAccount(invoice);
      if (!result.ok) {
        toast.error(result.message);
        if (result.message.toLowerCase().includes("sign in")) {
          router.push("/login?next=/");
        }
        return;
      }
      toast.success("Invoice saved to your account.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDownloadZip() {
    if (!invoice) {
      return;
    }
    setBusy(true);
    try {
      const zip = new JSZip();
      for (const payment of invoice.payments) {
        const dataUrl = await qrDataUrl(payment.upiUri, 1024);
        zip.file(
          `payment-${payment.sequenceNumber}.png`,
          dataUrlToBlob(dataUrl),
        );
      }
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      downloadDataUrl(url, `FREEUPI-${invoice.reference}-qr-codes.zip`);
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Could not create the ZIP file.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,520px)_minmax(0,1fr)]">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="space-y-4"
      >
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
            Collect payments with UPI.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground">
            Create structured UPI payment requests for invoices, instalments and
            partial payments.
          </p>
        </div>
        <PaymentForm onGenerate={handleGenerate} isSubmitting={busy} />
        <ComplianceNotice compact />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="space-y-4"
      >
        <PaymentSummary invoice={invoice} />

        {invoice ? (
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/print/${invoice.id}`}
              className={buttonVariants({ variant: "outline", className: "h-10" })}
            >
              <Printer className="size-4" />
              Print All
            </Link>
            <Button
              type="button"
              variant="outline"
              className="h-10"
              onClick={() => void handleDownloadZip()}
              disabled={busy}
            >
              <Download className="size-4" />
              Download all QR
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-10"
              onClick={() => void handleSave()}
              disabled={busy}
            >
              <Save className="size-4" />
              Save invoice
            </Button>
            <Link
              href={`/invoice/${invoice.id}`}
              className={buttonVariants({ className: "h-10" })}
            >
              View invoice
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-white p-8 text-sm text-muted-foreground">
            Generate QR codes to preview payment cards, amounts such as{" "}
            <span className="font-medium text-foreground">{formatINR(8500_00)}</span>
            , and shareable UPI links. Guest plans stay on this device until you
            sign in to save them.
          </div>
        )}

        {invoice ? (
          <PaymentGrid invoice={invoice} onStatusChange={handleStatusChange} />
        ) : null}
      </motion.div>
    </div>
  );
}

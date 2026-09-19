"use client";

import { Loader2, QrCode } from "lucide-react";
import { formatINR } from "@/lib/money";
import {
  collectedPaise,
  progressPercent,
  remainingPaise,
} from "@/lib/payments/invoice-status";
import { InvoiceStatusBadge } from "@/components/status/status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  PAYMENT_DETAILS_FORM_ID,
  generateQrCodesLabel,
} from "@/components/payment/payment-form";
import type { PaymentPlan } from "@/lib/payments/create-payment-plan";
import type { PaymentStructure } from "@/lib/payments/payment-form-schema";
import type { Invoice } from "@/types";

export function PaymentSummary({
  invoice,
  preview,
  previewStructure,
  maxPaymentPaise,
  canGenerate = false,
  isSubmitting = false,
}: {
  invoice: Invoice | null;
  preview?: PaymentPlan | null;
  previewStructure?: PaymentStructure;
  maxPaymentPaise?: number;
  canGenerate?: boolean;
  isSubmitting?: boolean;
}) {
  const plan = invoice
    ? {
        totalAmountPaise: invoice.totalAmountPaise,
        amountsPaise: invoice.payments.map((payment) => payment.amountPaise),
        allocatedPaise: invoice.payments.reduce(
          (sum, payment) => sum + payment.amountPaise,
          0,
        ),
        remainingPaise: 0,
      }
    : preview;
  const collected = invoice ? collectedPaise(invoice) : 0;
  const outstanding = invoice ? remainingPaise(invoice) : plan?.remainingPaise ?? 0;
  const progress = invoice ? progressPercent(invoice) : 0;
  const paymentCount = plan?.amountsPaise.length ?? 0;
  const structure = preview?.structure ?? previewStructure;
  const showConfiguredMax =
    structure !== "single" &&
    typeof maxPaymentPaise === "number" &&
    maxPaymentPaise > 0;

  return (
    <Card className="border-border bg-white shadow-none ring-1 ring-border">
      <CardHeader className="border-b">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{invoice ? "Payment Summary" : "Payment Plan"}</CardTitle>
            <CardDescription>
              {invoice
                ? "Planned UPI requests for this invoice."
                : "Live preview before you generate QR codes."}
            </CardDescription>
          </div>
          {invoice ? <InvoiceStatusBadge status={invoice.status} /> : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-5 pt-1">
        <div className="grid grid-cols-2 gap-4">
          <SummaryStat
            label="Total amount"
            value={plan ? formatINR(plan.totalAmountPaise) : "₹0.00"}
          />
          {showConfiguredMax ? (
            <SummaryStat
              label="Maximum per payment"
              value={formatINR(maxPaymentPaise ?? 0)}
            />
          ) : null}
          <SummaryStat label="Payment requests" value={String(paymentCount)} />
          <SummaryStat
            label="Allocated"
            value={formatINR(plan?.allocatedPaise ?? 0)}
          />
          {invoice ? (
            <SummaryStat
              label="Collected"
              value={formatINR(collected)}
              tone="success"
            />
          ) : null}
          <SummaryStat
            label={invoice ? "Unpaid" : "Remaining"}
            value={formatINR(invoice ? outstanding : plan?.remainingPaise ?? 0)}
            tone={
              (invoice ? outstanding : plan?.remainingPaise ?? 0) === 0 &&
              paymentCount > 0
                ? "success"
                : "warning"
            }
          />
        </div>

        {invoice ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium tabular-nums">{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        ) : null}

        {plan && plan.amountsPaise.length > 0 ? (
          <ol className="space-y-2 rounded-xl border border-border bg-muted/50 p-4 text-sm">
            {plan.amountsPaise.map((amount, index) => (
              <li
                key={`${amount}-${index}`}
                className="flex items-center justify-between gap-3"
              >
                <span className="text-muted-foreground">{index + 1}</span>
                <span className="font-medium tabular-nums">{formatINR(amount)}</span>
              </li>
            ))}
            <li className="flex items-center justify-between gap-3 border-t border-border pt-2 font-medium">
              <span>Total allocated</span>
              <span className="tabular-nums">
                {formatINR(plan.allocatedPaise)}
              </span>
            </li>
            <li className="flex items-center justify-between gap-3 text-sm">
              <span className="text-muted-foreground">Remaining</span>
              <span className="tabular-nums">
                {formatINR(invoice ? 0 : plan.remainingPaise)}
              </span>
            </li>
          </ol>
        ) : (
          <p className="rounded-xl border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
            Enter a total amount to preview the payment plan.
          </p>
        )}

        {invoice ? (
          <dl className="space-y-2 rounded-xl border border-border bg-muted/50 p-4 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Merchant Name</dt>
              <dd className="text-right font-medium">
                {invoice.merchantName || "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">UPI ID</dt>
              <dd className="text-right font-medium break-all">
                {invoice.upiId || "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Reference</dt>
              <dd className="text-right font-medium">
                {invoice.reference || "—"}
              </dd>
            </div>
          </dl>
        ) : (
          <Button
            type="submit"
            form={PAYMENT_DETAILS_FORM_ID}
            nativeButton
            className="h-11 w-full disabled:bg-muted disabled:text-muted-foreground disabled:opacity-100"
            disabled={!canGenerate || isSubmitting}
            aria-disabled={!canGenerate || isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <QrCode className="size-4" />
            )}
            {generateQrCodesLabel(paymentCount)}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function SummaryStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "success" | "warning";
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/40 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={`mt-1 text-lg font-semibold tracking-tight tabular-nums ${
          tone === "success"
            ? "text-success"
            : tone === "warning"
              ? "text-warning"
              : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

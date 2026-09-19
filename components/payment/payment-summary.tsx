"use client";

import { formatINR } from "@/lib/money";
import {
  collectedPaise,
  progressPercent,
  remainingPaise,
} from "@/lib/payments/invoice-status";
import { InvoiceStatusBadge } from "@/components/status/status-badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Invoice } from "@/types";

export function PaymentSummary({ invoice }: { invoice: Invoice | null }) {
  const collected = invoice ? collectedPaise(invoice) : 0;
  const remaining = invoice ? remainingPaise(invoice) : 0;
  const progress = invoice ? progressPercent(invoice) : 0;

  return (
    <Card className="border-border bg-white shadow-none ring-1 ring-border">
      <CardHeader className="border-b">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>Payment Summary</CardTitle>
            <CardDescription>
              Planned UPI requests for this invoice.
            </CardDescription>
          </div>
          {invoice ? <InvoiceStatusBadge status={invoice.status} /> : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-5 pt-1">
        <div className="grid grid-cols-2 gap-4">
          <SummaryStat
            label="Total Amount"
            value={invoice ? formatINR(invoice.totalAmountPaise) : "₹0.00"}
          />
          <SummaryStat
            label="Payment Requests"
            value={invoice ? String(invoice.payments.length) : "0"}
          />
          <SummaryStat
            label="Collected"
            value={formatINR(collected)}
            tone="success"
          />
          <SummaryStat
            label="Remaining"
            value={formatINR(remaining)}
            tone="warning"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium tabular-nums">{progress}%</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>

        <dl className="space-y-2 rounded-xl border border-border bg-muted/50 p-4 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Merchant Name</dt>
            <dd className="text-right font-medium">
              {invoice?.merchantName || "—"}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">UPI ID</dt>
            <dd className="text-right font-medium break-all">
              {invoice?.upiId || "—"}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Reference</dt>
            <dd className="text-right font-medium">
              {invoice?.reference || "—"}
            </dd>
          </div>
        </dl>
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

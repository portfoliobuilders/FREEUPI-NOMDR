"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  MoreHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { PaymentQr } from "@/components/qr/payment-qr";
import { PaymentStatusBadge } from "@/components/status/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { canOpenUpiDeepLink } from "@/lib/device";
import { formatINR } from "@/lib/money";
import { downloadQrPng } from "@/lib/qr/download";
import type { Invoice, PaymentRequest, PaymentStatus } from "@/types";

interface PaymentCardProps {
  invoice: Invoice;
  payment: PaymentRequest;
  onStatusChange?: (paymentId: string, status: PaymentStatus) => void;
}

export function PaymentCard({
  invoice,
  payment,
  onStatusChange,
}: PaymentCardProps) {
  const [downloading, setDownloading] = useState(false);
  const total = invoice.payments.length;
  const paid = payment.status === "paid";

  async function handleCopy() {
    await navigator.clipboard.writeText(payment.upiUri);
    toast.success("Payment link copied");
  }

  function handleOpenUpi() {
    if (canOpenUpiDeepLink()) {
      window.location.href = payment.upiUri;
      return;
    }
    toast.info("Scan QR using any UPI app");
  }

  async function handleDownload() {
    setDownloading(true);
    try {
      await downloadQrPng(
        payment.upiUri,
        `FREEUPI-${invoice.reference}-payment-${payment.sequenceNumber}.png`,
        1024,
      );
    } catch {
      toast.error("Could not download QR code.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <Card className="border-border bg-white shadow-none ring-1 ring-border">
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">
              Payment {payment.sequenceNumber} of {total}
            </p>
            <p className="text-xs text-muted-foreground">{invoice.reference}</p>
          </div>
          <div className="flex items-center gap-2">
            <PaymentStatusBadge status={payment.status} />
            {onStatusChange ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<Button variant="ghost" size="icon-sm" />}
                  aria-label="More payment actions"
                >
                  <MoreHorizontal className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-48">
                  <DropdownMenuItem
                    onClick={() => onStatusChange(payment.id, "paid")}
                  >
                    Mark as Paid
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onStatusChange(payment.id, "pending")}
                  >
                    Mark as Pending
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onStatusChange(payment.id, "expired")}
                  >
                    Mark as Expired
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => onStatusChange(payment.id, "cancelled")}
                  >
                    Cancel Payment
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>
        </div>

        {paid ? (
          <div className="flex items-center gap-2 rounded-xl border border-[#ABEFC6] bg-[#ECFDF3] px-3 py-2 text-sm text-[#027A48]">
            <CheckCircle2 className="size-4 shrink-0" />
            <div>
              <p className="font-medium">Payment marked as paid</p>
              {payment.manuallyVerified ? (
                <p className="text-xs">Manually marked as paid</p>
              ) : null}
            </div>
          </div>
        ) : (
          <PaymentQr
            value={payment.upiUri}
            label={`UPI QR code for payment ${payment.sequenceNumber} of ${total}`}
          />
        )}

        <div className="space-y-1 text-center">
          <p className="text-2xl font-semibold tracking-tight tabular-nums">
            {formatINR(payment.amountPaise)}
          </p>
          <p className="text-sm font-medium">{invoice.merchantName}</p>
          <p className="text-sm text-muted-foreground break-all">{invoice.upiId}</p>
          <p className="text-xs text-muted-foreground">{invoice.reference}</p>
        </div>

        <div className="grid gap-2">
          <Button type="button" onClick={handleOpenUpi} className="h-10">
            <ExternalLink className="size-4" />
            Open UPI App
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-10"
              onClick={() => void handleDownload()}
              disabled={downloading}
            >
              <Download className="size-4" />
              Download QR
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-10"
              onClick={() => void handleCopy()}
            >
              <Copy className="size-4" />
              Copy Payment Link
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

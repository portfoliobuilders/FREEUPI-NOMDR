import { cn } from "@/lib/utils";
import type { InvoiceStatus, PaymentStatus } from "@/types";

const paymentStyles: Record<PaymentStatus, string> = {
  pending: "bg-[#F2F4F7] text-[#667085]",
  paid: "bg-[#ECFDF3] text-[#027A48]",
  expired: "bg-[#FFFAEB] text-[#B54708]",
  cancelled: "bg-[#FEF3F2] text-[#B42318]",
};

const invoiceStyles: Record<InvoiceStatus, string> = {
  ready: "bg-[#EEF0FB] text-[#3D3CC9]",
  partially_paid: "bg-[#FFFAEB] text-[#B54708]",
  completed: "bg-[#ECFDF3] text-[#027A48]",
  expired: "bg-[#FFFAEB] text-[#B54708]",
  archived: "bg-[#F2F4F7] text-[#667085]",
};

const paymentLabels: Record<PaymentStatus, string> = {
  pending: "Pending",
  paid: "Paid",
  expired: "Expired",
  cancelled: "Cancelled",
};

const invoiceLabels: Record<InvoiceStatus, string> = {
  ready: "Ready",
  partially_paid: "Partially Paid",
  completed: "Completed",
  expired: "Expired",
  archived: "Archived",
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        paymentStyles[status],
      )}
    >
      {paymentLabels[status]}
    </span>
  );
}

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        invoiceStyles[status],
      )}
    >
      {invoiceLabels[status]}
    </span>
  );
}

"use client";

import { PaymentCard } from "@/components/payment/payment-card";
import type { Invoice, PaymentStatus } from "@/types";

export function PaymentGrid({
  invoice,
  onStatusChange,
}: {
  invoice: Invoice;
  onStatusChange?: (paymentId: string, status: PaymentStatus) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {invoice.payments.map((payment) => (
        <PaymentCard
          key={payment.id}
          invoice={invoice}
          payment={payment}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
}

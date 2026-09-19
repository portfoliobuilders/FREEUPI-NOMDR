import type { Invoice, InvoiceStatus, PaymentRequest, PaymentStatus } from "@/types";

interface PaymentRow {
  id: string;
  invoice_id: string;
  sequence_number: number;
  amount_paise: number | string;
  upi_uri: string;
  status: string;
  manually_verified: boolean;
  created_at: string;
  paid_at: string | null;
}

export interface InvoiceRow {
  id: string;
  user_id: string;
  merchant_name: string;
  upi_id: string;
  total_amount_paise: number | string;
  reference: string;
  note: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  payment_requests?: PaymentRow[] | null;
}

function asInvoiceStatus(value: string): InvoiceStatus {
  if (
    value === "ready" ||
    value === "partially_paid" ||
    value === "completed" ||
    value === "expired" ||
    value === "archived"
  ) {
    return value;
  }
  return "ready";
}

function asPaymentStatus(value: string): PaymentStatus {
  if (
    value === "pending" ||
    value === "paid" ||
    value === "expired" ||
    value === "cancelled"
  ) {
    return value;
  }
  return "pending";
}

export function mapPayment(row: PaymentRow): PaymentRequest {
  return {
    id: row.id,
    invoiceId: row.invoice_id,
    sequenceNumber: row.sequence_number,
    amountPaise: Number(row.amount_paise),
    upiUri: row.upi_uri,
    status: asPaymentStatus(row.status),
    manuallyVerified: row.manually_verified,
    createdAt: row.created_at,
    paidAt: row.paid_at,
  };
}

export function mapInvoice(row: InvoiceRow): Invoice {
  const payments = (row.payment_requests ?? [])
    .slice()
    .sort((a, b) => a.sequence_number - b.sequence_number)
    .map(mapPayment);

  return {
    id: row.id,
    userId: row.user_id,
    merchantName: row.merchant_name,
    upiId: row.upi_id,
    totalAmountPaise: Number(row.total_amount_paise),
    reference: row.reference,
    note: row.note ?? "",
    status: asInvoiceStatus(row.status),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    payments,
    source: "cloud",
  };
}

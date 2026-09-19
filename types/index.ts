export const PAYMENT_STATUSES = [
  "pending",
  "paid",
  "expired",
  "cancelled",
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const INVOICE_STATUSES = [
  "ready",
  "partially_paid",
  "completed",
  "expired",
  "archived",
] as const;

export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export interface PaymentRequest {
  id: string;
  invoiceId: string;
  sequenceNumber: number;
  amountPaise: number;
  upiUri: string;
  status: PaymentStatus;
  manuallyVerified: boolean;
  createdAt: string;
  paidAt: string | null;
}

export interface Invoice {
  id: string;
  userId: string | null;
  merchantName: string;
  upiId: string;
  totalAmountPaise: number;
  reference: string;
  note: string;
  status: InvoiceStatus;
  createdAt: string;
  updatedAt: string;
  payments: PaymentRequest[];
  source: "local" | "cloud";
}

export interface Profile {
  id: string;
  userId: string;
  businessName: string;
  upiId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentVerificationResult {
  paymentId: string;
  status: PaymentStatus;
  provider: string;
  verifiedAt: string;
  automaticallyVerified: boolean;
  notes: string;
}

export interface PaymentVerificationProvider {
  readonly name: string;
  verifyPayment(input: {
    paymentId: string;
    invoiceId: string;
  }): Promise<PaymentVerificationResult>;
  getPaymentStatus(input: {
    paymentId: string;
    invoiceId: string;
  }): Promise<PaymentVerificationResult>;
}

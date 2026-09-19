import type {
  PaymentStatus,
  PaymentVerificationProvider,
  PaymentVerificationResult,
} from "@/types";

/**
 * MVP verification is manual only. This provider never claims a bank,
 * PSP, or NPCI settlement has been confirmed.
 */
export class ManualPaymentVerificationProvider
  implements PaymentVerificationProvider
{
  readonly name = "manual";

  async verifyPayment(input: {
    paymentId: string;
    invoiceId: string;
    status?: PaymentStatus;
  }): Promise<PaymentVerificationResult> {
    const status = input.status ?? "paid";
    return {
      paymentId: input.paymentId,
      status,
      provider: this.name,
      verifiedAt: new Date().toISOString(),
      automaticallyVerified: false,
      notes:
        status === "paid"
          ? "Manually marked as paid. Bank settlement has not been verified."
          : `Manually updated to ${status}. No payment provider webhook was used.`,
    };
  }

  async getPaymentStatus(input: {
    paymentId: string;
    invoiceId: string;
    currentStatus: PaymentStatus;
  }): Promise<PaymentVerificationResult> {
    return {
      paymentId: input.paymentId,
      status: input.currentStatus,
      provider: this.name,
      verifiedAt: new Date().toISOString(),
      automaticallyVerified: false,
      notes:
        "Status is recorded in FREEUPI only. Automatic payment verification is not enabled.",
    };
  }
}

/**
 * Future integrations should implement PaymentVerificationProvider
 * without fabricating webhook payloads:
 * - Razorpay
 * - Cashfree
 * - PhonePe PG
 * - Paytm Business
 */
export function createManualPaymentVerificationProvider() {
  return new ManualPaymentVerificationProvider();
}

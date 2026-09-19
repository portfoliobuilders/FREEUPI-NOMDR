import { describe, expect, it } from "vitest";
import { buildInvoice } from "@/lib/invoices/build-invoice";
import { createPaymentPlan } from "@/lib/payments/create-payment-plan";
import { paiseToRupees } from "@/lib/money";

describe("buildInvoice UPI URIs", () => {
  it("uses the exact split amount and a unique transaction reference", () => {
    const plan = createPaymentPlan({
      totalAmountPaise: 250_000,
      structure: "auto",
      maxPaymentPaise: 199_900,
    });
    const invoice = buildInvoice({
      merchantName: "Merchant",
      upiId: "merchant@upi",
      reference: "INV-2048",
      note: "",
      plan,
      source: "local",
    });

    expect(invoice.payments).toHaveLength(2);
    expect(invoice.payments[0]?.amountPaise).toBe(199_900);
    expect(invoice.payments[1]?.amountPaise).toBe(50_100);

    const first = new URLSearchParams(
      invoice.payments[0]!.upiUri.slice("upi://pay?".length),
    );
    const second = new URLSearchParams(
      invoice.payments[1]!.upiUri.slice("upi://pay?".length),
    );

    expect(first.get("am")).toBe(paiseToRupees(199_900));
    expect(first.get("tn")).toBe("INV-2048");
    expect(first.get("tr")).toBe("INV-2048-1");
    expect(second.get("am")).toBe(paiseToRupees(50_100));
    expect(second.get("tn")).toBe("INV-2048");
    expect(second.get("tr")).toBe("INV-2048-2");
  });
});

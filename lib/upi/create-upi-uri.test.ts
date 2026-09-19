import { describe, expect, it } from "vitest";
import { createUpiUri } from "@/lib/upi/create-upi-uri";
import { isValidUpiId } from "@/lib/upi/validate-upi-id";

describe("UPI ID validation", () => {
  it("accepts standard VPA format", () => {
    expect(isValidUpiId("merchant@oksbi")).toBe(true);
    expect(isValidUpiId("priya-stores.1@okaxis")).toBe(true);
    expect(isValidUpiId("9656088266@ybl")).toBe(true);
  });

  it("rejects invalid identifiers", () => {
    expect(isValidUpiId("not-an-id")).toBe(false);
    expect(isValidUpiId("@bank")).toBe(false);
  });
});

describe("createUpiUri", () => {
  it("builds an encoded upi://pay URI", () => {
    const uri = createUpiUri({
      upiId: "merchant@oksbi",
      payeeName: "Priya Stores",
      amountInPaise: 250000,
      note: "Invoice 2048",
      reference: "INV-2048-1",
    });

    expect(uri.startsWith("upi://pay?")).toBe(true);
    const params = new URLSearchParams(uri.slice("upi://pay?".length));
    expect(params.get("pa")).toBe("merchant@oksbi");
    expect(params.get("pn")).toBe("Priya Stores");
    expect(params.get("am")).toBe("2500.00");
    expect(params.get("cu")).toBe("INR");
    expect(params.get("tn")).toBe("Invoice 2048");
    expect(params.get("tr")).toBe("INV-2048-1");
  });
});

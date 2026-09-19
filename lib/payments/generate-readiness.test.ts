import { describe, expect, it } from "vitest";
import {
  generateBlockedReason,
  isGenerateButtonEnabled,
  mergeAutofilledValues,
  type GenerateReadinessInput,
} from "@/lib/payments/generate-readiness";

const screenshotPlan: GenerateReadinessInput = {
  merchantName: "hifhgdg",
  upiId: "9656088266@ybl",
  totalPaise: 800_000,
  reference: "",
  structure: "auto",
  customValid: true,
  autoValid: true,
  isSubmitting: false,
};

describe("generate readiness", () => {
  it("treats the screenshot case as a missing reference, not a blocked plan", () => {
    expect(generateBlockedReason(screenshotPlan)).toBe(
      "Enter an invoice / payment reference to generate QR codes.",
    );
    expect(isGenerateButtonEnabled(screenshotPlan)).toBe(true);
  });

  it("accepts a filled phone-number UPI ID once a reference is present", () => {
    const ready = { ...screenshotPlan, reference: "INV-2048" };
    expect(generateBlockedReason(ready)).toBeNull();
    expect(isGenerateButtonEnabled(ready)).toBe(true);
  });

  it("keeps Generate clickable when merchant or UPI details are incomplete", () => {
    const incomplete = {
      ...screenshotPlan,
      merchantName: "",
      upiId: "",
    };
    expect(generateBlockedReason(incomplete)).toBe(
      "Enter a merchant name, a valid UPI ID, and an invoice / payment reference to generate QR codes.",
    );
    expect(isGenerateButtonEnabled(incomplete)).toBe(true);
  });

  it("disables Generate only for an incomplete custom split", () => {
    const custom = {
      ...screenshotPlan,
      structure: "custom" as const,
      customValid: false,
    };
    expect(generateBlockedReason(custom)).toBe(
      "Allocate the full amount (remaining ₹0.00) before generating QR codes.",
    );
    expect(isGenerateButtonEnabled(custom)).toBe(false);
  });

  it("disables Generate while a submit is in progress", () => {
    expect(
      isGenerateButtonEnabled({ ...screenshotPlan, isSubmitting: true }),
    ).toBe(false);
  });

  it("copies browser-autofilled native values that React state missed", () => {
    const native = new FormData();
    native.set("merchantName", "Priya Stores");
    native.set("upiId", "merchant@oksbi");
    native.set("reference", "INV-2048");

    expect(
      mergeAutofilledValues(
        {
          merchantName: "",
          upiId: "",
          totalAmountRupees: "8000",
          reference: "",
          note: "",
          maxPaymentRupees: "1999",
        },
        native,
      ),
    ).toEqual({
      merchantName: "Priya Stores",
      upiId: "merchant@oksbi",
      reference: "INV-2048",
    });
  });
});

import { describe, expect, it } from "vitest";
import { createAutoSplit } from "@/lib/payments/create-auto-split";
import { createPaymentPlan } from "@/lib/payments/create-payment-plan";
import { validatePaymentPlan } from "@/lib/payments/validate-payment-plan";

describe("payment plans", () => {
  it("builds an auto split from the merchant-selected maximum", () => {
    const plan = createPaymentPlan({
      totalAmountPaise: 850_000,
      structure: "auto",
      maxPaymentPaise: 199_900,
    });
    expect(plan.amountsPaise).toEqual(createAutoSplit(850_000, 199_900));
    expect(validatePaymentPlan(plan).valid).toBe(true);
    expect(plan.remainingPaise).toBe(0);
  });

  it("does not apply the auto-split maximum in single payment mode", () => {
    const plan = createPaymentPlan({
      totalAmountPaise: 850_000,
      structure: "single",
      maxPaymentPaise: 199_900,
    });
    expect(plan.amountsPaise).toEqual([850_000]);
    expect(validatePaymentPlan(plan).valid).toBe(true);
  });

  it("accepts a user-authored custom plan that sums to the total", () => {
    const plan = createPaymentPlan({
      totalAmountPaise: 250_000,
      structure: "custom",
      customAmountsPaise: [199_900, 50_100],
    });
    expect(validatePaymentPlan(plan).valid).toBe(true);
    expect(plan.amountsPaise).toEqual([199900, 50100]);
    expect(plan.remainingPaise).toBe(0);
  });

  it("requires custom payments to match the total", () => {
    const plan = createPaymentPlan({
      totalAmountPaise: 850000,
      structure: "custom",
      customAmountsPaise: [600000, 250000],
    });
    expect(validatePaymentPlan(plan).valid).toBe(true);
    expect(plan.remainingPaise).toBe(0);
  });

  it("flags an incomplete custom allocation", () => {
    const plan = createPaymentPlan({
      totalAmountPaise: 850000,
      structure: "custom",
      customAmountsPaise: [600000],
    });
    const result = validatePaymentPlan(plan);
    expect(result.valid).toBe(false);
    expect(result.allocatedPaise).toBe(600000);
    expect(result.remainingPaise).toBe(250000);
  });
});

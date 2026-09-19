import { describe, expect, it } from "vitest";
import {
  createPaymentPlan,
  splitEqualInstalments,
} from "@/lib/payments/create-payment-plan";
import { validatePaymentPlan } from "@/lib/payments/validate-payment-plan";

describe("payment plans", () => {
  it("places remainder on the final equal instalment", () => {
    expect(splitEqualInstalments(1001, 4)).toEqual([250, 250, 250, 251]);
    expect(splitEqualInstalments(1_000_000, 4)).toEqual([
      250000, 250000, 250000, 250000,
    ]);
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

import { sumPaise } from "@/lib/money";
import type { PaymentPlan } from "@/lib/payments/create-payment-plan";

export interface PaymentPlanValidation {
  valid: boolean;
  allocatedPaise: number;
  remainingPaise: number;
  errors: string[];
}

export function validatePaymentPlan(plan: PaymentPlan): PaymentPlanValidation {
  const errors: string[] = [];
  const allocatedPaise = sumPaise(plan.amountsPaise);
  const remainingPaise = plan.totalAmountPaise - allocatedPaise;

  if (plan.amountsPaise.length < 1) {
    errors.push("Add at least one payment.");
  }

  plan.amountsPaise.forEach((amount, index) => {
    if (!Number.isSafeInteger(amount) || amount <= 0) {
      errors.push(`Payment ${index + 1} must be greater than zero.`);
    }
  });

  if (remainingPaise !== 0) {
    errors.push("The sum of all payments must equal the invoice total.");
  }

  return {
    valid: errors.length === 0,
    allocatedPaise,
    remainingPaise,
    errors,
  };
}

export function isFullyAllocated(totalPaise: number, amounts: number[]): boolean {
  return sumPaise(amounts) === totalPaise && amounts.every((amount) => amount > 0);
}

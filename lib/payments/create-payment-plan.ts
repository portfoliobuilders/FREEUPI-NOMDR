import {
  MAX_INVOICE_PAISE,
  MIN_PAYMENT_PAISE,
  sumPaise,
} from "@/lib/money";
import { createAutoSplit } from "@/lib/payments/create-auto-split";
import type { PaymentStructure } from "@/lib/payments/payment-form-schema";

export class PaymentPlanError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PaymentPlanError";
  }
}

export interface CreatePaymentPlanInput {
  totalAmountPaise: number;
  structure: PaymentStructure;
  maxPaymentPaise?: number;
  customAmountsPaise?: number[];
}

export interface PaymentPlan {
  structure: PaymentStructure;
  totalAmountPaise: number;
  amountsPaise: number[];
  allocatedPaise: number;
  remainingPaise: number;
  maxPaymentPaise?: number;
}

export function createPaymentPlan(input: CreatePaymentPlanInput): PaymentPlan {
  const { totalAmountPaise, structure } = input;

  if (
    !Number.isSafeInteger(totalAmountPaise) ||
    totalAmountPaise < MIN_PAYMENT_PAISE ||
    totalAmountPaise > MAX_INVOICE_PAISE
  ) {
    throw new PaymentPlanError("Enter a valid invoice amount.");
  }

  let amountsPaise: number[] = [];
  let maxPaymentPaise: number | undefined;

  if (structure === "single") {
    amountsPaise = [totalAmountPaise];
  } else if (structure === "auto") {
    const selectedMax = input.maxPaymentPaise ?? 0;
    try {
      amountsPaise = createAutoSplit(totalAmountPaise, selectedMax);
    } catch (error) {
      throw new PaymentPlanError(
        error instanceof Error
          ? error.message
          : "Enter a valid maximum amount per payment.",
      );
    }
    maxPaymentPaise = selectedMax;
  } else {
    amountsPaise = (input.customAmountsPaise ?? []).map((amount) => {
      if (!Number.isSafeInteger(amount) || amount <= 0) {
        throw new PaymentPlanError("Each custom payment must be greater than zero.");
      }
      return amount;
    });
    if (amountsPaise.length < 1) {
      throw new PaymentPlanError("Add at least one custom payment.");
    }
    if (
      input.maxPaymentPaise &&
      Number.isSafeInteger(input.maxPaymentPaise) &&
      input.maxPaymentPaise > 0
    ) {
      maxPaymentPaise = input.maxPaymentPaise;
    }
  }

  const allocatedPaise = sumPaise(amountsPaise);
  return {
    structure,
    totalAmountPaise,
    amountsPaise,
    allocatedPaise,
    remainingPaise: totalAmountPaise - allocatedPaise,
    maxPaymentPaise,
  };
}

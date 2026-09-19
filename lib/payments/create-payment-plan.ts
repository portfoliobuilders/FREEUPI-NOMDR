import {
  MAX_INVOICE_PAISE,
  MIN_PAYMENT_PAISE,
  sumPaise,
} from "@/lib/money";
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
  instalmentCount?: number;
  customAmountsPaise?: number[];
}

export interface PaymentPlan {
  structure: PaymentStructure;
  totalAmountPaise: number;
  amountsPaise: number[];
  allocatedPaise: number;
  remainingPaise: number;
}

export function splitEqualInstalments(
  totalAmountPaise: number,
  instalmentCount: number,
): number[] {
  if (
    !Number.isSafeInteger(totalAmountPaise) ||
    totalAmountPaise < MIN_PAYMENT_PAISE
  ) {
    throw new PaymentPlanError("Enter a valid invoice amount.");
  }
  if (
    !Number.isSafeInteger(instalmentCount) ||
    instalmentCount < 2 ||
    instalmentCount > 48
  ) {
    throw new PaymentPlanError("Choose between 2 and 48 instalments.");
  }
  if (totalAmountPaise < instalmentCount) {
    throw new PaymentPlanError(
      "Each instalment must be at least ₹0.01. Reduce the number of payments.",
    );
  }

  const base = Math.floor(totalAmountPaise / instalmentCount);
  const remainder = totalAmountPaise % instalmentCount;

  return Array.from({ length: instalmentCount }, (_, index) =>
    index === instalmentCount - 1 ? base + remainder : base,
  );
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

  if (structure === "single") {
    amountsPaise = [totalAmountPaise];
  } else if (structure === "equal") {
    amountsPaise = splitEqualInstalments(
      totalAmountPaise,
      input.instalmentCount ?? 0,
    );
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
  }

  const allocatedPaise = sumPaise(amountsPaise);
  return {
    structure,
    totalAmountPaise,
    amountsPaise,
    allocatedPaise,
    remainingPaise: totalAmountPaise - allocatedPaise,
  };
}

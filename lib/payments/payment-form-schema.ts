import { z } from "zod";
import { isValidUpiId } from "@/lib/upi/validate-upi-id";
import { rupeesToPaise } from "@/lib/money";

export const PAYMENT_STRUCTURES = ["auto", "custom", "single"] as const;
export type PaymentStructure = (typeof PAYMENT_STRUCTURES)[number];

function isPositiveRupeeAmount(value: string): boolean {
  try {
    return rupeesToPaise(value) > 0;
  } catch {
    return false;
  }
}

export const paymentFormSchema = z
  .object({
    merchantName: z
      .string()
      .trim()
      .min(2, "Enter the merchant or account holder name.")
      .max(80, "Name must be 80 characters or fewer."),
    upiId: z
      .string()
      .trim()
      .min(1, "UPI ID is required.")
      .refine(isValidUpiId, "Enter a valid UPI ID such as name@oksbi."),
    totalAmountRupees: z
      .string()
      .trim()
      .min(1, "Enter the invoice amount.")
      .refine(
        isPositiveRupeeAmount,
        "Enter a valid amount greater than zero.",
      ),
    reference: z
      .string()
      .trim()
      .min(1, "Invoice or payment reference is required.")
      .max(35, "Reference must be 35 characters or fewer."),
    note: z.string().max(50, "Payment note must be 50 characters or fewer."),
    structure: z.enum(PAYMENT_STRUCTURES),
    maxPaymentRupees: z.string().optional(),
    customPayments: z
      .array(
        z.object({
          amount: z.string(),
        }),
      )
      .optional(),
  })
  .superRefine((value, ctx) => {
    if (value.structure === "auto") {
      const max = (value.maxPaymentRupees ?? "").trim();
      if (!max || !isPositiveRupeeAmount(max)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["maxPaymentRupees"],
          message: "Enter a valid maximum amount per payment.",
        });
      }
    }

    if (value.structure === "custom") {
      const amounts = value.customPayments ?? [];
      if (amounts.length < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["customPayments"],
          message: "Add at least one payment.",
        });
      }
    }
  });

export type PaymentFormValues = z.infer<typeof paymentFormSchema>;

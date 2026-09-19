"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatINR, rupeesToPaise, sumPaise } from "@/lib/money";
import type { PaymentFormValues } from "@/lib/payments/payment-form-schema";

function safePaise(value: string): number {
  try {
    return rupeesToPaise(value || "0");
  } catch {
    return 0;
  }
}

export function PaymentPlanEditor({
  totalAmountPaise,
}: {
  totalAmountPaise: number;
}) {
  const { control, register, watch } = useFormContext<PaymentFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "customPayments",
  });
  const amounts = watch("customPayments") ?? [];
  const allocated = sumPaise(amounts.map((row) => safePaise(row.amount)));
  const remaining = totalAmountPaise - allocated;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium">Custom payments</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ amount: "" })}
        >
          <Plus className="size-3.5" />
          Add Payment
        </Button>
      </div>

      <div className="space-y-3">
        {fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-[1fr_auto] gap-2">
            <div className="space-y-1.5">
              <Label htmlFor={`custom-amount-${index}`}>Payment {index + 1}</Label>
              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
                  ₹
                </span>
                <Input
                  id={`custom-amount-${index}`}
                  inputMode="decimal"
                  className="h-11 pl-7"
                  placeholder="0.00"
                  aria-label={`Payment ${index + 1} amount`}
                  {...register(`customPayments.${index}.amount`)}
                />
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="mt-6"
              aria-label={`Delete payment ${index + 1}`}
              onClick={() => remove(index)}
              disabled={fields.length === 1}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-muted/60 p-3 text-sm">
        <div>
          <p className="text-muted-foreground">Allocated Amount</p>
          <p className="mt-1 font-semibold tabular-nums">{formatINR(allocated)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Remaining Amount</p>
          <p
            className={`mt-1 font-semibold tabular-nums ${
              remaining === 0 ? "text-success" : "text-warning"
            }`}
          >
            {formatINR(remaining)}
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useMemo, type ReactNode } from "react";
import { Controller, FormProvider, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PaymentPlanEditor } from "@/components/payment/payment-plan-editor";
import { formatINR, rupeesToPaise } from "@/lib/money";
import {
  createPaymentPlan,
  splitEqualInstalments,
} from "@/lib/payments/create-payment-plan";
import {
  paymentFormSchema,
  type PaymentFormValues,
  type PaymentStructure,
} from "@/lib/payments/payment-form-schema";
import { isFullyAllocated } from "@/lib/payments/validate-payment-plan";

const STRUCTURE_LABELS: Record<PaymentStructure, string> = {
  single: "Single Payment",
  equal: "Equal Instalments",
  custom: "Custom Payments",
};

function parsePaise(value: string): number {
  try {
    return rupeesToPaise(value || "0");
  } catch {
    return 0;
  }
}

export function PaymentForm({
  onGenerate,
  isSubmitting = false,
}: {
  onGenerate: (values: PaymentFormValues) => void | Promise<void>;
  isSubmitting?: boolean;
}) {
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    mode: "onChange",
    defaultValues: {
      merchantName: "",
      upiId: "",
      totalAmountRupees: "",
      reference: "",
      note: "",
      structure: "single",
      instalmentCount: 4,
      customPayments: [{ amount: "" }],
    },
  });

  const structure = useWatch({ control: form.control, name: "structure" });
  const totalAmountRupees = useWatch({
    control: form.control,
    name: "totalAmountRupees",
  });
  const instalmentCount = useWatch({
    control: form.control,
    name: "instalmentCount",
  });
  const customPayments = useWatch({
    control: form.control,
    name: "customPayments",
  });

  const totalPaise = parsePaise(totalAmountRupees);
  const preview = useMemo(() => {
    try {
      if (structure === "equal") {
        const count = Number(instalmentCount || 0);
        if (count < 2 || totalPaise < count) {
          return null;
        }
        const amounts = splitEqualInstalments(totalPaise, count);
        return createPaymentPlan({
          totalAmountPaise: totalPaise,
          structure,
          instalmentCount: count,
          customAmountsPaise: amounts,
        });
      }
      if (structure === "custom") {
        return createPaymentPlan({
          totalAmountPaise: totalPaise,
          structure,
          customAmountsPaise: (customPayments ?? []).map((row) =>
            parsePaise(row.amount),
          ),
        });
      }
      if (totalPaise <= 0) {
        return null;
      }
      return createPaymentPlan({
        totalAmountPaise: totalPaise,
        structure: "single",
      });
    } catch {
      return null;
    }
  }, [structure, totalPaise, instalmentCount, customPayments]);

  const customValid =
    structure !== "custom" ||
    isFullyAllocated(
      totalPaise,
      (customPayments ?? []).map((row) => parsePaise(row.amount)),
    );

  const canGenerate =
    form.formState.isValid && customValid && totalPaise > 0 && !isSubmitting;

  return (
    <FormProvider {...form}>
      <Card className="border-border bg-white shadow-none ring-1 ring-border">
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
          <CardDescription>
            Create a structured UPI request. Saving an invoice requires an
            account; generating QR codes does not.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-5"
            onSubmit={form.handleSubmit((values) => void onGenerate(values))}
            noValidate
          >
            <Field
              id="merchantName"
              label="Merchant / Account Holder Name"
              error={form.formState.errors.merchantName?.message}
            >
              <Input
                id="merchantName"
                className="h-11"
                autoComplete="organization"
                placeholder="Priya Stores"
                {...form.register("merchantName")}
              />
            </Field>

            <Field
              id="upiId"
              label="UPI ID"
              error={form.formState.errors.upiId?.message}
            >
              <Input
                id="upiId"
                className="h-11"
                autoComplete="off"
                inputMode="email"
                placeholder="merchant@oksbi"
                {...form.register("upiId")}
              />
            </Field>

            <Field
              id="totalAmountRupees"
              label="Total Amount"
              error={form.formState.errors.totalAmountRupees?.message}
            >
              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
                  ₹
                </span>
                <Input
                  id="totalAmountRupees"
                  className="h-11 pl-7"
                  inputMode="decimal"
                  placeholder="8500.00"
                  {...form.register("totalAmountRupees")}
                />
              </div>
            </Field>

            <Field
              id="reference"
              label="Invoice / Payment Reference"
              error={form.formState.errors.reference?.message}
            >
              <Input
                id="reference"
                className="h-11"
                placeholder="INV-2048"
                {...form.register("reference")}
              />
            </Field>

            <Field id="note" label="Payment Note">
              <Textarea
                id="note"
                placeholder="Workshop deposit"
                maxLength={50}
                {...form.register("note")}
              />
            </Field>

            <div className="space-y-2">
              <Label htmlFor="structure">Payment Structure</Label>
              <Controller
                control={form.control}
                name="structure"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      if (value) {
                        field.onChange(value);
                      }
                    }}
                  >
                    <SelectTrigger id="structure" className="h-11 w-full">
                      <SelectValue>
                        {STRUCTURE_LABELS[field.value]}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="w-[var(--anchor-width)]" alignItemWithTrigger={false}>
                      <SelectItem value="single">Single Payment</SelectItem>
                      <SelectItem value="equal">Equal Instalments</SelectItem>
                      <SelectItem value="custom">Custom Payments</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {structure === "equal" ? (
              <div className="space-y-3">
                <Field
                  id="instalmentCount"
                  label="Number of instalments"
                  error={form.formState.errors.instalmentCount?.message}
                >
                  <Input
                    id="instalmentCount"
                    className="h-11"
                    type="number"
                    min={2}
                    max={48}
                    {...form.register("instalmentCount")}
                  />
                </Field>
                {preview ? (
                  <ol className="grid gap-2 rounded-xl border border-border bg-muted/50 p-3 text-sm">
                    {preview.amountsPaise.map((amount, index) => (
                      <li
                        key={`${amount}-${index}`}
                        className="flex items-center justify-between"
                      >
                        <span className="text-muted-foreground">
                          Payment {index + 1}
                        </span>
                        <span className="font-medium tabular-nums">
                          {formatINR(amount)}
                        </span>
                      </li>
                    ))}
                  </ol>
                ) : null}
              </div>
            ) : null}

            {structure === "custom" ? (
              <PaymentPlanEditor totalAmountPaise={totalPaise} />
            ) : null}

            <Button
              type="submit"
              className="h-11 w-full"
              disabled={!canGenerate}
            >
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <QrCode className="size-4" />
              )}
              Generate QR Codes
            </Button>
            <p className="text-center text-xs leading-5 text-muted-foreground">
              Your payment information is processed securely. FREEUPI never asks
              for your UPI PIN or OTP.
            </p>
          </form>
        </CardContent>
      </Card>
    </FormProvider>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

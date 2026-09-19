"use client";

import { useMemo, type ReactNode } from "react";
import { Controller, FormProvider, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, QrCode } from "lucide-react";
import { toast } from "sonner";
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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
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
import { isValidUpiId } from "@/lib/upi/validate-upi-id";

const STRUCTURE_OPTIONS: {
  value: PaymentStructure;
  title: string;
  description: string;
}[] = [
  {
    value: "single",
    title: "Single Payment",
    description: "One QR for the full invoice amount.",
  },
  {
    value: "equal",
    title: "Equal Split",
    description: "Divide evenly. Any leftover paise go on the last payment.",
  },
  {
    value: "custom",
    title: "Custom Split",
    description: "Enter each instalment. The parts must add up to the total.",
  },
];

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
      customPayments: [{ amount: "" }, { amount: "" }],
    },
  });

  const merchantName = useWatch({ control: form.control, name: "merchantName" });
  const upiId = useWatch({ control: form.control, name: "upiId" });
  const reference = useWatch({ control: form.control, name: "reference" });
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

  const totalPaise = parsePaise(totalAmountRupees ?? "");
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
    (merchantName ?? "").trim().length >= 2 &&
    isValidUpiId(upiId ?? "") &&
    totalPaise > 0 &&
    (reference ?? "").trim().length >= 1 &&
    customValid &&
    (structure !== "equal" || Number(instalmentCount) >= 2) &&
    !isSubmitting;

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
            onSubmit={form.handleSubmit(
              (values) => void onGenerate(values),
              () => {
                toast.error(
                  "Complete the payment details to generate QR codes.",
                );
              },
            )}
            noValidate
          >
            <Field
              id="merchantName"
              label="Merchant / Account Holder Name"
              error={form.formState.errors.merchantName?.message}
            >
              <Controller
                control={form.control}
                name="merchantName"
                render={({ field }) => (
                  <Input
                    id="merchantName"
                    className="h-11"
                    autoComplete="organization"
                    placeholder="Priya Stores"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                )}
              />
            </Field>

            <Field
              id="upiId"
              label="UPI ID"
              error={form.formState.errors.upiId?.message}
            >
              <Controller
                control={form.control}
                name="upiId"
                render={({ field }) => (
                  <Input
                    id="upiId"
                    className="h-11"
                    autoComplete="off"
                    inputMode="email"
                    placeholder="merchant@oksbi"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                )}
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
                <Controller
                  control={form.control}
                  name="totalAmountRupees"
                  render={({ field }) => (
                    <Input
                      id="totalAmountRupees"
                      className="h-11 pl-7"
                      inputMode="decimal"
                      placeholder="8500.00"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  )}
                />
              </div>
            </Field>

            <Field
              id="reference"
              label="Invoice / Payment Reference"
              error={form.formState.errors.reference?.message}
            >
              <Controller
                control={form.control}
                name="reference"
                render={({ field }) => (
                  <Input
                    id="reference"
                    className="h-11"
                    placeholder="INV-2048"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                )}
              />
            </Field>

            <Field id="note" label="Payment Note">
              <Controller
                control={form.control}
                name="note"
                render={({ field }) => (
                  <Textarea
                    id="note"
                    placeholder="Workshop deposit"
                    maxLength={50}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                )}
              />
            </Field>

            <fieldset className="space-y-3">
              <legend className="text-sm font-medium">Payment Structure</legend>
              <Controller
                control={form.control}
                name="structure"
                render={({ field }) => (
                  <div
                    role="radiogroup"
                    aria-label="Payment Structure"
                    className="grid gap-2"
                  >
                    {STRUCTURE_OPTIONS.map((option) => {
                      const selected = field.value === option.value;
                      return (
                        <label
                          key={option.value}
                          className={cn(
                            "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors",
                            selected
                              ? "border-primary bg-accent"
                              : "border-border bg-white hover:bg-muted/40",
                          )}
                        >
                          <input
                            type="radio"
                            name={field.name}
                            value={option.value}
                            checked={selected}
                            onChange={() => field.onChange(option.value)}
                            className="mt-1 size-4 accent-primary"
                          />
                          <span>
                            <span className="block text-sm font-medium">
                              {option.title}
                            </span>
                            <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
                              {option.description}
                            </span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              />
            </fieldset>

            {structure === "equal" ? (
              <div className="space-y-3">
                <Field
                  id="instalmentCount"
                  label="Number of instalments"
                  error={form.formState.errors.instalmentCount?.message}
                >
                  <Controller
                    control={form.control}
                    name="instalmentCount"
                    render={({ field }) => (
                      <Input
                        id="instalmentCount"
                        className="h-11"
                        type="number"
                        min={2}
                        max={48}
                        value={field.value ?? ""}
                        onChange={(event) =>
                          field.onChange(
                            event.target.value === ""
                              ? undefined
                              : Number(event.target.value),
                          )
                        }
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    )}
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
              nativeButton
              className="h-11 w-full disabled:bg-muted disabled:text-muted-foreground disabled:opacity-100"
              disabled={!canGenerate}
              aria-disabled={!canGenerate}
            >
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <QrCode className="size-4" />
              )}
              Generate QR Codes
            </Button>
            {!canGenerate ? (
              <p className="text-center text-xs text-muted-foreground">
                {structure === "custom" && !customValid
                  ? "Allocate the full amount (remaining ₹0.00) before generating QR codes."
                  : "Enter a merchant name, valid UPI ID, amount, and reference to generate QR codes."}
              </p>
            ) : null}
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

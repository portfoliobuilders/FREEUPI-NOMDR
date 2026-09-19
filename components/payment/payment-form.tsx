"use client";

import { useEffect, useMemo, type ReactNode } from "react";
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
import { DEFAULT_MAX_PAYMENT_RUPEES } from "@/lib/payments/create-auto-split";
import {
  createPaymentPlan,
  type PaymentPlan,
} from "@/lib/payments/create-payment-plan";
import {
  paymentFormSchema,
  type PaymentFormValues,
  type PaymentStructure,
} from "@/lib/payments/payment-form-schema";
import { isFullyAllocated } from "@/lib/payments/validate-payment-plan";
import { isValidUpiId } from "@/lib/upi/validate-upi-id";

export const PAYMENT_DETAILS_FORM_ID = "payment-details-form";

export interface PaymentPlanPreviewState {
  plan: PaymentPlan | null;
  maxPaymentPaise: number;
  canGenerate: boolean;
}

const STRUCTURE_OPTIONS: {
  value: PaymentStructure;
  title: string;
  description: string;
  secondary?: boolean;
}[] = [
  {
    value: "auto",
    title: "Auto Split",
    description:
      "Automatically create multiple QR payments based on your maximum amount per payment.",
  },
  {
    value: "custom",
    title: "Custom Split",
    description: "Manually enter each amount. The parts must add up to the total.",
  },
  {
    value: "single",
    title: "Single Payment",
    description: "Create one QR code for the full amount.",
    secondary: true,
  },
];

function parsePaise(value: string): number {
  try {
    const paise = rupeesToPaise(value || "0");
    return paise > 0 ? paise : 0;
  } catch {
    return 0;
  }
}

export function PaymentForm({
  onGenerate,
  onPlanChange,
  isSubmitting = false,
}: {
  onGenerate: (values: PaymentFormValues) => void | Promise<void>;
  onPlanChange?: (state: PaymentPlanPreviewState) => void;
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
      structure: "auto",
      maxPaymentRupees: DEFAULT_MAX_PAYMENT_RUPEES,
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
  const maxPaymentRupees = useWatch({
    control: form.control,
    name: "maxPaymentRupees",
  });
  const customPayments = useWatch({
    control: form.control,
    name: "customPayments",
  });

  const totalPaise = parsePaise(totalAmountRupees ?? "");
  const maxPaymentPaise = parsePaise(maxPaymentRupees ?? "");

  const preview = useMemo(() => {
    try {
      if (totalPaise <= 0) {
        return null;
      }
      if (structure === "auto") {
        if (maxPaymentPaise <= 0) {
          return null;
        }
        return createPaymentPlan({
          totalAmountPaise: totalPaise,
          structure: "auto",
          maxPaymentPaise,
        });
      }
      if (structure === "custom") {
        const customAmountsPaise = (customPayments ?? [])
          .map((row) => parsePaise(row.amount))
          .filter((amount) => amount > 0);
        if (customAmountsPaise.length === 0) {
          return {
            structure: "custom" as const,
            totalAmountPaise: totalPaise,
            amountsPaise: [],
            allocatedPaise: 0,
            remainingPaise: totalPaise,
            maxPaymentPaise: maxPaymentPaise > 0 ? maxPaymentPaise : undefined,
          };
        }
        return createPaymentPlan({
          totalAmountPaise: totalPaise,
          structure,
          maxPaymentPaise: maxPaymentPaise > 0 ? maxPaymentPaise : undefined,
          customAmountsPaise,
        });
      }
      return createPaymentPlan({
        totalAmountPaise: totalPaise,
        structure: "single",
      });
    } catch {
      return null;
    }
  }, [structure, totalPaise, maxPaymentPaise, customPayments]);

  const customValid =
    structure !== "custom" ||
    isFullyAllocated(
      totalPaise,
      (customPayments ?? []).map((row) => parsePaise(row.amount)),
    );

  const autoValid =
    structure !== "auto" ||
    (maxPaymentPaise > 0 &&
      preview !== null &&
      preview.remainingPaise === 0 &&
      preview.amountsPaise.length > 0);

  const canGenerate =
    (merchantName ?? "").trim().length >= 2 &&
    isValidUpiId(upiId ?? "") &&
    totalPaise > 0 &&
    (reference ?? "").trim().length >= 1 &&
    customValid &&
    autoValid &&
    !isSubmitting;

  useEffect(() => {
    onPlanChange?.({
      plan: preview,
      maxPaymentPaise,
      canGenerate,
    });
  }, [preview, maxPaymentPaise, canGenerate, onPlanChange]);

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
            id={PAYMENT_DETAILS_FORM_ID}
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
                      placeholder="8500"
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
                        <div
                          key={option.value}
                          className={cn(
                            "rounded-xl border transition-colors",
                            selected
                              ? "border-primary bg-accent"
                              : option.secondary
                                ? "border-dashed border-border bg-muted/30 hover:bg-muted/50"
                                : "border-border bg-white hover:bg-muted/40",
                          )}
                        >
                          <label className="flex cursor-pointer items-start gap-3 p-3">
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

                          {option.value === "auto" && selected ? (
                            <div className="space-y-3 border-t border-primary/15 px-3 pt-3 pb-3">
                              <Field
                                id="maxPaymentRupees"
                                label="Maximum amount per payment"
                                error={
                                  form.formState.errors.maxPaymentRupees?.message
                                }
                              >
                                <div className="relative">
                                  <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
                                    ₹
                                  </span>
                                  <Controller
                                    control={form.control}
                                    name="maxPaymentRupees"
                                    render={({ field: maxField }) => (
                                      <Input
                                        id="maxPaymentRupees"
                                        className="h-11 pl-7"
                                        inputMode="decimal"
                                        placeholder="1999"
                                        value={maxField.value ?? ""}
                                        onChange={maxField.onChange}
                                        onBlur={maxField.onBlur}
                                        name={maxField.name}
                                        ref={maxField.ref}
                                      />
                                    )}
                                  />
                                </div>
                              </Field>
                              <p className="text-xs leading-5 text-muted-foreground">
                                FREEUPI will create multiple payment requests so
                                that no individual request exceeds your selected
                                maximum.
                              </p>
                              {preview ? (
                                <div className="space-y-2 rounded-xl border border-border bg-white/80 p-3 text-sm">
                                  <p className="font-medium">
                                    {preview.amountsPaise.length} QR{" "}
                                    {preview.amountsPaise.length === 1
                                      ? "code"
                                      : "codes"}{" "}
                                    will be generated
                                  </p>
                                  <ol className="grid gap-1.5">
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
                                </div>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                )}
              />
            </fieldset>

            {structure === "custom" ? (
              <PaymentPlanEditor
                totalAmountPaise={totalPaise}
                maxPaymentPaise={maxPaymentPaise}
              />
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
              {preview && preview.amountsPaise.length > 0
                ? `Generate ${preview.amountsPaise.length} QR Codes`
                : "Generate QR Codes"}
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

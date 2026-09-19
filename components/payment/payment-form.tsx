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
import { isValidUpiId } from "@/lib/upi/validate-upi-id";

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
                    <SelectContent
                      className="w-[var(--anchor-width)]"
                      alignItemWithTrigger={false}
                    >
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
                Enter a merchant name, valid UPI ID, amount, and reference to
                generate QR codes.
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

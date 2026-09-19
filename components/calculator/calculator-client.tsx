"use client";

import { useMemo, useState } from "react";
import { formatINR, rupeesToPaise } from "@/lib/money";
import { DEFAULT_MAX_PAYMENT_RUPEES } from "@/lib/payments/create-auto-split";
import { createPaymentPlan } from "@/lib/payments/create-payment-plan";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ComplianceNotice } from "@/components/compliance/compliance-notice";

type Mode = "auto" | "custom" | "single";

function parsePaise(value: string): number {
  try {
    const paise = rupeesToPaise(value || "0");
    return paise > 0 ? paise : 0;
  } catch {
    return 0;
  }
}

export function CalculatorClient() {
  const [amount, setAmount] = useState("8500");
  const [mode, setMode] = useState<Mode>("auto");
  const [maxPayment, setMaxPayment] = useState(DEFAULT_MAX_PAYMENT_RUPEES);
  const [custom, setCustom] = useState(["1500", "1500", "1000"]);

  const plan = useMemo(() => {
    try {
      const totalAmountPaise = parsePaise(amount);
      if (totalAmountPaise <= 0) {
        return null;
      }
      const maxPaymentPaise = parsePaise(maxPayment);
      if (mode === "auto") {
        if (maxPaymentPaise <= 0) {
          return null;
        }
        return createPaymentPlan({
          totalAmountPaise,
          structure: "auto",
          maxPaymentPaise,
        });
      }
      if (mode === "single") {
        return createPaymentPlan({
          totalAmountPaise,
          structure: "single",
        });
      }
      return createPaymentPlan({
        totalAmountPaise,
        structure: "custom",
        maxPaymentPaise: maxPaymentPaise > 0 ? maxPaymentPaise : undefined,
        customAmountsPaise: custom.map((value) => parsePaise(value)),
      });
    } catch {
      return null;
    }
  }, [amount, mode, maxPayment, custom]);

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[minmax(0,45%)_minmax(0,55%)]">
      <Card className="border-border bg-white shadow-none ring-1 ring-border">
        <CardHeader>
          <CardTitle>UPI Payment Planner</CardTitle>
          <CardDescription>
            Plan invoice splits with integer paise math. Choose a maximum amount
            per payment for Auto Split, or enter amounts yourself.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="total">Total Invoice Amount</Label>
            <div className="relative">
              <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
                ₹
              </span>
              <Input
                id="total"
                className="h-11 pl-7"
                inputMode="decimal"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
            </div>
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Payment Structure</legend>
            <div className="grid gap-2">
              <Button
                type="button"
                variant={mode === "auto" ? "default" : "outline"}
                className="h-auto min-h-10 justify-start whitespace-normal py-2 text-left"
                onClick={() => setMode("auto")}
              >
                Auto Split
              </Button>
              <Button
                type="button"
                variant={mode === "custom" ? "default" : "outline"}
                className="h-10"
                onClick={() => setMode("custom")}
              >
                Custom Split
              </Button>
              <Button
                type="button"
                variant={mode === "single" ? "default" : "outline"}
                className="h-10"
                onClick={() => setMode("single")}
              >
                Single Payment
              </Button>
            </div>
          </fieldset>

          {mode === "auto" ? (
            <div className="space-y-2">
              <Label htmlFor="maxPayment">Maximum amount per payment</Label>
              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
                  ₹
                </span>
                <Input
                  id="maxPayment"
                  className="h-11 pl-7"
                  inputMode="decimal"
                  value={maxPayment}
                  onChange={(event) => setMaxPayment(event.target.value)}
                />
              </div>
              <p className="text-xs leading-5 text-muted-foreground">
                FREEUPI will create multiple payment requests so that no
                individual request exceeds your selected maximum.
              </p>
            </div>
          ) : null}

          {mode === "custom" ? (
            <div className="space-y-3">
              {custom.map((value, index) => (
                <div key={`custom-${index}`} className="space-y-1.5">
                  <Label htmlFor={`calc-${index}`}>Payment {index + 1}</Label>
                  <Input
                    id={`calc-${index}`}
                    className="h-11"
                    inputMode="decimal"
                    value={value}
                    onChange={(event) => {
                      const next = [...custom];
                      next[index] = event.target.value;
                      setCustom(next);
                    }}
                  />
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => setCustom([...custom, ""])}
              >
                Add Payment
              </Button>
            </div>
          ) : null}
          <ComplianceNotice compact />
        </CardContent>
      </Card>

      <Card className="border-border bg-white shadow-none ring-1 ring-border">
        <CardHeader>
          <CardTitle>Payment Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {plan ? (
            <>
              <ol className="space-y-2">
                {plan.amountsPaise.map((value, index) => (
                  <li
                    key={`${value}-${index}`}
                    className="flex items-center justify-between rounded-xl border border-border px-3 py-2 text-sm"
                  >
                    <span>Payment {index + 1}</span>
                    <span className="font-semibold tabular-nums">
                      {formatINR(value)}
                    </span>
                  </li>
                ))}
              </ol>
              <div className="grid gap-2 text-sm">
                <Row label="Total" value={formatINR(plan.totalAmountPaise)} />
                {plan.maxPaymentPaise ? (
                  <Row
                    label="Maximum per payment"
                    value={formatINR(plan.maxPaymentPaise)}
                  />
                ) : null}
                <Row
                  label="Payment requests"
                  value={String(plan.amountsPaise.length)}
                />
                <Row label="Allocated" value={formatINR(plan.allocatedPaise)} />
                <Row label="Remaining" value={formatINR(plan.remainingPaise)} />
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Enter a valid amount to preview the payment plan.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-muted px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold tabular-nums">{value}</span>
    </div>
  );
}

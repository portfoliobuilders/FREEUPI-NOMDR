"use client";

import { useMemo, useState } from "react";
import { formatINR, rupeesToPaise } from "@/lib/money";
import {
  createPaymentPlan,
  splitEqualInstalments,
} from "@/lib/payments/create-payment-plan";
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

type Mode = "equal" | "custom";

export function CalculatorClient() {
  const [amount, setAmount] = useState("10000");
  const [mode, setMode] = useState<Mode>("equal");
  const [count, setCount] = useState("4");
  const [custom, setCustom] = useState(["2500", "2500", "2500", "2500"]);

  const plan = useMemo(() => {
    try {
      const totalAmountPaise = rupeesToPaise(amount);
      if (mode === "equal") {
        const instalmentCount = Number(count);
        const amountsPaise = splitEqualInstalments(
          totalAmountPaise,
          instalmentCount,
        );
        return createPaymentPlan({
          totalAmountPaise,
          structure: "equal",
          instalmentCount,
          customAmountsPaise: amountsPaise,
        });
      }
      return createPaymentPlan({
        totalAmountPaise,
        structure: "custom",
        customAmountsPaise: custom.map((value) => rupeesToPaise(value || "0")),
      });
    } catch {
      return null;
    }
  }, [amount, mode, count, custom]);

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <Card className="border-border bg-white shadow-none ring-1 ring-border">
        <CardHeader>
          <CardTitle>UPI Payment Planner</CardTitle>
          <CardDescription>
            Plan invoice splits with integer paise math. This planner does not
            hide fees or keep payments under a regulatory threshold.
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
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
            </div>
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Payment Structure</legend>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={mode === "equal" ? "default" : "outline"}
                className="h-10"
                onClick={() => setMode("equal")}
              >
                Equal Split
              </Button>
              <Button
                type="button"
                variant={mode === "custom" ? "default" : "outline"}
                className="h-10"
                onClick={() => setMode("custom")}
              >
                Custom Split
              </Button>
            </div>
          </fieldset>

          {mode === "equal" ? (
            <div className="space-y-2">
              <Label htmlFor="count">Number of payments</Label>
              <Input
                id="count"
                className="h-11"
                type="number"
                min={2}
                max={48}
                value={count}
                onChange={(event) => setCount(event.target.value)}
              />
            </div>
          ) : (
            <div className="space-y-3">
              {custom.map((value, index) => (
                <div key={`custom-${index}`} className="space-y-1.5">
                  <Label htmlFor={`calc-${index}`}>Payment {index + 1}</Label>
                  <Input
                    id={`calc-${index}`}
                    className="h-11"
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
          )}
          <ComplianceNotice compact />
        </CardContent>
      </Card>

      <Card className="border-border bg-white shadow-none ring-1 ring-border">
        <CardHeader>
          <CardTitle>Plan output</CardTitle>
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

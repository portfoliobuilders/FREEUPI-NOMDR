import type { Metadata } from "next";
import { CalculatorClient } from "@/components/calculator/calculator-client";

export const metadata: Metadata = {
  title: "UPI Payment Planner",
};

export default function CalculatorPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <CalculatorClient />
    </div>
  );
}

import { describe, expect, it } from "vitest";
import {
  AutoSplitError,
  MAX_AUTO_SPLIT_PAYMENTS,
  createAutoSplit,
} from "@/lib/payments/create-auto-split";
import { sumPaise } from "@/lib/money";

const CASES: Array<{
  name: string;
  totalPaise: number;
  maxPaymentPaise: number;
  expected: number[];
}> = [
  {
    name: "₹2500 / ₹1999",
    totalPaise: 250_000,
    maxPaymentPaise: 199_900,
    expected: [199_900, 50_100],
  },
  {
    name: "₹8500 / ₹1999",
    totalPaise: 850_000,
    maxPaymentPaise: 199_900,
    expected: [199_900, 199_900, 199_900, 199_900, 50_400],
  },
  {
    name: "₹1700 / ₹1999",
    totalPaise: 170_000,
    maxPaymentPaise: 199_900,
    expected: [170_000],
  },
  {
    name: "₹4000 / ₹1999",
    totalPaise: 400_000,
    maxPaymentPaise: 199_900,
    expected: [199_900, 199_900, 200],
  },
  {
    name: "₹1999 / ₹1999",
    totalPaise: 199_900,
    maxPaymentPaise: 199_900,
    expected: [199_900],
  },
  {
    name: "₹2000 / ₹1999",
    totalPaise: 200_000,
    maxPaymentPaise: 199_900,
    expected: [199_900, 100],
  },
];

describe("createAutoSplit", () => {
  it.each(CASES)("$name", ({ totalPaise, maxPaymentPaise, expected }) => {
    expect(createAutoSplit(totalPaise, maxPaymentPaise)).toEqual(expected);
  });

  it("always sums to the total, stays within the maximum, and never emits zero", () => {
    const totals = [1, 199_900, 200_000, 250_000, 400_000, 850_000, 1_000_000];
    const maxima = [1, 50_000, 100_000, 199_900, 250_000];

    for (const totalPaise of totals) {
      for (const maxPaymentPaise of maxima) {
        const paymentCount = Math.ceil(totalPaise / maxPaymentPaise);
        if (paymentCount > MAX_AUTO_SPLIT_PAYMENTS) {
          expect(() => createAutoSplit(totalPaise, maxPaymentPaise)).toThrow(
            AutoSplitError,
          );
          continue;
        }
        const amounts = createAutoSplit(totalPaise, maxPaymentPaise);
        expect(sumPaise(amounts)).toBe(totalPaise);
        expect(amounts.every((amount) => amount > 0)).toBe(true);
        expect(amounts.every((amount) => amount <= maxPaymentPaise)).toBe(true);
      }
    }
  });

  it("rejects non-positive totals and maxima", () => {
    expect(() => createAutoSplit(0, 199_900)).toThrow(AutoSplitError);
    expect(() => createAutoSplit(-100, 199_900)).toThrow(AutoSplitError);
    expect(() => createAutoSplit(250_000, 0)).toThrow(AutoSplitError);
    expect(() => createAutoSplit(250_000, -199_900)).toThrow(AutoSplitError);
    expect(() => createAutoSplit(1.5, 199_900)).toThrow(AutoSplitError);
    expect(() => createAutoSplit(250_000, 19.99)).toThrow(AutoSplitError);
  });
});

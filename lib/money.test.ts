import { describe, expect, it } from "vitest";
import {
  formatINR,
  paiseToRupees,
  rupeesToPaise,
  sumPaise,
} from "@/lib/money";

describe("money", () => {
  it("converts rupees to paise without floating point", () => {
    expect(rupeesToPaise("10.50")).toBe(1050);
    expect(rupeesToPaise("10")).toBe(1000);
    expect(rupeesToPaise("10.5")).toBe(1050);
    expect(rupeesToPaise("8,500")).toBe(850000);
  });

  it("formats Indian rupees from paise", () => {
    expect(paiseToRupees(1050)).toBe("10.50");
    expect(formatINR(1000000)).toBe("₹10,000.00");
    expect(formatINR(10000000)).toBe("₹1,00,000.00");
    expect(formatINR(850000)).toBe("₹8,500.00");
  });

  it("sums paise with integers", () => {
    expect(sumPaise([250000, 250000, 250000, 250000])).toBe(1000000);
  });
});

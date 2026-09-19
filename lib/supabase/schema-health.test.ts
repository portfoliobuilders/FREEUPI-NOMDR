import { describe, expect, it } from "vitest";
import { invoiceTableExistsFromProbe } from "@/lib/supabase/schema-health";

describe("invoiceTableExistsFromProbe", () => {
  it("treats missing-table PostgREST errors as not ready", () => {
    expect(
      invoiceTableExistsFromProbe(404, {
        code: "PGRST205",
        message: "Could not find the table 'public.invoices' in the schema cache",
      }),
    ).toBe(false);
  });

  it("treats RLS/auth empty access as table exists", () => {
    expect(invoiceTableExistsFromProbe(200, {})).toBe(true);
    expect(
      invoiceTableExistsFromProbe(401, { message: "JWT expired" }),
    ).toBe(true);
  });

  it("does not treat an invalid API key as a ready schema", () => {
    expect(
      invoiceTableExistsFromProbe(401, { message: "Invalid API key" }),
    ).toBe(false);
  });
});

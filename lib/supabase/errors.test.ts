import { describe, expect, it } from "vitest";
import {
  SCHEMA_SETUP_MESSAGE,
  isMissingSchemaError,
  publicWriteErrorMessage,
} from "@/lib/supabase/errors";

describe("isMissingSchemaError", () => {
  it("detects PostgREST missing-table responses", () => {
    expect(
      isMissingSchemaError({
        code: "PGRST205",
        message: "Could not find the table 'public.invoices' in the schema cache",
      }),
    ).toBe(true);
  });

  it("detects Postgres undefined-table errors", () => {
    expect(
      isMissingSchemaError({
        code: "42P01",
        message: 'relation "invoices" does not exist',
      }),
    ).toBe(true);
  });

  it("does not treat ordinary write failures as missing schema", () => {
    expect(
      isMissingSchemaError({
        code: "42501",
        message: "permission denied for table invoices",
      }),
    ).toBe(false);
  });
});

describe("publicWriteErrorMessage", () => {
  it("returns the setup message for missing tables", () => {
    expect(
      publicWriteErrorMessage({ code: "PGRST205", message: "missing" }, "fallback"),
    ).toBe(SCHEMA_SETUP_MESSAGE);
  });

  it("hides raw database errors for other failures", () => {
    expect(
      publicWriteErrorMessage({ code: "23505", message: "duplicate key" }, "Could not save."),
    ).toBe("Could not save.");
  });
});

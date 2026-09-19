import { afterEach, describe, expect, it } from "vitest";
import {
  getAuthUnavailableMessage,
  getMissingSupabaseEnvVars,
  getPublicEnv,
  isSupabaseConfigured,
  isValidSupabaseAnonKey,
  isValidSupabaseUrl,
} from "@/lib/env";

const KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_SITE_URL",
  "VERCEL_PROJECT_PRODUCTION_URL",
  "VERCEL_URL",
] as const;

const original = new Map<string, string | undefined>();

function setEnv(values: Partial<Record<(typeof KEYS)[number], string | undefined>>) {
  for (const key of KEYS) {
    if (!original.has(key)) {
      original.set(key, process.env[key]);
    }
    const next = values[key];
    if (next === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = next;
    }
  }
}

afterEach(() => {
  for (const [key, value] of original.entries()) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
  original.clear();
});

describe("supabase env detection", () => {
  it("treats empty and placeholder values as unconfigured", () => {
    setEnv({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "your-anon-key",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "",
    });
    expect(isValidSupabaseUrl("https://example.supabase.co")).toBe(false);
    expect(isValidSupabaseAnonKey("your-anon-key")).toBe(false);
    expect(isValidSupabaseAnonKey("sb_publishable_ci_placeholder")).toBe(false);
    expect(isSupabaseConfigured()).toBe(false);
    expect(getMissingSupabaseEnvVars()).toEqual([
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    ]);
  });

  it("accepts a hosted project URL with a publishable or anon key", () => {
    setEnv({
      NEXT_PUBLIC_SUPABASE_URL: "https://qjwatcktobybdmdwgymi.supabase.co/",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
        "sb_publishable_abcdefghijklmnopqrstuv",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "",
    });
    expect(isSupabaseConfigured()).toBe(true);
    expect(getPublicEnv().supabaseUrl).toBe(
      "https://qjwatcktobybdmdwgymi.supabase.co",
    );
    expect(getMissingSupabaseEnvVars()).toEqual([]);
  });

  it("falls back to the Vercel production URL for Site URL", () => {
    setEnv({
      NEXT_PUBLIC_SUPABASE_URL: "",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "",
      NEXT_PUBLIC_SITE_URL: "",
      VERCEL_PROJECT_PRODUCTION_URL: "freeupinomdr.vercel.app",
    });
    expect(getPublicEnv().siteUrl).toBe("https://freeupinomdr.vercel.app");
  });

  it("does not use the old permanent auth error copy", () => {
    setEnv({
      NEXT_PUBLIC_SUPABASE_URL: "",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "",
    });
    expect(getAuthUnavailableMessage()).not.toMatch(
      /Authentication is not configured yet/i,
    );
  });
});

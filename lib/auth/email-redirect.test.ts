import { afterEach, describe, expect, it } from "vitest";
import { emailRedirectTo } from "@/lib/auth/email-redirect";

const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const originalVercelUrl = process.env.VERCEL_URL;
const originalProductionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;

afterEach(() => {
  if (originalSiteUrl === undefined) {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  } else {
    process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
  }
  if (originalVercelUrl === undefined) {
    delete process.env.VERCEL_URL;
  } else {
    process.env.VERCEL_URL = originalVercelUrl;
  }
  if (originalProductionUrl === undefined) {
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
  } else {
    process.env.VERCEL_PROJECT_PRODUCTION_URL = originalProductionUrl;
  }
});

describe("emailRedirectTo", () => {
  it("keeps the callback on the current origin and a safe next path", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
    delete process.env.VERCEL_URL;
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
    expect(emailRedirectTo("/dashboard")).toBe(
      "http://localhost:3000/auth/callback?next=%2Fdashboard",
    );
    expect(emailRedirectTo("https://evil.example")).toBe(
      "http://localhost:3000/auth/callback?next=%2Fdashboard",
    );
  });
});

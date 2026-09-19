"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { authRateLimiter } from "@/lib/security/rate-limit";
import { getPublicEnv } from "@/lib/env";
import { sanitizePaymentText } from "@/lib/security/sanitize";
import { isValidUpiId, normalizeUpiId } from "@/lib/upi/validate-upi-id";

const emailSchema = z.string().trim().email("Enter a valid email address.");
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.");

async function limitAuth(action: string) {
  const headerList = await headers();
  const ip =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
  const result = await authRateLimiter.limit(`${action}:${ip}`);
  if (!result.success) {
    return "Too many attempts. Please wait before trying again.";
  }
  return null;
}

export async function signInWithPassword(formData: FormData) {
  const limited = await limitAuth("password");
  if (limited) {
    return { error: limited };
  }

  const email = emailSchema.safeParse(formData.get("email"));
  const password = passwordSchema.safeParse(formData.get("password"));
  if (!email.success || !password.success) {
    return { error: "Enter a valid email and password." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { error: "Authentication is not configured yet." };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: email.data,
    password: password.data,
  });
  if (error) {
    return { error: "Could not sign in with those details." };
  }

  redirect("/dashboard");
}

export async function signUpWithPassword(formData: FormData) {
  const limited = await limitAuth("signup");
  if (limited) {
    return { error: limited };
  }

  const email = emailSchema.safeParse(formData.get("email"));
  const password = passwordSchema.safeParse(formData.get("password"));
  if (!email.success || !password.success) {
    return { error: "Enter a valid email and a password of at least 8 characters." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { error: "Authentication is not configured yet." };
  }

  const { error } = await supabase.auth.signUp({
    email: email.data,
    password: password.data,
    options: {
      emailRedirectTo: `${getPublicEnv().siteUrl}/auth/callback`,
    },
  });
  if (error) {
    return { error: "Could not create the account." };
  }

  return {
    error: null,
    message: "Check your email to confirm the account, then sign in.",
  };
}

export async function sendMagicLink(formData: FormData) {
  const limited = await limitAuth("magic");
  if (limited) {
    return { error: limited };
  }

  const email = emailSchema.safeParse(formData.get("email"));
  if (!email.success) {
    return { error: "Enter a valid email address." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { error: "Authentication is not configured yet." };
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: email.data,
    options: {
      emailRedirectTo: `${getPublicEnv().siteUrl}/auth/callback`,
    },
  });
  if (error) {
    return { error: "Could not send the magic link." };
  }

  return { error: null, message: "Magic link sent. Check your email." };
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  redirect("/");
}

export async function updateProfile(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { error: "Supabase is not configured." };
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Sign in to update settings." };
  }

  const businessName = sanitizePaymentText(
    String(formData.get("businessName") ?? ""),
    80,
  );
  const upiIdRaw = String(formData.get("upiId") ?? "").trim();
  const upiId = upiIdRaw ? normalizeUpiId(upiIdRaw) : "";
  if (upiId && !isValidUpiId(upiId)) {
    return { error: "Enter a valid UPI ID." };
  }

  const { error } = await supabase.from("profiles").upsert(
    {
      user_id: user.id,
      business_name: businessName,
      upi_id: upiId,
    },
    { onConflict: "user_id" },
  );
  if (error) {
    return { error: "Could not save settings." };
  }
  return { error: null, message: "Settings saved." };
}

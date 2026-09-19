import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getPublicEnv, isSupabaseConfigured } from "@/lib/env";
import { safeNextPath } from "@/lib/auth/safe-next";
import type { Database } from "@/types/database";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = safeNextPath(requestUrl.searchParams.get("next"));
  const redirectUrl = new URL(next, requestUrl.origin);

  if (!code || !isSupabaseConfigured()) {
    const fallback = new URL("/login", requestUrl.origin);
    if (!code) {
      fallback.searchParams.set(
        "error",
        "That sign-in link is missing a code. Request a new magic link.",
      );
    }
    return NextResponse.redirect(code ? redirectUrl : fallback);
  }

  const { supabaseUrl, supabaseAnonKey } = getPublicEnv();
  const response = NextResponse.redirect(redirectUrl);

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    const login = new URL("/login", requestUrl.origin);
    login.searchParams.set(
      "error",
      "Could not complete sign-in. Request a new magic link and try again.",
    );
    return NextResponse.redirect(login);
  }

  return response;
}

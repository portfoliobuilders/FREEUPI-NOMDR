import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getPublicEnv, isSupabaseConfigured } from "@/lib/env";
import type { Database } from "@/types/database";

export async function createSupabaseServerClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const cookieStore = await cookies();
  const { supabaseUrl, supabaseAnonKey } = getPublicEnv();

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot set cookies. Proxy session refresh handles this.
        }
      },
    },
  });
}

export async function createClient() {
  return createSupabaseServerClient();
}

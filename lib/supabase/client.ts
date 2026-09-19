import { createBrowserClient } from "@supabase/ssr";
import { getPublicEnv, isSupabaseConfigured } from "@/lib/env";
import type { Database } from "@/types/database";

export function createSupabaseBrowserClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { supabaseUrl, supabaseAnonKey } = getPublicEnv();
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}

export function createClient() {
  const client = createSupabaseBrowserClient();
  if (!client) {
    throw new Error(
      "Supabase configuration missing. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }
  return client;
}

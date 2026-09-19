import { getPublicEnv, isSupabaseConfigured } from "@/lib/env";
import { isMissingSchemaError } from "@/lib/supabase/errors";

export interface SchemaHealth {
  supabaseConfigured: boolean;
  authReachable: boolean;
  schemaReady: boolean;
}

export function invoiceTableExistsFromProbe(
  status: number,
  body: { code?: string | null; message?: string | null },
): boolean {
  if (status === 404 || isMissingSchemaError(body)) {
    return false;
  }
  if (/invalid api key/i.test(body.message ?? "")) {
    return false;
  }
  return [200, 206, 401, 403, 406].includes(status);
}

export async function getSchemaHealth(): Promise<SchemaHealth> {
  if (!isSupabaseConfigured()) {
    return {
      supabaseConfigured: false,
      authReachable: false,
      schemaReady: false,
    };
  }

  const { supabaseUrl, supabaseAnonKey } = getPublicEnv();
  const headers = {
    apikey: supabaseAnonKey,
    Authorization: `Bearer ${supabaseAnonKey}`,
  };

  let authReachable = false;
  let schemaReady = false;

  try {
    const auth = await fetch(`${supabaseUrl}/auth/v1/health`, {
      headers,
      cache: "no-store",
    });
    authReachable = auth.ok;
  } catch {
    authReachable = false;
  }

  try {
    const invoices = await fetch(
      `${supabaseUrl}/rest/v1/invoices?select=id&limit=1`,
      { headers, cache: "no-store" },
    );
    const body = (await invoices.json().catch(() => ({}))) as {
      code?: string;
      message?: string;
    };
    schemaReady = invoiceTableExistsFromProbe(invoices.status, body);
  } catch {
    schemaReady = false;
  }

  return {
    supabaseConfigured: true,
    authReachable,
    schemaReady,
  };
}


export interface PublicEnv {
  supabaseUrl: string;
  supabaseAnonKey: string;
  siteUrl: string;
}

const PLACEHOLDER_PATTERN =
  /placeholder|changeme|your[_-]?anon|your[_-]?key|example\.supabase|replace[_-]?me/i;

const SUPABASE_HOST_PATTERN = /^[a-z0-9-]+\.supabase\.co$/i;

function readEnv(name: string): string {
  // Dynamic lookup avoids Next.js build-time inlining of empty NEXT_PUBLIC_* values.
  const value = process.env[name];
  if (typeof value !== "string") {
    return "";
  }
  return value.trim().replace(/^['"]+|['"]+$/g, "");
}

function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function isPlaceholder(value: string): boolean {
  return PLACEHOLDER_PATTERN.test(value);
}

export function isValidSupabaseUrl(value: string): boolean {
  if (!value || isPlaceholder(value)) {
    return false;
  }
  try {
    const url = new URL(value);
    return url.protocol === "https:" && SUPABASE_HOST_PATTERN.test(url.hostname);
  } catch {
    return false;
  }
}

export function isValidSupabaseAnonKey(value: string): boolean {
  if (!value || isPlaceholder(value)) {
    return false;
  }
  return value.startsWith("sb_publishable_") || value.startsWith("eyJ");
}

function resolveSiteUrl(): string {
  const explicit = stripTrailingSlash(readEnv("NEXT_PUBLIC_SITE_URL"));
  if (explicit) {
    return explicit;
  }

  const productionHost = readEnv("VERCEL_PROJECT_PRODUCTION_URL").replace(
    /^https?:\/\//,
    "",
  );
  if (productionHost) {
    return `https://${productionHost}`;
  }

  const vercelHost = readEnv("VERCEL_URL").replace(/^https?:\/\//, "");
  if (vercelHost) {
    return `https://${vercelHost}`;
  }

  return "http://localhost:3000";
}

export function getPublicEnv(): PublicEnv {
  const publishableOrAnon =
    readEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY") ||
    readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  return {
    supabaseUrl: stripTrailingSlash(readEnv("NEXT_PUBLIC_SUPABASE_URL")),
    supabaseAnonKey: publishableOrAnon,
    siteUrl: resolveSiteUrl(),
  };
}

export function getMissingSupabaseEnvVars(): string[] {
  const missing: string[] = [];
  const url = readEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anon = readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const publishable = readEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");

  if (!isValidSupabaseUrl(url)) {
    missing.push("NEXT_PUBLIC_SUPABASE_URL");
  }
  if (!isValidSupabaseAnonKey(anon) && !isValidSupabaseAnonKey(publishable)) {
    missing.push(
      publishable || anon
        ? "NEXT_PUBLIC_SUPABASE_ANON_KEY"
        : "NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    );
  }
  return missing;
}

export function isSupabaseConfigured(): boolean {
  const { supabaseUrl, supabaseAnonKey } = getPublicEnv();
  return (
    isValidSupabaseUrl(supabaseUrl) && isValidSupabaseAnonKey(supabaseAnonKey)
  );
}

export function getAuthUnavailableMessage(): string {
  if (process.env.NODE_ENV === "development") {
    const missing = getMissingSupabaseEnvVars();
    return `Supabase is not configured. Missing or invalid: ${missing.join(", ")}. Add real values to .env.local (see README).`;
  }

  return "Account sign-in is not available on this deployment yet. You can still generate QR codes without an account.";
}

export function getServiceRoleKey(): string {
  if (typeof window !== "undefined") {
    throw new Error("The Supabase service role key must never run in the browser.");
  }

  const key =
    readEnv("SUPABASE_SECRET_KEY") || readEnv("SUPABASE_SERVICE_ROLE_KEY");
  if (!key || isPlaceholder(key)) {
    throw new Error("Missing SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY.");
  }
  return key;
}

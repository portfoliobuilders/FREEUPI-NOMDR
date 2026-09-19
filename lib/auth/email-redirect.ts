import { safeNextPath } from "@/lib/auth/safe-next";
import { getPublicEnv } from "@/lib/env";

export function emailRedirectTo(next?: string | null): string {
  const path = safeNextPath(next);
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : getPublicEnv().siteUrl;
  return `${origin.replace(/\/$/, "")}/auth/callback?next=${encodeURIComponent(path)}`;
}

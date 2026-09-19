const FALLBACK = "/dashboard";

export function safeNextPath(
  next: string | null | undefined,
  fallback = FALLBACK,
): string {
  if (!next) {
    return fallback;
  }

  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return fallback;
  }

  if (next.includes("://") || next.includes("\\")) {
    return fallback;
  }

  return next;
}

export const SCHEMA_SETUP_MESSAGE =
  "The FREEUPI database tables are not on this Supabase project yet. Open /setup and run the SQL migration, then try again.";

export function isMissingSchemaError(
  error:
    | {
        code?: string | null;
        message?: string | null;
      }
    | null
    | undefined,
): boolean {
  if (!error) {
    return false;
  }

  const code = error.code ?? "";
  const message = error.message ?? "";
  if (code === "PGRST205" || code === "42P01") {
    return true;
  }

  return (
    /could not find the table/i.test(message) ||
    /relation .* does not exist/i.test(message)
  );
}

export function publicWriteErrorMessage(
  error:
    | {
        code?: string | null;
        message?: string | null;
      }
    | null
    | undefined,
  fallback: string,
): string {
  if (isMissingSchemaError(error)) {
    return SCHEMA_SETUP_MESSAGE;
  }
  return fallback;
}

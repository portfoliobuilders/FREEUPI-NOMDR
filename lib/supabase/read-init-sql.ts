import { readFile } from "node:fs/promises";
import path from "node:path";

export async function readInitSql(): Promise<string> {
  const filePath = path.join(
    process.cwd(),
    "supabase",
    "migrations",
    "0001_init.sql",
  );
  return readFile(filePath, "utf8");
}

import { NextResponse } from "next/server";
import { getSchemaHealth } from "@/lib/supabase/schema-health";

export const dynamic = "force-dynamic";

export async function GET() {
  const health = await getSchemaHealth();
  return NextResponse.json({ ok: true, ...health });
}

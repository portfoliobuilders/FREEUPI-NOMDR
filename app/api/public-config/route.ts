import { NextResponse } from "next/server";
import {
  getPublicEnv,
  isSupabaseConfigured,
} from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { configured: false },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  const { supabaseUrl, supabaseAnonKey } = getPublicEnv();
  return NextResponse.json(
    {
      configured: true,
      supabaseUrl,
      supabaseAnonKey,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

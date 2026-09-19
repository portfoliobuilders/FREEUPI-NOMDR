import type { Metadata } from "next";
import { SetupClient } from "@/components/setup/setup-client";
import { getPublicEnv } from "@/lib/env";
import { getSchemaHealth } from "@/lib/supabase/schema-health";
import { readInitSql } from "@/lib/supabase/read-init-sql";
import {
  API_KEYS_URL,
  AUTH_URL_CONFIG,
  SQL_EDITOR_URL,
} from "@/lib/supabase/project";

export const metadata: Metadata = {
  title: "Setup",
};

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const [health, sql] = await Promise.all([getSchemaHealth(), readInitSql()]);
  const siteUrl = getPublicEnv().siteUrl;
  const callbackUrl = `${siteUrl.replace(/\/$/, "")}/auth/callback`;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <SetupClient
        health={health}
        sql={sql}
        siteUrl={siteUrl}
        callbackUrl={callbackUrl}
        sqlEditorUrl={SQL_EDITOR_URL}
        authUrlConfig={AUTH_URL_CONFIG}
        apiKeysUrl={API_KEYS_URL}
      />
    </div>
  );
}

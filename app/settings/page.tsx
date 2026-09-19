import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SettingsForm } from "@/components/settings/settings-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import {
  isMissingSchemaError,
  SCHEMA_SETUP_MESSAGE,
} from "@/lib/supabase/errors";

export const metadata: Metadata = {
  title: "Settings",
};

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-sm text-muted-foreground">
        Configure Supabase environment variables to enable account settings. QR
        generation on the home page still works without an account.
      </div>
    );
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    redirect("/login");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("business_name, upi_id")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <div className="px-4 py-10 sm:px-6">
      <SettingsForm
        email={user.email ?? ""}
        businessName={profile?.business_name ?? ""}
        upiId={profile?.upi_id ?? ""}
        schemaWarning={
          isMissingSchemaError(error) ? SCHEMA_SETUP_MESSAGE : null
        }
      />
    </div>
  );
}

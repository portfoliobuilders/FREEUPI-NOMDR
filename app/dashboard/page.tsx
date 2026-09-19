import type { Metadata } from "next";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { listCloudInvoices } from "@/app/actions/invoices";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = supabase
    ? await supabase.auth.getUser()
    : { data: { user: null } };
  const cloudInvoices = user ? await listCloudInvoices() : [];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <DashboardClient
        cloudInvoices={cloudInvoices}
        isAuthenticated={Boolean(user)}
      />
    </div>
  );
}

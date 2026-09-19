"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { InvoiceTable } from "@/components/dashboard/invoice-table";
import { Sidebar } from "@/components/layout/sidebar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLocalInvoices } from "@/hooks/use-local-invoices";
import {
  duplicateLocalInvoice,
  removeLocalInvoice,
  saveLocalInvoice,
} from "@/lib/storage/local-invoices";
import {
  archiveCloudInvoice,
  saveInvoiceToAccount,
} from "@/app/actions/invoices";
import type { Invoice } from "@/types";

export function DashboardClient({
  cloudInvoices,
  isAuthenticated,
  schemaWarning,
}: {
  cloudInvoices: Invoice[];
  isAuthenticated: boolean;
  schemaWarning: string | null;
}) {
  const router = useRouter();
  const localInvoices = useLocalInvoices();
  const cloudIds = new Set(cloudInvoices.map((invoice) => invoice.id));
  const invoices = isAuthenticated
    ? [
        ...cloudInvoices,
        ...localInvoices.filter((invoice) => !cloudIds.has(invoice.id)),
      ]
    : localInvoices;

  async function handleDuplicate(invoice: Invoice) {
    const copy = duplicateLocalInvoice(invoice);
    if (isAuthenticated) {
      const result = await saveInvoiceToAccount({ ...copy, source: "cloud" });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      removeLocalInvoice(copy.id);
      router.refresh();
    }
    toast.success(
      isAuthenticated
        ? "Invoice duplicated in your account."
        : "Invoice duplicated on this device.",
    );
  }

  async function handleArchive(invoice: Invoice) {
    if (invoice.source === "cloud") {
      const result = await archiveCloudInvoice(invoice.id);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      router.refresh();
      toast.success("Invoice archived.");
      return;
    }
    saveLocalInvoice({
      ...invoice,
      status: "archived",
      updatedAt: new Date().toISOString(),
    });
    toast.success("Invoice archived on this device.");
  }

  return (
    <div className="flex gap-6">
      <Sidebar />
      <div className="min-w-0 flex-1 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isAuthenticated
              ? "Cloud invoices from your account plus any drafts still on this device."
              : "Showing invoices stored on this device. Sign in to save them to your account."}
          </p>
        </div>
        {schemaWarning ? (
          <Alert>
            <AlertTitle>Account storage is not ready</AlertTitle>
            <AlertDescription>
              {schemaWarning}{" "}
              <Link href="/setup" className="font-medium text-primary">
                Open setup
              </Link>
            </AlertDescription>
          </Alert>
        ) : null}
        <DashboardStats invoices={invoices} />
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Recent Invoices</h2>
          <InvoiceTable
            invoices={invoices}
            onDuplicate={(invoice) => {
              void handleDuplicate(invoice);
            }}
            onArchive={(invoice) => {
              void handleArchive(invoice);
            }}
          />
        </section>
      </div>
    </div>
  );
}

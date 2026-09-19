"use client";

import { toast } from "sonner";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { InvoiceTable } from "@/components/dashboard/invoice-table";
import { Sidebar } from "@/components/layout/sidebar";
import { useLocalInvoices } from "@/hooks/use-local-invoices";
import {
  duplicateLocalInvoice,
  saveLocalInvoice,
} from "@/lib/storage/local-invoices";
import type { Invoice } from "@/types";

export function DashboardClient({
  cloudInvoices,
  isAuthenticated,
}: {
  cloudInvoices: Invoice[];
  isAuthenticated: boolean;
}) {
  const localInvoices = useLocalInvoices();
  const invoices = isAuthenticated
    ? [
        ...cloudInvoices,
        ...localInvoices.filter((invoice) => invoice.source === "local"),
      ]
    : localInvoices;

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
        <DashboardStats invoices={invoices} />
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Recent Invoices</h2>
          <InvoiceTable
            invoices={invoices}
            onDuplicate={(invoice) => {
              duplicateLocalInvoice(invoice);
              toast.success("Invoice duplicated on this device.");
            }}
            onArchive={(invoice) => {
              saveLocalInvoice({
                ...invoice,
                status: "archived",
                updatedAt: new Date().toISOString(),
              });
              toast.success("Invoice archived on this device.");
            }}
          />
        </section>
      </div>
    </div>
  );
}

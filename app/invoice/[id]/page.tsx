import type { Metadata } from "next";
import { InvoiceDetail } from "@/components/invoice/invoice-detail";
import { getOwnedInvoice } from "@/app/actions/invoices";

export const metadata: Metadata = {
  title: "Invoice",
};

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cloudInvoice = await getOwnedInvoice(id);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <InvoiceDetail invoiceId={id} cloudInvoice={cloudInvoice} />
    </div>
  );
}

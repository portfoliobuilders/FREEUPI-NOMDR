import type { Metadata } from "next";
import { PrintView } from "@/components/print/print-view";
import { getOwnedInvoice } from "@/app/actions/invoices";

export const metadata: Metadata = {
  title: "Print invoice",
  robots: { index: false, follow: false },
};

export default async function PrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cloudInvoice = await getOwnedInvoice(id);

  return <PrintView invoiceId={id} cloudInvoice={cloudInvoice} />;
}

"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { invoiceWriteRateLimiter } from "@/lib/security/rate-limit";
import { mapInvoice, type InvoiceRow } from "@/lib/invoices/mappers";
import { deriveInvoiceStatus } from "@/lib/payments/invoice-status";
import { createManualPaymentVerificationProvider } from "@/lib/payments/verification";
import {
  isMissingSchemaError,
  publicWriteErrorMessage,
} from "@/lib/supabase/errors";
import type { Invoice, PaymentStatus } from "@/types";

const verifier = createManualPaymentVerificationProvider();

async function requireUser() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { supabase: null, user: null, error: "Supabase is not configured." };
  }
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    return { supabase, user: null, error: "Sign in to save invoices." };
  }
  return { supabase, user, error: null };
}

async function enforceWriteLimit() {
  const headerList = await headers();
  const ip =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
  const result = await invoiceWriteRateLimiter.limit(`invoice:${ip}`);
  if (!result.success) {
    throw new Error("Too many invoice updates. Please wait and try again.");
  }
}

function refreshInvoicePaths(invoiceId?: string) {
  revalidatePath("/dashboard");
  if (invoiceId) {
    revalidatePath(`/invoice/${invoiceId}`);
    revalidatePath(`/print/${invoiceId}`);
  }
}

export async function getCloudDashboard(): Promise<{
  invoices: Invoice[];
  warning: string | null;
  schemaReady: boolean;
}> {
  const { supabase, user } = await requireUser();
  if (!supabase || !user) {
    return { invoices: [], warning: null, schemaReady: true };
  }

  const { data, error } = await supabase
    .from("invoices")
    .select("*, payment_requests(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return {
      invoices: [],
      warning: publicWriteErrorMessage(error, "Could not load invoices."),
      schemaReady: !isMissingSchemaError(error),
    };
  }

  return {
    invoices: (data ?? []).map((row) => mapInvoice(row as InvoiceRow)),
    warning: null,
    schemaReady: true,
  };
}

export async function listCloudInvoices(): Promise<Invoice[]> {
  const { invoices } = await getCloudDashboard();
  return invoices;
}

export async function getOwnedInvoice(id: string): Promise<Invoice | null> {
  const { supabase, user } = await requireUser();
  if (!supabase || !user) {
    return null;
  }

  const { data, error } = await supabase
    .from("invoices")
    .select("*, payment_requests(*)")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapInvoice(data as InvoiceRow);
}

export async function saveInvoiceToAccount(invoice: Invoice) {
  await enforceWriteLimit();
  const { supabase, user, error } = await requireUser();
  if (!supabase || !user) {
    return { ok: false as const, message: error ?? "Sign in required." };
  }

  const { error: invoiceError } = await supabase.from("invoices").upsert({
    id: invoice.id,
    user_id: user.id,
    merchant_name: invoice.merchantName,
    upi_id: invoice.upiId,
    total_amount_paise: invoice.totalAmountPaise,
    reference: invoice.reference,
    note: invoice.note,
    status: invoice.status,
  });

  if (invoiceError) {
    return {
      ok: false as const,
      message: publicWriteErrorMessage(
        invoiceError,
        "Could not save the invoice.",
      ),
    };
  }

  const { error: deleteError } = await supabase
    .from("payment_requests")
    .delete()
    .eq("invoice_id", invoice.id);

  if (deleteError) {
    return {
      ok: false as const,
      message: publicWriteErrorMessage(
        deleteError,
        "Could not update payment requests.",
      ),
    };
  }

  const { error: paymentError } = await supabase.from("payment_requests").insert(
    invoice.payments.map((payment) => ({
      id: payment.id,
      invoice_id: invoice.id,
      sequence_number: payment.sequenceNumber,
      amount_paise: payment.amountPaise,
      upi_uri: payment.upiUri,
      status: payment.status,
      manually_verified: payment.manuallyVerified,
      paid_at: payment.paidAt,
    })),
  );

  if (paymentError) {
    return {
      ok: false as const,
      message: publicWriteErrorMessage(
        paymentError,
        "Could not save payment requests.",
      ),
    };
  }

  refreshInvoicePaths(invoice.id);
  return { ok: true as const };
}

export async function updateCloudPaymentStatus(input: {
  invoiceId: string;
  paymentId: string;
  status: PaymentStatus;
}) {
  await enforceWriteLimit();
  const invoice = await getOwnedInvoice(input.invoiceId);
  if (!invoice) {
    return { ok: false as const, message: "Invoice not found." };
  }

  const result = await verifier.verifyPayment({
    paymentId: input.paymentId,
    invoiceId: input.invoiceId,
    status: input.status,
  });

  const { supabase, user } = await requireUser();
  if (!supabase || !user) {
    return { ok: false as const, message: "Sign in required." };
  }

  const paidAt = result.status === "paid" ? new Date().toISOString() : null;
  const { error } = await supabase
    .from("payment_requests")
    .update({
      status: result.status,
      manually_verified: !result.automaticallyVerified && result.status === "paid",
      paid_at: paidAt,
    })
    .eq("id", input.paymentId)
    .eq("invoice_id", input.invoiceId);

  if (error) {
    return {
      ok: false as const,
      message: publicWriteErrorMessage(error, "Could not update payment status."),
    };
  }

  const nextPayments = invoice.payments.map((payment) =>
    payment.id === input.paymentId
      ? {
          ...payment,
          status: result.status,
          manuallyVerified: result.status === "paid",
          paidAt,
        }
      : payment,
  );
  const nextStatus = deriveInvoiceStatus({
    status: invoice.status,
    payments: nextPayments,
  });

  await supabase
    .from("invoices")
    .update({ status: nextStatus })
    .eq("id", invoice.id)
    .eq("user_id", user.id);

  refreshInvoicePaths(invoice.id);
  return { ok: true as const, notes: result.notes };
}

export async function archiveCloudInvoice(invoiceId: string) {
  await enforceWriteLimit();
  const { supabase, user } = await requireUser();
  if (!supabase || !user) {
    return { ok: false as const, message: "Sign in required." };
  }

  const { error } = await supabase
    .from("invoices")
    .update({ status: "archived" })
    .eq("id", invoiceId)
    .eq("user_id", user.id);

  if (error) {
    return {
      ok: false as const,
      message: publicWriteErrorMessage(error, "Could not archive invoice."),
    };
  }
  refreshInvoicePaths(invoiceId);
  return { ok: true as const };
}

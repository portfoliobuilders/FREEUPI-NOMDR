import type { Invoice } from "@/types";
import { buildInvoice } from "@/lib/invoices/build-invoice";
import { createPaymentPlan } from "@/lib/payments/create-payment-plan";

export const LOCAL_INVOICES_KEY = "freeupi.local-invoices.v1";
const CHANGE_EVENT = "freeupi-invoices-changed";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function notify() {
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribeLocalInvoices(onStoreChange: () => void): () => void {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(CHANGE_EVENT, onStoreChange);
  };
}

export function getLocalInvoicesSnapshot(): string {
  if (!canUseStorage()) {
    return "[]";
  }
  return window.localStorage.getItem(LOCAL_INVOICES_KEY) ?? "[]";
}

export function getServerInvoicesSnapshot(): string {
  return "[]";
}

export function parseInvoicesSnapshot(raw: string): Invoice[] {
  try {
    const parsed = JSON.parse(raw) as Invoice[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function listLocalInvoices(): Invoice[] {
  return parseInvoicesSnapshot(getLocalInvoicesSnapshot());
}

export function getLocalInvoice(id: string): Invoice | null {
  return listLocalInvoices().find((invoice) => invoice.id === id) ?? null;
}

export function saveLocalInvoice(invoice: Invoice): Invoice {
  const current = listLocalInvoices().filter((item) => item.id !== invoice.id);
  const next = [invoice, ...current].slice(0, 50);
  window.localStorage.setItem(LOCAL_INVOICES_KEY, JSON.stringify(next));
  notify();
  return invoice;
}

export function removeLocalInvoice(id: string): void {
  const next = listLocalInvoices().filter((invoice) => invoice.id !== id);
  window.localStorage.setItem(LOCAL_INVOICES_KEY, JSON.stringify(next));
  notify();
}

export function duplicateLocalInvoice(invoice: Invoice): Invoice {
  const plan = createPaymentPlan({
    totalAmountPaise: invoice.totalAmountPaise,
    structure: "custom",
    customAmountsPaise: invoice.payments.map((payment) => payment.amountPaise),
  });
  return saveLocalInvoice(
    buildInvoice({
      merchantName: invoice.merchantName,
      upiId: invoice.upiId,
      reference: `${invoice.reference}-COPY`.slice(0, 35),
      note: invoice.note,
      plan,
      source: "local",
    }),
  );
}

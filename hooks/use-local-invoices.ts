"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  getLocalInvoicesSnapshot,
  getServerInvoicesSnapshot,
  parseInvoicesSnapshot,
  subscribeLocalInvoices,
} from "@/lib/storage/local-invoices";
import type { Invoice } from "@/types";

export function useLocalInvoices(): Invoice[] {
  const snapshot = useSyncExternalStore(
    subscribeLocalInvoices,
    getLocalInvoicesSnapshot,
    getServerInvoicesSnapshot,
  );
  return useMemo(() => parseInvoicesSnapshot(snapshot), [snapshot]);
}

export function useLocalInvoice(id: string): Invoice | null {
  const invoices = useLocalInvoices();
  return invoices.find((invoice) => invoice.id === id) ?? null;
}

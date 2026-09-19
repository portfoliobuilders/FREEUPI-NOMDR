"use client";

import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { InvoiceStatusBadge } from "@/components/status/status-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatINR } from "@/lib/money";
import { collectedPaise } from "@/lib/payments/invoice-status";
import type { Invoice } from "@/types";

export function InvoiceTable({
  invoices,
  onDuplicate,
  onArchive,
}: {
  invoices: Invoice[];
  onDuplicate?: (invoice: Invoice) => void;
  onArchive?: (invoice: Invoice) => void;
}) {
  if (invoices.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-white p-10 text-center">
        <h3 className="text-base font-semibold">No invoices yet</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Create a structured UPI request from the home page. Guest invoices stay
          on this device until you save them to an account.
        </p>
        <Link href="/" className={`${buttonVariants({ className: "mt-4 h-10" })}`}>
          Create invoice
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Reference</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Collected</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell className="font-medium">{invoice.merchantName}</TableCell>
              <TableCell>{invoice.reference}</TableCell>
              <TableCell className="tabular-nums">
                {formatINR(invoice.totalAmountPaise)}
              </TableCell>
              <TableCell className="tabular-nums">
                {formatINR(collectedPaise(invoice))}
              </TableCell>
              <TableCell>
                <InvoiceStatusBadge status={invoice.status} />
              </TableCell>
              <TableCell>
                {new Intl.DateTimeFormat("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }).format(new Date(invoice.createdAt))}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={<Button variant="ghost" size="icon-sm" />}
                    aria-label={`Actions for ${invoice.reference}`}
                  >
                    <MoreHorizontal className="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      render={<Link href={`/invoice/${invoice.id}`} />}
                    >
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      render={<Link href={`/print/${invoice.id}`} />}
                    >
                      Print
                    </DropdownMenuItem>
                    {onDuplicate ? (
                      <DropdownMenuItem onClick={() => onDuplicate(invoice)}>
                        Duplicate
                      </DropdownMenuItem>
                    ) : null}
                    {onArchive ? (
                      <DropdownMenuItem onClick={() => onArchive(invoice)}>
                        Archive
                      </DropdownMenuItem>
                    ) : null}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

import { formatINR } from "@/lib/money";
import {
  collectedPaise,
  remainingPaise,
} from "@/lib/payments/invoice-status";
import { Card, CardContent } from "@/components/ui/card";
import type { Invoice } from "@/types";

export function DashboardStats({ invoices }: { invoices: Invoice[] }) {
  const active = invoices.filter((invoice) => invoice.status !== "archived");
  const requested = active.reduce(
    (total, invoice) => total + invoice.totalAmountPaise,
    0,
  );
  const collected = active.reduce(
    (total, invoice) => total + collectedPaise(invoice),
    0,
  );
  const outstanding = active.reduce(
    (total, invoice) => total + remainingPaise(invoice),
    0,
  );

  const stats = [
    { label: "Total Invoices", value: String(active.length) },
    { label: "Total Requested", value: formatINR(requested) },
    { label: "Collected", value: formatINR(collected) },
    { label: "Outstanding", value: formatINR(outstanding) },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className="border-border bg-white shadow-none ring-1 ring-border"
        >
          <CardContent className="pt-1">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">
              {stat.value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

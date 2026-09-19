import { DashboardStats } from "@/components/dashboard/dashboard-stats";

export default function DashboardLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <div className="h-8 w-40 animate-pulse rounded bg-muted" />
      <DashboardStats invoices={[]} />
      <div className="h-64 animate-pulse rounded-2xl bg-muted" />
    </div>
  );
}

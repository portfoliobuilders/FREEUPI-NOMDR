import Link from "next/link";

export function Footer() {
  return (
    <footer className="no-print border-t border-border bg-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>FREEUPI — UPI payment planning and QR generation.</p>
        <div className="flex flex-wrap gap-4">
          <Link href="/compliance" className="hover:text-foreground">
            Compliance
          </Link>
          <Link href="/calculator" className="hover:text-foreground">
            Planner
          </Link>
          <a
            href="https://github.com/portfoliobuilders/FREEUPI-NOMDR"
            className="hover:text-foreground"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}

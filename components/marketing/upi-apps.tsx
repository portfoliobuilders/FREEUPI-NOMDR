export function UpiApps() {
  return (
    <section className="border-y border-border bg-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Works with UPI apps
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Scan using your preferred supported UPI application. FREEUPI
            generates standard <code>upi://pay</code> requests and does not
            imply a formal partnership with any payment app, bank, or PSP.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-medium text-muted-foreground">
          {["PhonePe", "Google Pay", "Paytm", "BHIM", "Amazon Pay"].map(
            (name) => (
              <span
                key={name}
                className="rounded-full border border-border bg-muted px-3 py-1"
              >
                {name}
              </span>
            ),
          )}
        </div>
      </div>
    </section>
  );
}

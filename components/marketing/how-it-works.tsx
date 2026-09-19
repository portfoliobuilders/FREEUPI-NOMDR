import {
  ClipboardList,
  QrCode,
  Share2,
  ListChecks,
} from "lucide-react";

const steps = [
  {
    title: "Enter payment details",
    body: "Add the merchant name, UPI ID, amount and invoice reference.",
    icon: ClipboardList,
  },
  {
    title: "Create your payment plan",
    body: "Choose a single payment, equal instalments, or custom amounts.",
    icon: ListChecks,
  },
  {
    title: "Share QR codes",
    body: "Download, print, copy the UPI link, or open a UPI app on mobile.",
    icon: Share2,
  },
  {
    title: "Track payments",
    body: "Manually mark requests as paid. Automatic bank verification is not included in the MVP.",
    icon: QrCode,
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
      <div className="max-w-2xl">
        <p className="text-sm font-medium text-primary">How it works</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          Structure a collection, then share standard UPI requests.
        </h2>
      </div>
      <ol className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <li
              key={step.title}
              className="rounded-2xl border border-border bg-white p-5"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-accent text-primary">
                <Icon className="size-5" />
              </div>
              <p className="mt-4 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Step {index + 1}
              </p>
              <h3 className="mt-1 text-base font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {step.body}
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

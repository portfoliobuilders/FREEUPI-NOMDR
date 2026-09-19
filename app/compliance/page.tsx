import type { Metadata } from "next";
import { ComplianceNotice } from "@/components/compliance/compliance-notice";

export const metadata: Metadata = {
  title: "Payment & Compliance Information",
};

export default function CompliancePage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">
        Payment &amp; Compliance Information
      </h1>
      <div className="mt-6 space-y-6 text-sm leading-7 text-muted-foreground">
        <p>
          FREEUPI is a payment planning and QR generation utility. It helps
          merchants and individuals create structured UPI payment requests for
          invoices, partial payments, instalments, milestone payments, deposits,
          shared payments, staged settlements, and multi-part collections.
        </p>
        <ComplianceNotice />
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">
            What FREEUPI does not do
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>It does not process money.</li>
            <li>It does not hold funds.</li>
            <li>It does not store UPI PINs.</li>
            <li>It does not store OTPs.</li>
            <li>It does not provide banking services.</li>
            <li>
              It does not automatically confirm that a bank, PSP, or NPCI has
              settled a payment.
            </li>
          </ul>
        </section>
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">
            Your responsibilities
          </h2>
          <p>Users are responsible for complying with:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>NPCI requirements</li>
            <li>RBI regulations</li>
            <li>merchant acquiring agreements</li>
            <li>bank rules</li>
            <li>PSP rules</li>
            <li>tax requirements</li>
            <li>applicable transaction fees</li>
          </ul>
        </section>
        <blockquote className="rounded-2xl border border-border bg-white p-5 text-foreground">
          FREEUPI should not be used to artificially structure transactions for
          the purpose of circumventing applicable fees, financial controls,
          fraud controls, or regulatory requirements.
        </blockquote>
      </div>
    </div>
  );
}

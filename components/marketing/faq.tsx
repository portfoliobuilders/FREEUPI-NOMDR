import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Does FREEUPI process payments?",
    answer:
      "No. It creates standard UPI payment requests and QR codes. Money moves through the payer’s UPI application and the payee’s bank or PSP — not through FREEUPI.",
  },
  {
    question: "Does FREEUPI store my UPI PIN?",
    answer:
      "No. FREEUPI never asks for a UPI PIN, OTP, CVV, card number, or internet banking password.",
  },
  {
    question: "Can I create staged or instalment payments?",
    answer:
      "Yes. Auto Split creates multiple payment requests from a merchant-selected maximum amount per QR. You can also enter a custom schedule or keep a single payment for the full amount. You are responsible for using this only for legitimate payment schedules.",
  },
  {
    question: "Are payments automatically verified?",
    answer:
      "Not in the MVP. Payment status can be manually updated unless a supported payment provider is integrated. Manual updates are labelled as manually marked as paid and do not confirm bank settlement.",
  },
];

export function Faq() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
      <h2 className="text-2xl font-semibold tracking-tight">FAQ</h2>
      <Accordion className="mt-6 rounded-2xl border border-border bg-white px-4">
        {faqs.map((item) => (
          <AccordionItem key={item.question} value={item.question}>
            <AccordionTrigger>{item.question}</AccordionTrigger>
            <AccordionContent>{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

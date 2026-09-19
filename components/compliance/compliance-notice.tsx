import { ShieldCheck } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function ComplianceNotice({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <p className="text-xs leading-5 text-muted-foreground">
        Users remain responsible for NPCI, RBI, PSP/bank, merchant, MDR, and tax
        rules. FREEUPI must not be used to artificially structure transactions
        to circumvent fees or controls.
      </p>
    );
  }

  return (
    <Alert className="border-border bg-white">
      <ShieldCheck className="size-4 text-primary" />
      <AlertTitle>Payment &amp; compliance notice</AlertTitle>
      <AlertDescription>
        FREEUPI is a planning and QR-generation utility. It does not process
        money, hold funds, or verify bank settlement. You remain responsible for
        following NPCI rules, RBI regulations, PSP/bank rules, merchant
        agreements, applicable MDR requirements, and tax requirements. Do not
        use this product to artificially structure transactions for the purpose
        of circumventing applicable fees, financial controls, fraud controls, or
        regulatory requirements.
      </AlertDescription>
    </Alert>
  );
}

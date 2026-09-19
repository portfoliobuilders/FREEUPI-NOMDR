"use client";

import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/lib/utils";

interface PaymentQrProps {
  value: string;
  size?: number;
  label: string;
  className?: string;
}

export function PaymentQr({
  value,
  size = 220,
  label,
  className,
}: PaymentQrProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-2xl border border-border bg-white p-4",
        className,
      )}
    >
      <QRCodeSVG
        value={value}
        size={size}
        level="M"
        marginSize={2}
        bgColor="#FFFFFF"
        fgColor="#16181D"
        title={label}
        role="img"
        aria-label={label}
        className="h-auto w-full max-w-[240px]"
      />
    </div>
  );
}

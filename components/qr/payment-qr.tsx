"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { QR_DISPLAY_SIZE } from "@/lib/qr/constants";

interface PaymentQrProps {
  value: string;
  size?: number;
  label: string;
  className?: string;
}

export function PaymentQr({
  value,
  size = QR_DISPLAY_SIZE,
  label,
  className,
}: PaymentQrProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !value) {
      return undefined;
    }

    let cancelled = false;
    let qr: { clear: () => void } | null = null;

    void import("@/lib/qr/qrcode-engine").then(({ renderQrCode }) => {
      if (cancelled || !hostRef.current) {
        return;
      }
      qr = renderQrCode(hostRef.current, value, size);
      hostRef.current.setAttribute("title", label);
    });

    return () => {
      cancelled = true;
      qr?.clear();
      host.replaceChildren();
    };
  }, [value, size, label]);

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-2xl border border-border bg-white p-4",
        className,
      )}
    >
      <div
        ref={hostRef}
        role="img"
        aria-label={label}
        className="aspect-square w-full max-w-[240px] [&_canvas]:h-auto [&_canvas]:w-full [&_img]:h-auto [&_img]:w-full"
      />
    </div>
  );
}

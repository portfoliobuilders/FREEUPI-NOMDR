"use client";

import { useEffect } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("FREEUPI route error", error.digest ?? error.name);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        The page could not be loaded. Payment credentials are never requested or
        logged.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <button
          type="button"
          className={buttonVariants({ className: "h-10" })}
          onClick={reset}
        >
          Try again
        </button>
        <Link
          href="/"
          className={buttonVariants({ variant: "outline", className: "h-10" })}
        >
          Home
        </Link>
      </div>
    </div>
  );
}

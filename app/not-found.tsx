import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        That route is not part of FREEUPI.
      </p>
      <Link href="/" className={buttonVariants({ className: "mt-6 h-10" })}>
        Back to generator
      </Link>
    </div>
  );
}

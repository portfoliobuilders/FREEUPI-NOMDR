import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { safeNextPath } from "@/lib/auth/safe-next";

export const metadata: Metadata = {
  title: "Log in",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const redirectTo = safeNextPath(next);

  return (
    <div className="mx-auto w-full max-w-md px-4 py-16">
      <div className="rounded-2xl border border-border bg-white p-6 shadow-none">
        <h1 className="text-2xl font-semibold tracking-tight">Log in</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Use email and password or a magic link. Saving invoices requires an
          account; generating QR codes does not.
        </p>
        <div className="mt-6">
          <LoginForm next={redirectTo} />
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          Need an account?{" "}
          <Link href="/signup" className="font-medium text-primary">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

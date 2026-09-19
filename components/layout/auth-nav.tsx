"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  getAuthSessionServerSnapshot,
  getAuthSessionSnapshot,
  subscribeAuthSession,
} from "@/lib/supabase/auth-session-store";

export function AuthNav({ compact = false }: { compact?: boolean }) {
  const signedIn = useSyncExternalStore(
    subscribeAuthSession,
    getAuthSessionSnapshot,
    getAuthSessionServerSnapshot,
  );

  if (signedIn === null && !compact) {
    return <div className="h-8 w-40" aria-hidden />;
  }

  if (signedIn) {
    if (compact) {
      return (
        <>
          <Link href="/settings" className="rounded-lg px-2 py-2 text-sm hover:bg-muted">
            Settings
          </Link>
          <form action={signOut}>
            <button type="submit" className="w-full rounded-lg px-2 py-2 text-left text-sm hover:bg-muted">
              Sign out
            </button>
          </form>
        </>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <Link
          href="/settings"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          Settings
        </Link>
        <form action={signOut}>
          <Button type="submit" variant="outline" size="sm">
            Sign out
          </Button>
        </form>
      </div>
    );
  }

  if (compact) {
    return (
      <>
        <Link href="/login" className="rounded-lg px-2 py-2 text-sm hover:bg-muted">
          Log in
        </Link>
        <Link href="/signup" className="rounded-lg px-2 py-2 text-sm hover:bg-muted">
          Create account
        </Link>
      </>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/login"
        className={buttonVariants({ variant: "ghost", size: "sm" })}
      >
        Log in
      </Link>
      <Link href="/signup" className={buttonVariants({ size: "sm" })}>
        Create account
      </Link>
    </div>
  );
}

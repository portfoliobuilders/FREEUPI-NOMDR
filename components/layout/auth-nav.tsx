"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import { Button, buttonVariants } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function AuthNav({ compact = false }: { compact?: boolean }) {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setSignedIn(false);
      return;
    }

    let cancelled = false;
    void supabase.auth.getUser().then(({ data }) => {
      if (!cancelled) {
        setSignedIn(Boolean(data.user));
      }
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session?.user));
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

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

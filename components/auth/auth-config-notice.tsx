"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  getAuthUnavailableMessage,
  isSupabaseConfigured,
} from "@/lib/env";
import { loadRuntimeSupabaseConfig } from "@/lib/supabase/runtime-config";

export function AuthConfigNotice() {
  const [configured, setConfigured] = useState(isSupabaseConfigured());
  const development = process.env.NODE_ENV === "development";

  useEffect(() => {
    void loadRuntimeSupabaseConfig().then((config) => {
      setConfigured(Boolean(config));
    });
  }, []);

  if (configured) {
    return null;
  }

  return (
    <Alert className="mb-6">
      <AlertTitle>
        {development
          ? "Authentication configuration is missing."
          : "Accounts are not enabled yet"}
      </AlertTitle>
      <AlertDescription>
        <p>{getAuthUnavailableMessage()}</p>
        {development ? (
          <p className="mt-2">
            Copy <code>.env.example</code> to <code>.env.local</code>, add the
            hosted project URL and anon/publishable key, then restart{" "}
            <code>npm run dev</code>.
          </p>
        ) : (
          <p className="mt-2">
            Operators: add Supabase keys in Vercel and confirm redirect URLs.{" "}
            <Link href="/setup" className="font-medium text-primary">
              Open setup
            </Link>
          </p>
        )}
      </AlertDescription>
    </Alert>
  );
}

"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { CheckCircle2, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import type { SchemaHealth } from "@/lib/supabase/schema-health";

export function SetupClient({
  health,
  sql,
  siteUrl,
  callbackUrl,
  sqlEditorUrl,
  authUrlConfig,
  apiKeysUrl,
}: {
  health: SchemaHealth;
  sql: string;
  siteUrl: string;
  callbackUrl: string;
  sqlEditorUrl: string;
  authUrlConfig: string;
  apiKeysUrl: string;
}) {
  const [status, setStatus] = useState(health);
  const [checking, setChecking] = useState(false);

  async function copySql() {
    try {
      await navigator.clipboard.writeText(sql);
      toast.success("SQL copied. Paste it in the Supabase SQL editor.");
    } catch {
      toast.error("Could not copy. Select the SQL box and copy it manually.");
    }
  }

  async function recheck() {
    setChecking(true);
    try {
      const response = await fetch("/api/health", { cache: "no-store" });
      const body = (await response.json()) as SchemaHealth & { ok?: boolean };
      setStatus({
        supabaseConfigured: body.supabaseConfigured,
        authReachable: body.authReachable,
        schemaReady: body.schemaReady,
      });
      if (body.schemaReady) {
        toast.success("Database tables are ready.");
      } else {
        toast.error("Tables are still missing. Run the SQL, then check again.");
      }
    } catch {
      toast.error("Could not check the project status.");
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Connect FREEUPI to Supabase
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">
          QR generation already works without an account. Saving invoices, the
          dashboard, and settings need the tables in your hosted project.
        </p>
      </div>

      <Alert>
        <AlertTitle>Project status</AlertTitle>
        <AlertDescription>
          <ul className="mt-2 space-y-1">
            <StatusLine
              ok={status.supabaseConfigured}
              label="App keys are configured"
            />
            <StatusLine ok={status.authReachable} label="Auth service is reachable" />
            <StatusLine
              ok={status.schemaReady}
              label="Invoice tables exist on the hosted database"
            />
          </ul>
        </AlertDescription>
      </Alert>

      {status.schemaReady ? (
        <div className="rounded-2xl border border-border bg-white p-5">
          <p className="text-sm leading-6">
            The database is ready. Create an account, then save an invoice from
            the home page.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/signup" className={buttonVariants({ className: "h-10" })}>
              Create account
            </Link>
            <Link
              href="/"
              className={buttonVariants({ variant: "outline", className: "h-10" })}
            >
              Generate QR codes
            </Link>
          </div>
        </div>
      ) : (
        <ol className="space-y-4">
          <Step n={1} title="Open the SQL editor">
            <a
              href={sqlEditorUrl}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Open project SQL editor
            </a>
          </Step>
          <Step n={2} title="Paste and run this migration">
            <div className="mt-3 space-y-2">
              <Button type="button" variant="outline" className="h-10" onClick={() => void copySql()}>
                <Copy className="size-4" />
                Copy SQL
              </Button>
              <textarea
                readOnly
                value={sql}
                aria-label="FREEUPI database migration SQL"
                className="h-56 w-full rounded-xl border border-border bg-muted/40 p-3 font-mono text-xs leading-5"
              />
            </div>
          </Step>
          <Step n={3} title="Set auth redirect URLs">
            <p>
              Site URL: <code className="rounded bg-muted px-1">{siteUrl}</code>
            </p>
            <p>
              Redirect URL:{" "}
              <code className="rounded bg-muted px-1">{callbackUrl}</code>
            </p>
            <p className="mt-2">
              <a
                href={authUrlConfig}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Open auth URL settings
              </a>
            </p>
          </Step>
          <Step n={4} title="Add API keys on Vercel if login still fails">
            <p>
              Project → Settings → Environment Variables. Add{" "}
              <code className="rounded bg-muted px-1">NEXT_PUBLIC_SUPABASE_URL</code>,{" "}
              <code className="rounded bg-muted px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, and{" "}
              <code className="rounded bg-muted px-1">NEXT_PUBLIC_SITE_URL</code> for
              Production, Preview, and Development, then redeploy.
            </p>
            <p className="mt-2">
              <a
                href={apiKeysUrl}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Open API keys
              </a>
            </p>
          </Step>
        </ol>
      )}

      <Button
        type="button"
        className="h-10"
        onClick={() => void recheck()}
        disabled={checking}
      >
        {checking ? <Loader2 className="size-4 animate-spin" /> : null}
        Check again
      </Button>
    </div>
  );
}

function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <li className="rounded-2xl border border-border bg-white p-5">
      <p className="text-sm font-semibold">
        {n}. {title}
      </p>
      <div className="mt-2 text-sm leading-6 text-muted-foreground">{children}</div>
    </li>
  );
}

function StatusLine({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2 text-sm">
      <CheckCircle2
        className={ok ? "size-4 text-success" : "size-4 text-muted-foreground"}
        aria-hidden
      />
      <span>
        {label}
        {ok ? "" : " — not yet"}
      </span>
    </li>
  );
}

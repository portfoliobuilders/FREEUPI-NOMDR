"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getBrowserClient } from "@/lib/supabase/runtime-config";
import { emailRedirectTo } from "@/lib/auth/email-redirect";
import { getAuthUnavailableMessage, isSupabaseConfigured } from "@/lib/env";
import { AuthConfigNotice } from "@/components/auth/auth-config-notice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

async function supabaseClient() {
  return (await getBrowserClient()) ?? createClient();
}

export function LoginForm({ next = "/dashboard" }: { next?: string }) {
  const router = useRouter();
  const [configured, setConfigured] = useState(isSupabaseConfigured());
  const [passwordPending, setPasswordPending] = useState(false);
  const [magicPending, setMagicPending] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [magicError, setMagicError] = useState<string | null>(null);
  const [magicMessage, setMagicMessage] = useState<string | null>(null);

  useEffect(() => {
    void getBrowserClient().then((client) => setConfigured(Boolean(client)));
  }, []);

  async function handlePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordError(null);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    if (!email || !password) {
      setPasswordError("Enter a valid email and password.");
      return;
    }

    setPasswordPending(true);
    try {
      const supabase = await supabaseClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setPasswordError("Could not sign in with those details.");
        return;
      }
      router.replace(next);
      router.refresh();
    } catch {
      setPasswordError(getAuthUnavailableMessage());
    } finally {
      setPasswordPending(false);
    }
  }

  async function handleMagic(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMagicError(null);
    setMagicMessage(null);

    const email = String(new FormData(event.currentTarget).get("email") ?? "").trim();
    if (!email) {
      setMagicError("Enter a valid email address.");
      return;
    }

    setMagicPending(true);
    try {
      const supabase = await supabaseClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: emailRedirectTo(next) },
      });
      if (error) {
        setMagicError(error.message);
        return;
      }
      setMagicMessage("Magic link sent. Check your inbox.");
    } catch {
      setMagicError(getAuthUnavailableMessage());
    } finally {
      setMagicPending(false);
    }
  }

  return (
    <div className="space-y-8">
      <AuthConfigNotice />
      <form onSubmit={handlePassword} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="h-11"
            disabled={!configured || passwordPending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="h-11"
            disabled={!configured || passwordPending}
          />
        </div>
        {passwordError ? (
          <p className="text-sm text-destructive" role="alert">
            {passwordError}
          </p>
        ) : null}
        <Button
          type="submit"
          className="h-11 w-full"
          disabled={!configured || passwordPending}
        >
          {passwordPending ? "Signing in…" : "Log in"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <p className="relative mx-auto w-fit bg-white px-2 text-xs text-muted-foreground">
          or magic link
        </p>
      </div>

      <form onSubmit={handleMagic} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="magic-email">Email</Label>
          <Input
            id="magic-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="h-11"
            disabled={!configured || magicPending}
          />
        </div>
        {magicError ? (
          <p className="text-sm text-destructive" role="alert">
            {magicError}
          </p>
        ) : null}
        {magicMessage ? (
          <p className="text-sm text-success">{magicMessage}</p>
        ) : null}
        <Button
          type="submit"
          variant="outline"
          className="h-11 w-full"
          disabled={!configured || magicPending}
        >
          {magicPending ? "Sending…" : "Email me a magic link"}
        </Button>
      </form>
    </div>
  );
}

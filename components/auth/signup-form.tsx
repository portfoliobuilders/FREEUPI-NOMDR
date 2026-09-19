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

export function SignupForm() {
  const router = useRouter();
  const [configured, setConfigured] = useState(isSupabaseConfigured());
  const [pending, setPending] = useState(false);
  const [magicPending, setMagicPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [magicError, setMagicError] = useState<string | null>(null);
  const [magicMessage, setMagicMessage] = useState<string | null>(null);

  useEffect(() => {
    void getBrowserClient().then((client) => setConfigured(Boolean(client)));
  }, []);

  async function handlePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const businessName = String(form.get("businessName") ?? "").trim();

    if (!email || password.length < 8) {
      setError("Enter a valid email and a password of at least 8 characters.");
      return;
    }

    setPending(true);
    try {
      const supabase = await supabaseClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: emailRedirectTo("/dashboard"),
          data: { business_name: businessName },
        },
      });
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      if (data.session) {
        router.replace("/dashboard");
        router.refresh();
        return;
      }
      setMessage("Check your email to confirm your account.");
    } catch {
      setError(getAuthUnavailableMessage());
    } finally {
      setPending(false);
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
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: emailRedirectTo("/dashboard") },
      });
      if (otpError) {
        setMagicError(otpError.message);
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
          <Label htmlFor="businessName">Business name (optional)</Label>
          <Input
            id="businessName"
            name="businessName"
            autoComplete="organization"
            className="h-11"
            placeholder="Priya Stores"
            disabled={!configured || pending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="h-11"
            disabled={!configured || pending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            className="h-11"
            disabled={!configured || pending}
          />
        </div>
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        {message ? <p className="text-sm text-success">{message}</p> : null}
        <Button
          type="submit"
          className="h-11 w-full"
          disabled={!configured || pending}
        >
          {pending ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <form onSubmit={handleMagic} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="magic-email">Or continue with a magic link</Label>
          <Input
            id="magic-email"
            name="email"
            type="email"
            required
            className="h-11"
            disabled={!configured || magicPending}
          />
        </div>
        {magicError ? (
          <p className="text-sm text-destructive">{magicError}</p>
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
          {magicPending ? "Sending…" : "Send magic link"}
        </Button>
      </form>
    </div>
  );
}

"use client";

import { useActionState } from "react";
import { sendMagicLink, signInWithPassword } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuthState = { error: string | null; message?: string } | null;

export function LoginForm() {
  const [passwordState, passwordAction, passwordPending] = useActionState(
    async (_state: AuthState, formData: FormData) =>
      signInWithPassword(formData),
    null,
  );
  const [magicState, magicAction, magicPending] = useActionState(
    async (_state: AuthState, formData: FormData) => sendMagicLink(formData),
    null,
  );

  return (
    <div className="space-y-8">
      <form action={passwordAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="h-11"
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
          />
        </div>
        {passwordState?.error ? (
          <p className="text-sm text-destructive" role="alert">
            {passwordState.error}
          </p>
        ) : null}
        <Button type="submit" className="h-11 w-full" disabled={passwordPending}>
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

      <form action={magicAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="magic-email">Email</Label>
          <Input
            id="magic-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="h-11"
          />
        </div>
        {magicState?.error ? (
          <p className="text-sm text-destructive" role="alert">
            {magicState.error}
          </p>
        ) : null}
        {magicState?.message ? (
          <p className="text-sm text-success">{magicState.message}</p>
        ) : null}
        <Button
          type="submit"
          variant="outline"
          className="h-11 w-full"
          disabled={magicPending}
        >
          {magicPending ? "Sending…" : "Email me a magic link"}
        </Button>
      </form>
    </div>
  );
}

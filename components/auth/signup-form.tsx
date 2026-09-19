"use client";

import { useActionState } from "react";
import { sendMagicLink, signUpWithPassword } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuthState = { error: string | null; message?: string } | null;

export function SignupForm() {
  const [state, action, pending] = useActionState(
    async (_state: AuthState, formData: FormData) =>
      signUpWithPassword(formData),
    null,
  );
  const [magicState, magicAction, magicPending] = useActionState(
    async (_state: AuthState, formData: FormData) => sendMagicLink(formData),
    null,
  );

  return (
    <div className="space-y-8">
      <form action={action} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="businessName">Business name (optional)</Label>
          <Input
            id="businessName"
            name="businessName"
            autoComplete="organization"
            className="h-11"
            placeholder="Priya Stores"
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
          />
        </div>
        {state?.error ? (
          <p className="text-sm text-destructive" role="alert">
            {state.error}
          </p>
        ) : null}
        {state?.message ? (
          <p className="text-sm text-success">{state.message}</p>
        ) : null}
        <Button type="submit" className="h-11 w-full" disabled={pending}>
          {pending ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <form action={magicAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="magic-email">Or continue with a magic link</Label>
          <Input
            id="magic-email"
            name="email"
            type="email"
            required
            className="h-11"
          />
        </div>
        {magicState?.error ? (
          <p className="text-sm text-destructive">{magicState.error}</p>
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
          Send magic link
        </Button>
      </form>
    </div>
  );
}

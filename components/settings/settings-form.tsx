"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signOut, updateProfile } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type State = { error: string | null; message?: string } | null;

export function SettingsForm({
  businessName,
  upiId,
  email,
  schemaWarning,
}: {
  businessName: string;
  upiId: string;
  email: string;
  schemaWarning?: string | null;
}) {
  const [state, action, pending] = useActionState(
    async (_state: State, formData: FormData) => updateProfile(formData),
    null,
  );

  return (
    <div className="mx-auto max-w-xl space-y-6">
      {schemaWarning ? (
        <p className="text-sm text-destructive">
          {schemaWarning}{" "}
          <Link href="/setup" className="font-medium underline-offset-4 hover:underline">
            Open setup
          </Link>
        </p>
      ) : null}
      <Card className="border-border bg-white shadow-none ring-1 ring-border">
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>
            Saved merchant defaults for invoices you store in your account.
            FREEUPI never asks for a UPI PIN, OTP, or bank password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Account email</Label>
              <Input id="email" className="h-11" value={email} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessName">Business name</Label>
              <Input
                id="businessName"
                name="businessName"
                className="h-11"
                defaultValue={businessName}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="upiId">Default UPI ID</Label>
              <Input
                id="upiId"
                name="upiId"
                className="h-11"
                defaultValue={upiId}
                placeholder="merchant@oksbi"
              />
            </div>
            {state?.error ? (
              <p className="text-sm text-destructive">{state.error}</p>
            ) : null}
            {state?.message ? (
              <p className="text-sm text-success">{state.message}</p>
            ) : null}
            <Button type="submit" className="h-11" disabled={pending}>
              {pending ? "Saving…" : "Save settings"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <form action={signOut}>
        <Button type="submit" variant="outline" className="h-10">
          Sign out
        </Button>
      </form>
    </div>
  );
}

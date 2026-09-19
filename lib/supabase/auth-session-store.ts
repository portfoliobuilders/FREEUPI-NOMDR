"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Listener = () => void;

let signedIn: boolean | null = null;
const listeners = new Set<Listener>();
let attached = false;

function notify() {
  for (const listener of listeners) {
    listener();
  }
}

function attach() {
  if (attached) {
    return;
  }
  attached = true;

  const supabase = createSupabaseBrowserClient();
  if (!supabase) {
    signedIn = false;
    return;
  }

  supabase.auth.onAuthStateChange((_event, session) => {
    signedIn = Boolean(session?.user);
    notify();
  });

  void supabase.auth.getUser().then(({ data }) => {
    signedIn = Boolean(data.user);
    notify();
  });
}

export function subscribeAuthSession(listener: Listener) {
  attach();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getAuthSessionSnapshot() {
  attach();
  return signedIn;
}

export function getAuthSessionServerSnapshot(): boolean | null {
  return null;
}

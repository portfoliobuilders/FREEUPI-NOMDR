"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getBrowserClient } from "@/lib/supabase/runtime-config";
import type { Database } from "@/types/database";

type Listener = () => void;

let signedIn: boolean | null = null;
const listeners = new Set<Listener>();
let attached = false;

function notify() {
  for (const listener of listeners) {
    listener();
  }
}

function bind(supabase: SupabaseClient<Database>) {
  supabase.auth.onAuthStateChange((_event, session) => {
    signedIn = Boolean(session?.user);
    notify();
  });

  void supabase.auth.getUser().then(({ data }) => {
    signedIn = Boolean(data.user);
    notify();
  });
}

function attach() {
  if (attached) {
    return;
  }
  attached = true;

  const immediate = createSupabaseBrowserClient();
  if (immediate) {
    bind(immediate);
    return;
  }

  void getBrowserClient().then((client) => {
    if (!client) {
      signedIn = false;
      notify();
      return;
    }
    bind(client);
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

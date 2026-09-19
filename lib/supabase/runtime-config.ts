"use client";

import { createBrowserClient } from "@supabase/ssr";
import {
  getPublicEnv,
  isValidSupabaseAnonKey,
  isValidSupabaseUrl,
} from "@/lib/env";
import type { Database } from "@/types/database";

interface RuntimeConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

let memory: RuntimeConfig | null = null;
let inflight: Promise<RuntimeConfig | null> | null = null;

function isUsable(config: RuntimeConfig): boolean {
  return (
    isValidSupabaseUrl(config.supabaseUrl) &&
    isValidSupabaseAnonKey(config.supabaseAnonKey)
  );
}

function clientFromConfig(config: RuntimeConfig) {
  return createBrowserClient<Database>(config.supabaseUrl, config.supabaseAnonKey);
}

function envConfig(): RuntimeConfig | null {
  const env = getPublicEnv();
  const config = {
    supabaseUrl: env.supabaseUrl,
    supabaseAnonKey: env.supabaseAnonKey,
  };
  return isUsable(config) ? config : null;
}

export async function loadRuntimeSupabaseConfig(): Promise<RuntimeConfig | null> {
  if (memory) {
    return memory;
  }

  const fromEnv = envConfig();
  if (fromEnv) {
    memory = fromEnv;
    return memory;
  }

  inflight ??= fetch("/api/public-config", { cache: "no-store" })
    .then(async (response) => {
      const body = (await response.json()) as {
        configured?: boolean;
        supabaseUrl?: string;
        supabaseAnonKey?: string;
      };
      const config = {
        supabaseUrl: body.supabaseUrl ?? "",
        supabaseAnonKey: body.supabaseAnonKey ?? "",
      };
      if (body.configured && isUsable(config)) {
        memory = config;
        return memory;
      }
      return null;
    })
    .catch(() => null);

  return inflight;
}

export async function getBrowserClient() {
  const config = await loadRuntimeSupabaseConfig();
  return config ? clientFromConfig(config) : null;
}

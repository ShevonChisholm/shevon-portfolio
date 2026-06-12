import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function getSupabaseConfig() {
  if (!supabaseUrl) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  if (!supabasePublishableKey)
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );

  return {
    supabaseUrl,
    supabasePublishableKey,
  };
}

let browserClient: SupabaseClient | undefined;

export function createClient() {
  const config = getSupabaseConfig();

  if (typeof window === "undefined") {
    return createBrowserClient(config.supabaseUrl, config.supabasePublishableKey);
  }

  browserClient ??= createBrowserClient(
    config.supabaseUrl,
    config.supabasePublishableKey,
    { isSingleton: true }
  );

  return browserClient;
}

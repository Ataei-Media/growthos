import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { clientEnv, getServerEnv } from "@/lib/env";
import type { Database } from "./database.types";

/**
 * Service-role client that BYPASSES Row Level Security. Server-only.
 * Use exclusively for trusted operations (webhooks, audit-log writes,
 * background jobs) — never expose it to the browser or user-controlled paths
 * without an explicit authorization check first.
 */
export function createAdminClient() {
  const env = getServerEnv();
  return createSupabaseClient<Database>(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}

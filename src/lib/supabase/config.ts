import { clientEnv } from "@/lib/env";

/**
 * True only when real Supabase credentials are present. During early local
 * development the env holds placeholders; auth/session logic short-circuits so
 * the app still runs without a live project. Set real keys to enable auth.
 */
export function isSupabaseConfigured(): boolean {
  const url = clientEnv.NEXT_PUBLIC_SUPABASE_URL;
  const key = clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !url.includes("placeholder") && !key.includes("placeholder");
}

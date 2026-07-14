import { z } from "zod";

/**
 * Centralised, type-safe environment access.
 *
 * - `serverEnv` holds secrets and is validated the first time it is read from
 *   server-only code (server components, route handlers, server actions).
 * - `clientEnv` holds `NEXT_PUBLIC_*` values safe to ship to the browser and is
 *   validated eagerly at import time.
 *
 * Validation is lazy on the server so that Next.js can build pages that never
 * touch secrets without every env var being present, while any code path that
 * actually needs a secret fails fast with a readable error.
 */

const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // Comma-separated list of emails allowed into the internal /admin dashboard.
  ADMIN_EMAILS: z.string().optional(),

  // Supabase (service role — server only)
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // Stripe
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  STRIPE_PRICE_GROWTH_MONTHLY: z.string().min(1).optional(),
  STRIPE_PRICE_AGENCY_MONTHLY: z.string().min(1).optional(),

  // OpenAI — model is intentionally NOT defaulted. The provider is model-agnostic;
  // switching models is an env change only. See SETUP.md for recommended values.
  OPENAI_API_KEY: z.string().min(1),
  OPENAI_MODEL: z
    .string({ error: "OPENAI_MODEL is required. Set it to your OpenAI model id (see SETUP.md)." })
    .min(1, "OPENAI_MODEL must not be empty. Set it to your OpenAI model id (see SETUP.md)."),

  // Resend — "from" may be a bare address or "Name <email>" display format.
  RESEND_API_KEY: z.string().min(1),
  RESEND_FROM_EMAIL: z.string().min(1).default("GrowthOS <noreply@growthos.app>"),

  // Firecrawl (website crawling)
  FIRECRAWL_API_KEY: z.string().min(1),

  // ScreenshotOne
  SCREENSHOTONE_ACCESS_KEY: z.string().min(1),
  SCREENSHOTONE_SECRET_KEY: z.string().min(1),
});

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().default("https://eu.i.posthog.com"),
});

export type ServerEnv = z.infer<typeof serverSchema>;
export type ClientEnv = z.infer<typeof clientSchema>;

function formatIssues(error: z.ZodError) {
  return error.issues.map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`).join("\n");
}

/**
 * Next.js inlines `process.env.NEXT_PUBLIC_*` at build time only for statically
 * referenced keys, so client vars are read explicitly rather than via a spread.
 */
const clientParsed = clientSchema.safeParse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
  NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
});

if (!clientParsed.success) {
  throw new Error(
    `Invalid public environment variables:\n${formatIssues(clientParsed.error)}`,
  );
}

export const clientEnv: ClientEnv = clientParsed.data;

let cachedServerEnv: ServerEnv | null = null;

/**
 * Access validated server-only environment variables.
 * Throws immediately (with every failing key listed) if something is missing.
 */
export function getServerEnv(): ServerEnv {
  if (typeof window !== "undefined") {
    throw new Error("getServerEnv() must never be called in client-side code.");
  }
  if (cachedServerEnv) return cachedServerEnv;

  const parsed = serverSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(
      `Invalid server environment variables:\n${formatIssues(parsed.error)}`,
    );
  }
  cachedServerEnv = parsed.data;
  return cachedServerEnv;
}

"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { clientEnv } from "@/lib/env";
import { getClientIp, getUserAgent } from "@/lib/security/request";
import { rateLimit, RATE_LIMITS } from "@/lib/security/rate-limit";
import { logAuditEvent } from "@/lib/security/audit-log";
import {
  forgotPasswordSchema,
  magicLinkSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from "./schema";

export type AuthState = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
} | undefined;

const NOT_CONFIGURED =
  "Authentication isn't connected in this environment yet. Add your Supabase keys to enable sign-in.";

/** Prevent open redirects: only allow same-site absolute paths. */
function safeNext(next: FormDataEntryValue | null, fallback = "/dashboard"): string {
  const value = typeof next === "string" ? next : "";
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  return fallback;
}

export async function signInWithPassword(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const next = safeNext(formData.get("redirect"));
  if (!isSupabaseConfigured()) return { error: NOT_CONFIGURED };

  const ip = (await getClientIp()) ?? "unknown";
  const limit = rateLimit(
    `signin:${ip}:${parsed.data.email}`,
    RATE_LIMITS.authAttempt.limit,
    RATE_LIMITS.authAttempt.windowMs,
  );
  if (!limit.success) return { error: "Too many attempts. Please wait a minute and try again." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    await logAuditEvent({
      action: "auth.sign_in.failed",
      ip,
      userAgent: await getUserAgent(),
      metadata: { email: parsed.data.email },
    });
    return { error: "Invalid email or password." };
  }

  await logAuditEvent({
    action: "auth.sign_in.succeeded",
    actorId: data.user?.id ?? null,
    ip,
    userAgent: await getUserAgent(),
  });
  redirect(next);
}

export async function signUpWithPassword(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = signUpSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  if (!isSupabaseConfigured()) return { error: NOT_CONFIGURED };

  const ip = (await getClientIp()) ?? "unknown";
  const limit = rateLimit(
    `signup:${ip}`,
    RATE_LIMITS.authAttempt.limit,
    RATE_LIMITS.authAttempt.windowMs,
  );
  if (!limit.success) return { error: "Too many attempts. Please wait a minute and try again." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${clientEnv.NEXT_PUBLIC_APP_URL}/auth/confirm?next=/onboarding`,
    },
  });

  if (error) return { error: error.message };

  await logAuditEvent({
    action: "auth.sign_up",
    actorId: data.user?.id ?? null,
    ip,
    userAgent: await getUserAgent(),
    metadata: { email: parsed.data.email },
  });

  // Session is null when email confirmation is required.
  if (!data.session) redirect("/check-email?type=signup");
  redirect("/onboarding");
}

export async function sendMagicLink(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = magicLinkSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  if (!isSupabaseConfigured()) return { error: NOT_CONFIGURED };

  const ip = (await getClientIp()) ?? "unknown";
  const limit = rateLimit(
    `magic:${ip}:${parsed.data.email}`,
    RATE_LIMITS.magicLink.limit,
    RATE_LIMITS.magicLink.windowMs,
  );
  if (!limit.success) return { error: "Too many requests. Please try again shortly." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${clientEnv.NEXT_PUBLIC_APP_URL}/auth/confirm?next=/dashboard`,
    },
  });

  if (error) return { error: error.message };
  redirect("/check-email?type=magic");
}

export async function requestPasswordReset(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  if (!isSupabaseConfigured()) return { error: NOT_CONFIGURED };

  const ip = (await getClientIp()) ?? "unknown";
  const limit = rateLimit(
    `reset:${ip}:${parsed.data.email}`,
    RATE_LIMITS.passwordReset.limit,
    RATE_LIMITS.passwordReset.windowMs,
  );
  if (!limit.success) return { error: "Too many requests. Please try again shortly." };

  const supabase = await createClient();
  // Ignore the result to avoid leaking whether an account exists.
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${clientEnv.NEXT_PUBLIC_APP_URL}/auth/confirm?next=/reset-password`,
  });

  redirect("/check-email?type=reset");
}

export async function updatePassword(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your reset link has expired. Request a new one." };

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { error: error.message };

  await logAuditEvent({ action: "auth.password.updated", actorId: user.id });
  redirect("/dashboard");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  await supabase.auth.signOut();
  await logAuditEvent({ action: "auth.sign_out", actorId: user?.id ?? null });
  redirect("/login");
}

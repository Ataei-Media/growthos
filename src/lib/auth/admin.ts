import "server-only";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { getCurrentUser } from "@/lib/auth/session";
import { getServerEnv } from "@/lib/env";

function adminEmails(): string[] {
  return (getServerEnv().ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** Require a signed-in user whose email is on the ADMIN_EMAILS allowlist. */
export async function requireAdmin(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/admin");
  const allowed = adminEmails();
  if (!user.email || !allowed.includes(user.email.toLowerCase())) {
    redirect("/");
  }
  return user;
}

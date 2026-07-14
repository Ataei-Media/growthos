import "server-only";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import type { Role } from "@/config/roles";

const ACTIVE_ORG_COOKIE = "growthos.active_org";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: string;
  owner_id: string;
}

export interface Membership {
  organization: Organization;
  role: Role;
}

/** All organizations the current user belongs to, with their role in each. */
export async function getUserOrganizations(): Promise<Membership[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const supabase = await createClient();
  const { data: memberships } = await supabase
    .from("organization_members")
    .select("organization_id, role")
    .eq("user_id", user.id);

  if (!memberships || memberships.length === 0) return [];

  const orgIds = memberships.map((m) => m.organization_id);
  const { data: orgs } = await supabase
    .from("organizations")
    .select("id, name, slug, plan, owner_id")
    .in("id", orgIds);

  const byId = new Map((orgs ?? []).map((o) => [o.id, o]));
  const result: Membership[] = [];
  for (const m of memberships) {
    const organization = byId.get(m.organization_id);
    if (organization) result.push({ organization, role: m.role as Role });
  }
  return result;
}

/** The active organization for this request (cookie-selected, else the first). */
export async function getActiveOrganization(): Promise<Membership | null> {
  const memberships = await getUserOrganizations();
  if (memberships.length === 0) return null;

  const cookieStore = await cookies();
  const activeId = cookieStore.get(ACTIVE_ORG_COOKIE)?.value;
  return memberships.find((m) => m.organization.id === activeId) ?? memberships[0];
}

/** Persist the active-organization selection (call from a server action/route). */
export async function setActiveOrganization(organizationId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_ORG_COOKIE, organizationId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

/** URL-safe org slug derived from a name, with a short suffix for uniqueness. */
export function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base || "workspace"}-${suffix}`;
}

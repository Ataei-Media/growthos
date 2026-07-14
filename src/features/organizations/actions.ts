"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import { logAuditEvent } from "@/lib/security/audit-log";
import { clientEnv } from "@/lib/env";
import { can, type Role } from "@/config/roles";
import { createOrgSchema, inviteSchema } from "@/features/auth/schema";
import {
  getActiveOrganization,
  getUserOrganizations,
  setActiveOrganization,
  slugify,
} from "./service";

export type OrgFormState = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
} | undefined;

export async function createOrganizationAction(
  _prev: OrgFormState,
  formData: FormData,
): Promise<OrgFormState> {
  const parsed = createOrgSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_organization", {
    org_name: parsed.data.name,
    org_slug: slugify(parsed.data.name),
  });

  if (error || !data) return { error: "We couldn't create your workspace. Please try again." };

  await setActiveOrganization(data.id);
  await logAuditEvent({
    action: "organization.created",
    organizationId: data.id,
    actorId: user.id,
    targetType: "organization",
    targetId: data.id,
  });
  redirect("/dashboard");
}

export async function switchOrganizationAction(formData: FormData): Promise<void> {
  const orgId = formData.get("organizationId");
  if (typeof orgId !== "string") redirect("/dashboard");

  const memberships = await getUserOrganizations();
  const isMember = memberships.some((m) => m.organization.id === orgId);
  if (!isMember) redirect("/dashboard");

  await setActiveOrganization(orgId);
  redirect("/dashboard");
}

/**
 * Create a team invitation. Callable from the (Milestone 4) team settings UI.
 * Returns the accept URL so it can be shown/copied; email delivery is wired
 * with the Resend module in a later milestone.
 */
export async function createInvitation(input: {
  email: string;
  role: Exclude<Role, "owner">;
}): Promise<{ ok: true; inviteUrl: string } | { ok: false; error: string }> {
  const parsed = inviteSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid invitation details." };

  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Not authenticated." };

  const active = await getActiveOrganization();
  if (!active) return { ok: false, error: "No active organization." };
  if (!can(active.role, "members:manage")) {
    return { ok: false, error: "You don't have permission to invite members." };
  }

  const token = `${crypto.randomUUID()}${crypto.randomUUID()}`.replace(/-/g, "");
  const supabase = await createClient();
  const { error } = await supabase.from("invitations").insert({
    organization_id: active.organization.id,
    email: parsed.data.email,
    role: parsed.data.role,
    token,
    invited_by: user.id,
  });

  if (error) return { ok: false, error: "Could not create the invitation." };

  await logAuditEvent({
    action: "member.invited",
    organizationId: active.organization.id,
    actorId: user.id,
    metadata: { email: parsed.data.email, role: parsed.data.role },
  });

  return { ok: true, inviteUrl: `${clientEnv.NEXT_PUBLIC_APP_URL}/accept-invite?token=${token}` };
}

export async function acceptInvitationAction(
  _prev: OrgFormState,
  formData: FormData,
): Promise<OrgFormState> {
  const token = formData.get("token");
  if (typeof token !== "string" || !token) return { error: "Missing invitation token." };

  const user = await getCurrentUser();
  if (!user) redirect(`/login?redirect=/accept-invite?token=${token}`);

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("accept_invitation", { invite_token: token });

  if (error || !data) {
    return { error: error?.message ?? "This invitation is no longer valid." };
  }

  await setActiveOrganization(data);
  await logAuditEvent({
    action: "member.joined",
    organizationId: data,
    actorId: user.id,
  });
  redirect("/dashboard");
}

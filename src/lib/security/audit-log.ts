import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export interface AuditLogInput {
  action: string;
  organizationId?: string | null;
  actorId?: string | null;
  targetType?: string | null;
  targetId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown>;
}

/**
 * Append a security-relevant action to the immutable `audit_logs` trail.
 * Best-effort: never throws into the caller's flow (auth must not fail because
 * logging failed). Writes via the service role so it works pre-membership.
 */
export async function logAuditEvent(input: AuditLogInput): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const admin = createAdminClient();
    await admin.from("audit_logs").insert({
      action: input.action,
      organization_id: input.organizationId ?? null,
      actor_id: input.actorId ?? null,
      target_type: input.targetType ?? null,
      target_id: input.targetId ?? null,
      ip: input.ip ?? null,
      user_agent: input.userAgent ?? null,
      metadata: (input.metadata ?? {}) as never,
    });
  } catch (error) {
    console.error("[audit-log] failed to record event", input.action, error);
  }
}

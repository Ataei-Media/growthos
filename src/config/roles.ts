/**
 * Role-based access control.
 *
 * Five roles, ordered by privilege. Permissions are declared here so both the
 * UI (what to show) and server actions (what to allow) read from one source.
 * Database RLS is the hard boundary; this layer is the application contract.
 */

export const ROLES = ["owner", "admin", "manager", "analyst", "viewer"] as const;
export type Role = (typeof ROLES)[number];

/** Higher number = more privilege. Useful for "can manage a lower role" checks. */
export const ROLE_RANK: Record<Role, number> = {
  owner: 100,
  admin: 80,
  manager: 60,
  analyst: 40,
  viewer: 20,
};

export const ROLE_LABELS: Record<Role, string> = {
  owner: "Owner",
  admin: "Admin",
  manager: "Manager",
  analyst: "Analyst",
  viewer: "Viewer",
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  owner: "Full control, including billing and deleting the organization.",
  admin: "Manage members, settings and everything below billing.",
  manager: "Run audits, manage opportunities and generate assets.",
  analyst: "Run audits and view everything; cannot manage the team.",
  viewer: "Read-only access to reports and opportunities.",
};

/**
 * Granular capabilities. Kept coarse for now and expanded per milestone as
 * new surfaces (marketing generator, billing, API keys) come online.
 */
export const PERMISSIONS = [
  "org:manage", // rename, delete, transfer ownership
  "billing:manage",
  "members:manage", // invite, remove, change roles
  "audits:run",
  "opportunities:write",
  "assets:generate",
  "reports:read",
  "settings:manage",
] as const;
export type Permission = (typeof PERMISSIONS)[number];

const rolePermissions: Record<Role, Permission[]> = {
  owner: [...PERMISSIONS],
  admin: [
    "members:manage",
    "audits:run",
    "opportunities:write",
    "assets:generate",
    "reports:read",
    "settings:manage",
  ],
  manager: ["audits:run", "opportunities:write", "assets:generate", "reports:read"],
  analyst: ["audits:run", "reports:read"],
  viewer: ["reports:read"],
};

/** Does a role hold a permission? */
export function can(role: Role, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
}

/** Can `actor` assign/manage a member holding `target` role? */
export function canManageRole(actor: Role, target: Role): boolean {
  if (!can(actor, "members:manage")) return false;
  return ROLE_RANK[actor] >= ROLE_RANK[target];
}

/** Roles an actor is allowed to grant when inviting (never above their own). */
export function assignableRoles(actor: Role): Role[] {
  if (!can(actor, "members:manage")) return [];
  return ROLES.filter((r) => ROLE_RANK[r] <= ROLE_RANK[actor]);
}

import { signOut } from "@/features/auth/actions";
import { OrgSwitcher } from "@/components/dashboard/org-switcher";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS, type Role } from "@/config/roles";

interface TopBarProps {
  email: string;
  organizations: { id: string; name: string }[];
  activeOrgId: string;
  activeOrgName: string;
  role: Role;
}

/** Temporary app header — the full sidebar shell arrives in Milestone 4. */
export function DashboardTopBar({
  email,
  organizations,
  activeOrgId,
  activeOrgName,
  role,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-3">
          <Logo showWordmark={false} />
          {organizations.length > 1 ? (
            <OrgSwitcher organizations={organizations} activeId={activeOrgId} />
          ) : (
            <span className="text-sm font-medium text-foreground">{activeOrgName}</span>
          )}
          <Badge variant="outline">{ROLE_LABELS[role]}</Badge>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden text-sm text-muted-foreground sm:inline">{email}</span>
          <ThemeToggle />
          <form action={signOut}>
            <Button type="submit" variant="ghost" size="sm">
              Sign out
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}

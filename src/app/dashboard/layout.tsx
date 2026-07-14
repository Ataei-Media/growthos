import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import {
  getActiveOrganization,
  getUserOrganizations,
} from "@/features/organizations/service";
import { DashboardTopBar } from "@/components/dashboard/top-bar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser("/dashboard");

  const active = await getActiveOrganization();
  if (!active) redirect("/onboarding");

  const memberships = await getUserOrganizations();

  return (
    <div className="min-h-screen">
      <DashboardTopBar
        email={user.email ?? ""}
        organizations={memberships.map((m) => m.organization)}
        activeOrgId={active.organization.id}
        activeOrgName={active.organization.name}
        role={active.role}
      />
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}

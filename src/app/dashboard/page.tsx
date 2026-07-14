import type { Metadata } from "next";
import { Target } from "lucide-react";
import { getActiveOrganization } from "@/features/organizations/service";

export const metadata: Metadata = { title: "Mission Control" };

export default async function DashboardPage() {
  const active = await getActiveOrganization();
  const orgName = active?.organization.name ?? "your workspace";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Mission Control
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome to {orgName}. Your revenue opportunities will surface here.
        </p>
      </div>

      {/* Opportunity-first empty state (the Opportunity Engine lands in M4/M5). */}
      <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
        <span className="mx-auto inline-flex size-11 items-center justify-center rounded-lg border border-border bg-background text-accent">
          <Target className="size-5" />
        </span>
        <h2 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
          No opportunities yet
        </h2>
        <p className="mx-auto mt-1.5 max-w-md text-sm text-muted-foreground">
          Run your first Revenue Audit and GrowthOS will surface prioritised,
          money-ranked opportunities right here — each one actionable in a click.
        </p>
      </div>
    </div>
  );
}

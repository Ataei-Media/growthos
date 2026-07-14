import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { CreateOrganizationForm } from "@/components/organizations/create-organization-form";
import { ConfigNote } from "@/components/auth/config-note";
import { requireUser } from "@/lib/auth/session";
import { getUserOrganizations } from "@/features/organizations/service";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Create your workspace" };

export default async function OnboardingPage() {
  await requireUser("/onboarding");

  const memberships = await getUserOrganizations();
  if (memberships.length > 0) redirect("/dashboard");

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <AuthCard
        title="Create your workspace"
        subtitle="One workspace per brand or client — you can add more anytime."
      >
        {!isSupabaseConfigured() ? <ConfigNote /> : null}
        <CreateOrganizationForm />
      </AuthCard>
    </main>
  );
}

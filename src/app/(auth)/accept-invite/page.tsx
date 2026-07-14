import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { AcceptInviteForm } from "@/components/organizations/accept-invite-form";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Accept invitation" };

export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <AuthCard
        title="Invitation not found"
        subtitle="This invitation link is missing or malformed."
        footer={
          <Link href="/login" className="font-medium text-foreground hover:underline">
            Back to sign in
          </Link>
        }
      >
        <p className="text-sm text-muted-foreground">
          Ask your teammate to resend the invitation.
        </p>
      </AuthCard>
    );
  }

  // Must be signed in with the invited email to accept.
  await requireUser(`/accept-invite?token=${token}`);

  return (
    <AuthCard
      title="Join the team"
      subtitle="Accept your invitation to start collaborating in GrowthOS."
    >
      <AcceptInviteForm token={token} />
    </AuthCard>
  );
}

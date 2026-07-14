import type { Metadata } from "next";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { AuthCard } from "@/components/auth/auth-card";

export const metadata: Metadata = { title: "Check your email" };

const messages: Record<string, { title: string; subtitle: string }> = {
  signup: {
    title: "Confirm your email",
    subtitle: "We sent a confirmation link to finish creating your account.",
  },
  magic: {
    title: "Check your email",
    subtitle: "We sent you a magic link. Click it to sign in — no password needed.",
  },
  reset: {
    title: "Check your email",
    subtitle: "If an account exists, we've sent a link to reset your password.",
  },
};

export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const copy = messages[type ?? "magic"] ?? messages.magic;

  return (
    <AuthCard
      title={copy.title}
      subtitle={copy.subtitle}
      footer={
        <Link href="/login" className="font-medium text-foreground hover:underline">
          Back to sign in
        </Link>
      }
    >
      <div className="flex items-center gap-3 rounded-md border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
        <MailCheck className="size-5 text-success" />
        <span>Didn&apos;t get it? Check spam, or wait a moment and try again.</span>
      </div>
    </AuthCard>
  );
}

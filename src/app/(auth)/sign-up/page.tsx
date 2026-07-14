import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard, OrDivider } from "@/components/auth/auth-card";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { ConfigNote } from "@/components/auth/config-note";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Create your account" };

export default function SignUpPage() {
  const configured = isSupabaseConfigured();

  return (
    <AuthCard
      title="Create your account"
      subtitle="Start finding revenue in minutes."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-foreground hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      {!configured ? <ConfigNote /> : null}
      <OAuthButtons configured={configured} next="/onboarding" />
      <OrDivider />
      <SignUpForm />
    </AuthCard>
  );
}

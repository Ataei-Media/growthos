import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard, OrDivider } from "@/components/auth/auth-card";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { SignInForm } from "@/components/auth/sign-in-form";
import { ConfigNote } from "@/components/auth/config-note";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { sanitizeNext } from "@/lib/auth/redirects";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params = await searchParams;
  const redirectTo = sanitizeNext(params.redirect);
  const configured = isSupabaseConfigured();

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to your GrowthOS workspace."
      footer={
        <>
          New to GrowthOS?{" "}
          <Link href="/sign-up" className="font-medium text-foreground hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      {!configured ? <ConfigNote /> : null}
      <OAuthButtons configured={configured} next={redirectTo} />
      <OrDivider />
      <SignInForm redirectTo={redirectTo} />
    </AuthCard>
  );
}

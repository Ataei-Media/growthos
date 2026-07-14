import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";

export const metadata: Metadata = { title: "Link expired" };

export default function AuthErrorPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <Logo />
      <h1 className="mt-8 text-2xl font-semibold tracking-tight text-foreground">
        This link is invalid or has expired
      </h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Sign-in and confirmation links are single-use and time-limited for your
        security. Request a fresh one to continue.
      </p>
      <Button asChild className="mt-6">
        <Link href="/login">Back to sign in</Link>
      </Button>
    </main>
  );
}

"use client";

import * as React from "react";
import { useActionState } from "react";
import Link from "next/link";
import { sendMagicLink, signInWithPassword, type AuthState } from "@/features/auth/actions";
import { Field } from "./field";
import { SubmitButton } from "./submit-button";
import { FormError } from "./form-error";

export function SignInForm({ redirectTo }: { redirectTo?: string }) {
  const [mode, setMode] = React.useState<"password" | "magic">("password");
  const [pwState, pwAction] = useActionState<AuthState, FormData>(signInWithPassword, undefined);
  const [magicState, magicAction] = useActionState<AuthState, FormData>(sendMagicLink, undefined);

  if (mode === "magic") {
    return (
      <form action={magicAction} className="space-y-4">
        <FormError message={magicState?.error} />
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          errors={magicState?.fieldErrors?.email}
          required
        />
        <SubmitButton className="w-full">Email me a magic link</SubmitButton>
        <button
          type="button"
          onClick={() => setMode("password")}
          className="w-full text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Use a password instead
        </button>
      </form>
    );
  }

  return (
    <form action={pwAction} className="space-y-4">
      <FormError message={pwState?.error} />
      {redirectTo ? <input type="hidden" name="redirect" value={redirectTo} /> : null}
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@company.com"
        errors={pwState?.fieldErrors?.email}
        required
      />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        errors={pwState?.fieldErrors?.password}
        required
        hint={
          <Link
            href="/forgot-password"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Forgot password?
          </Link>
        }
      />
      <SubmitButton className="w-full">Sign in</SubmitButton>
      <button
        type="button"
        onClick={() => setMode("magic")}
        className="w-full text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        Email me a magic link instead
      </button>
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { signUpWithPassword, type AuthState } from "@/features/auth/actions";
import { Field } from "./field";
import { SubmitButton } from "./submit-button";
import { FormError } from "./form-error";

export function SignUpForm() {
  const [state, action] = useActionState<AuthState, FormData>(signUpWithPassword, undefined);

  return (
    <form action={action} className="space-y-4">
      <FormError message={state?.error} />
      <Field
        label="Full name"
        name="fullName"
        autoComplete="name"
        placeholder="Alex Rivera"
        errors={state?.fieldErrors?.fullName}
        required
      />
      <Field
        label="Work email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@company.com"
        errors={state?.fieldErrors?.email}
        required
      />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder="At least 8 characters"
        errors={state?.fieldErrors?.password}
        required
      />
      <SubmitButton className="w-full">Create account</SubmitButton>
      <p className="text-center text-xs text-muted-foreground">
        By continuing you agree to our Terms and Privacy Policy.
      </p>
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { requestPasswordReset, type AuthState } from "@/features/auth/actions";
import { Field } from "./field";
import { SubmitButton } from "./submit-button";
import { FormError } from "./form-error";

export function ForgotPasswordForm() {
  const [state, action] = useActionState<AuthState, FormData>(requestPasswordReset, undefined);

  return (
    <form action={action} className="space-y-4">
      <FormError message={state?.error} />
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@company.com"
        errors={state?.fieldErrors?.email}
        required
      />
      <SubmitButton className="w-full">Send reset link</SubmitButton>
    </form>
  );
}

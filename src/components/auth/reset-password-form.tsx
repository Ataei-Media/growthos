"use client";

import { useActionState } from "react";
import { updatePassword, type AuthState } from "@/features/auth/actions";
import { Field } from "./field";
import { SubmitButton } from "./submit-button";
import { FormError } from "./form-error";

export function ResetPasswordForm() {
  const [state, action] = useActionState<AuthState, FormData>(updatePassword, undefined);

  return (
    <form action={action} className="space-y-4">
      <FormError message={state?.error} />
      <Field
        label="New password"
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder="At least 8 characters"
        errors={state?.fieldErrors?.password}
        required
      />
      <Field
        label="Confirm password"
        name="confirm"
        type="password"
        autoComplete="new-password"
        placeholder="Re-enter your password"
        errors={state?.fieldErrors?.confirm}
        required
      />
      <SubmitButton className="w-full">Update password</SubmitButton>
    </form>
  );
}

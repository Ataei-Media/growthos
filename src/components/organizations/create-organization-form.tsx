"use client";

import { useActionState } from "react";
import {
  createOrganizationAction,
  type OrgFormState,
} from "@/features/organizations/actions";
import { Field } from "@/components/auth/field";
import { SubmitButton } from "@/components/auth/submit-button";
import { FormError } from "@/components/auth/form-error";

export function CreateOrganizationForm() {
  const [state, action] = useActionState<OrgFormState, FormData>(
    createOrganizationAction,
    undefined,
  );

  return (
    <form action={action} className="space-y-4">
      <FormError message={state?.error} />
      <Field
        label="Workspace name"
        name="name"
        placeholder="Acme, Inc."
        errors={state?.fieldErrors?.name}
        autoFocus
        required
      />
      <SubmitButton className="w-full">Create workspace</SubmitButton>
    </form>
  );
}

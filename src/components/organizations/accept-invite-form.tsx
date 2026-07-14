"use client";

import { useActionState } from "react";
import {
  acceptInvitationAction,
  type OrgFormState,
} from "@/features/organizations/actions";
import { SubmitButton } from "@/components/auth/submit-button";
import { FormError } from "@/components/auth/form-error";

export function AcceptInviteForm({ token }: { token: string }) {
  const [state, action] = useActionState<OrgFormState, FormData>(
    acceptInvitationAction,
    undefined,
  );

  return (
    <form action={action} className="space-y-4">
      <FormError message={state?.error} />
      <input type="hidden" name="token" value={token} />
      <SubmitButton className="w-full">Join organization</SubmitButton>
    </form>
  );
}

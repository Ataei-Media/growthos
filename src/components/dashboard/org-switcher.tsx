"use client";

import { useRef } from "react";
import { switchOrganizationAction } from "@/features/organizations/actions";

interface OrgOption {
  id: string;
  name: string;
}

/** Native-select org switcher that submits on change (no extra dependencies). */
export function OrgSwitcher({ organizations, activeId }: { organizations: OrgOption[]; activeId: string }) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={switchOrganizationAction}>
      <label htmlFor="org-switcher" className="sr-only">
        Switch organization
      </label>
      <select
        id="org-switcher"
        name="organizationId"
        defaultValue={activeId}
        onChange={() => formRef.current?.requestSubmit()}
        className="h-9 rounded-md border border-border bg-background px-2.5 text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {organizations.map((org) => (
          <option key={org.id} value={org.id}>
            {org.name}
          </option>
        ))}
      </select>
    </form>
  );
}

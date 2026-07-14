import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FieldProps extends React.ComponentProps<"input"> {
  label: string;
  name: string;
  errors?: string[];
  hint?: React.ReactNode;
}

/** Label + input + inline validation errors, wired for accessibility. */
export function Field({ label, name, errors, hint, ...props }: FieldProps) {
  const errorId = errors?.length ? `${name}-error` : undefined;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label htmlFor={name}>{label}</Label>
        {hint}
      </div>
      <Input
        id={name}
        name={name}
        aria-invalid={Boolean(errors?.length)}
        aria-describedby={errorId}
        {...props}
      />
      {errors?.length ? (
        <p id={errorId} className="text-xs text-destructive">
          {errors[0]}
        </p>
      ) : null}
    </div>
  );
}

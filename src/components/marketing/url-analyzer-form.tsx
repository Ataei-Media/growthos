"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/** Accepts "example.com" or a full URL; returns a normalised https URL or null. */
function normalizeUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withProtocol);
    if (!url.hostname.includes(".")) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function UrlAnalyzerForm({
  className,
  buttonVariant = "primary",
}: {
  className?: string;
  buttonVariant?: ButtonProps["variant"];
}) {
  const router = useRouter();
  const [value, setValue] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    const normalized = normalizeUrl(value);
    if (!normalized) {
      setError("Enter a valid website, like yourbrand.com");
      return;
    }
    setPending(true);
    router.push(`/start?url=${encodeURIComponent(normalized)}`);
  }

  return (
    <form onSubmit={handleSubmit} className={cn("w-full", className)} noValidate>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <label htmlFor="website-url" className="sr-only">
            Your website URL
          </label>
          <Input
            id="website-url"
            name="url"
            inputMode="url"
            autoComplete="url"
            placeholder="yourbrand.com"
            value={value}
            disabled={pending}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "url-error" : undefined}
            onChange={(e) => setValue(e.target.value)}
            className="h-12 text-base"
          />
        </div>
        <Button
          type="submit"
          size="lg"
          variant={buttonVariant}
          disabled={pending}
          className="h-12 sm:w-auto"
        >
          {pending ? (
            <>
              <Loader2 className="animate-spin" />
              Starting…
            </>
          ) : (
            <>
              Find my hidden revenue
              <ArrowRight />
            </>
          )}
        </Button>
      </div>
      {error ? (
        <p id="url-error" role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <p className="mt-3 text-sm text-muted-foreground">
        Free preview · Full report €29 · Results in under 2 minutes
      </p>
    </form>
  );
}

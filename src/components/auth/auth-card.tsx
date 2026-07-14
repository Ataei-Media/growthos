import * as React from "react";
import Link from "next/link";
import { Logo } from "@/components/shared/logo";

interface AuthCardProps {
  title: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/** Consistent, minimal wrapper for every auth screen (Linear-quality). */
export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="w-full max-w-sm">
      <Link href="/" aria-label="GrowthOS home" className="inline-flex">
        <Logo />
      </Link>

      <div className="mt-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        {subtitle ? <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>

      <div className="mt-7">{children}</div>

      {footer ? <div className="mt-7 text-sm text-muted-foreground">{footer}</div> : null}
    </div>
  );
}

/** "or" divider used between OAuth and email forms. */
export function OrDivider() {
  return (
    <div className="relative my-5">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-background px-2 text-xs uppercase tracking-wider text-muted-foreground">
          or
        </span>
      </div>
    </div>
  );
}

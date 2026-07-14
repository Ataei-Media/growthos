"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";

const STEPS = [
  "Crawling your website",
  "Reading your homepage like a buyer",
  "Auditing conversion, trust & messaging",
  "Checking SEO, mobile & performance",
  "Sizing the revenue opportunity",
  "Writing your report",
];

/**
 * Runs the (long) generation via the generate route, animating progress, then
 * refreshes the page to reveal the report. The request drives the work; the UI
 * only reflects it.
 */
export function AnalyzingReport({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [step, setStep] = React.useState(0);
  const [failed, setFailed] = React.useState(false);
  const started = React.useRef(false);

  React.useEffect(() => {
    if (started.current) return;
    started.current = true;

    const ticker = setInterval(() => {
      setStep((s) => (s < STEPS.length - 1 ? s + 1 : s));
    }, 9000);

    (async () => {
      try {
        const res = await fetch(`/report/${reportId}/generate`, { method: "POST" });
        const data = (await res.json()) as { status?: string };
        clearInterval(ticker);
        if (data.status === "ready") {
          router.refresh();
        } else {
          setFailed(true);
        }
      } catch {
        clearInterval(ticker);
        setFailed(true);
      }
    })();

    return () => clearInterval(ticker);
  }, [reportId, router]);

  if (failed) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <AlertCircle className="size-8 text-warning" />
        <h1 className="mt-4 text-xl font-semibold tracking-tight text-foreground">
          We couldn&apos;t finish this analysis
        </h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          The site may be unreachable or blocking automated access. Try again with
          a different URL.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">Start over</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <Logo />
      <div className="mt-10 flex items-center gap-2 text-sm font-medium text-foreground">
        <Loader2 className="size-4 animate-spin text-accent" />
        {STEPS[step]}…
      </div>
      <div className="mt-6 h-1 w-64 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-accent transition-all duration-700 ease-out"
          style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
        />
      </div>
      <p className="mt-6 max-w-sm text-sm text-muted-foreground">
        Building your Revenue Intelligence Report. This usually takes under two
        minutes — hang tight.
      </p>
    </div>
  );
}

import Link from "next/link";
import { Infinity as InfinityIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SUBSCRIPTION } from "@/config/pricing";

/** Post-purchase growth loop: offer unlimited reports. */
export function Upsell() {
  return (
    <section className="rounded-2xl border border-border bg-primary p-8 text-center sm:p-10">
      <span className="inline-flex size-11 items-center justify-center rounded-lg bg-primary-foreground/10 text-primary-foreground">
        <InfinityIcon className="size-5" />
      </span>
      <h2 className="mt-4 text-2xl font-semibold tracking-tight text-primary-foreground">
        Want another report?
      </h2>
      <p className="mx-auto mt-2 max-w-md text-primary-foreground/70">
        {SUBSCRIPTION.blurb} Audit every store, every client, as often as you like.
      </p>
      <div className="mt-6 flex flex-col items-center gap-3">
        <Button asChild size="lg" variant="accent">
          <Link href="/login?redirect=/dashboard/billing">
            Get unlimited reports — {SUBSCRIPTION.priceLabel}/{SUBSCRIPTION.interval}
          </Link>
        </Button>
        <span className="text-xs text-primary-foreground/50">Cancel anytime.</span>
      </div>
    </section>
  );
}

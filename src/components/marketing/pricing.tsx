import Link from "next/link";
import { Check } from "lucide-react";
import { pricingTiers } from "@/config/marketing";
import { Section, SectionHeading } from "@/components/shared/section";
import { Reveal } from "@/components/shared/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Pricing() {
  return (
    <Section id="pricing">
      <SectionHeading
        eyebrow="Pricing"
        title="Start free. Upgrade when the revenue shows up."
        lead="Every plan pays for itself with a single fix. No lock-in, cancel anytime."
      />

      <div className="mt-14 grid gap-6 lg:grid-cols-4">
        {pricingTiers.map((tier, i) => (
          <Reveal key={tier.id} index={i}>
            <div
              className={cn(
                "flex h-full flex-col rounded-xl border bg-card p-6",
                tier.highlighted
                  ? "border-accent ring-1 ring-accent"
                  : "border-border",
              )}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-foreground">{tier.name}</h3>
                {tier.highlighted && <Badge variant="accent">Most popular</Badge>}
              </div>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-semibold tracking-tight text-foreground">
                  {tier.priceLabel}
                </span>
                {tier.priceSuffix && (
                  <span className="text-sm text-muted-foreground">{tier.priceSuffix}</span>
                )}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{tier.blurb}</p>

              <Button
                asChild
                variant={tier.highlighted ? "accent" : "outline"}
                className="mt-6"
              >
                <Link href={tier.href}>{tier.cta}</Link>
              </Button>

              <ul className="mt-6 flex flex-col gap-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-success" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

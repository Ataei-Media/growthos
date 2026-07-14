import { Coins, MousePointerClick, TrendingUp, type LucideIcon } from "lucide-react";
import { intelligencePillars } from "@/config/marketing";
import { Section, SectionHeading } from "@/components/shared/section";
import { Reveal } from "@/components/shared/reveal";

const iconMap: Record<string, LucideIcon> = {
  MousePointerClick,
  TrendingUp,
  Coins,
};

export function Features() {
  return (
    <Section id="features">
      <SectionHeading
        eyebrow="What you get"
        title="See exactly where you're losing money."
        lead="GrowthOS reads your site the way a room full of specialists would — then hands you the shortlist that actually moves revenue."
      />

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {intelligencePillars.map((pillar, i) => {
          const Icon = iconMap[pillar.icon];
          return (
            <Reveal key={pillar.id} index={i}>
              <article className="group h-full rounded-xl border border-border bg-card p-7 transition-colors hover:border-foreground/20">
                <span className="inline-flex size-10 items-center justify-center rounded-lg border border-border bg-background text-accent">
                  {Icon ? <Icon className="size-5" /> : null}
                </span>
                <h3 className="mt-5 text-lg font-semibold tracking-tight text-foreground">
                  {pillar.title}
                </h3>
                <p className="mt-2.5 text-[15px] leading-relaxed text-muted-foreground">
                  {pillar.description}
                </p>
              </article>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}

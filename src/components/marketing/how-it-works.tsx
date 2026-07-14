import { howItWorks } from "@/config/marketing";
import { Section, SectionHeading } from "@/components/shared/section";
import { Reveal } from "@/components/shared/reveal";

export function HowItWorks() {
  return (
    <Section id="how-it-works" className="bg-card/40">
      <SectionHeading
        eyebrow="How it works"
        title="From URL to recovered revenue in three steps."
        lead="No onboarding, no integration, no meeting. Just answers."
      />

      <ol className="mt-14 grid gap-6 md:grid-cols-3">
        {howItWorks.map((item, i) => (
          <Reveal key={item.step} index={i} as="li">
            <div className="relative h-full rounded-xl border border-border bg-background p-7">
              <span className="inline-flex size-9 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
                {item.step}
              </span>
              <h3 className="mt-5 text-lg font-semibold tracking-tight text-foreground">
                {item.title}
              </h3>
              <p className="mt-2.5 text-[15px] leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </div>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}

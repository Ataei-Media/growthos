import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/shared/reveal";
import { UrlAnalyzerForm } from "@/components/marketing/url-analyzer-form";
import { HeroPreview } from "@/components/marketing/hero-preview";
import { TrackEvent } from "@/components/analytics/track-event";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <TrackEvent event="landing_page_visit" />
      {/* Very subtle top wash — no heavy gradient. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(60%_100%_at_50%_0%,color-mix(in_srgb,var(--accent)_8%,transparent),transparent)]"
      />
      <div className="relative mx-auto max-w-6xl px-6 pb-16 pt-16 sm:pb-24 sm:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <Badge variant="accent" className="mb-6">
              <Sparkles className="size-3.5" />
              Revenue Intelligence Platform
            </Badge>
          </Reveal>

          <Reveal index={1}>
            <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
              Every business leaks revenue.
            </h1>
          </Reveal>

          <Reveal index={2}>
            <p className="mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Discover yours in under two minutes. Your website is quietly losing
              sales every day — GrowthOS shows you exactly where, and how much you
              could win back.
            </p>
          </Reveal>

          <Reveal index={3}>
            <div className="mx-auto mt-9 max-w-xl">
              <UrlAnalyzerForm />
            </div>
          </Reveal>
        </div>

        <Reveal index={4}>
          <div className="mt-16 sm:mt-20">
            <HeroPreview />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

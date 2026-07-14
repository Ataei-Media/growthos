import { Reveal } from "@/components/shared/reveal";
import { UrlAnalyzerForm } from "@/components/marketing/url-analyzer-form";

export function CtaBand() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl border border-border bg-primary px-6 py-14 text-center sm:px-12 sm:py-20">
            <h2 className="mx-auto max-w-2xl text-balance text-3xl font-semibold tracking-tight text-primary-foreground sm:text-4xl">
              See the revenue you&apos;re leaving on the table.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-primary-foreground/70">
              Run your first Revenue Audit free. It takes less time than reading
              this page did.
            </p>
            <div className="mx-auto mt-8 max-w-xl [&_p]:text-primary-foreground/60">
              <UrlAnalyzerForm buttonVariant="accent" />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

import { proofPoints } from "@/config/marketing";
import { Reveal } from "@/components/shared/reveal";

export function SocialProof() {
  return (
    <div className="border-y border-border bg-card/50">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <Reveal>
          <p className="text-center text-sm font-medium text-muted-foreground">
            Built for growing ecommerce brands
          </p>
        </Reveal>
        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {proofPoints.map((point, i) => (
            <Reveal key={point.label} index={i} className="text-center">
              <div className="text-3xl font-semibold tracking-tight text-foreground">
                {point.value}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">{point.label}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}

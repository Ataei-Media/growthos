"use client";

import * as React from "react";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { startReportWithContext } from "@/features/report/actions";
import {
  AOV_OPTIONS,
  CHALLENGES,
  COUNTRIES,
  GOALS,
  INDUSTRIES,
  type OnboardingAnswers,
} from "@/config/onboarding";
import { Logo } from "@/components/shared/logo";
import { FormError } from "@/components/auth/form-error";
import { cn } from "@/lib/utils";

type AnswerKey = keyof OnboardingAnswers;

interface Question {
  key: AnswerKey;
  title: string;
  subtitle: string;
  options: { label: string; value: string | number }[];
}

const QUESTIONS: Question[] = [
  {
    key: "industry",
    title: "What do you sell?",
    subtitle: "So we benchmark you against the right brands.",
    options: INDUSTRIES.map((v) => ({ label: v, value: v })),
  },
  {
    key: "country",
    title: "Where are most of your customers?",
    subtitle: "We localise examples and revenue math to your market.",
    options: COUNTRIES.map((v) => ({ label: v, value: v })),
  },
  {
    key: "averageOrderValueCents",
    title: "What's your average order value?",
    subtitle: "This anchors every revenue estimate in your report.",
    options: AOV_OPTIONS.map((o) => ({ label: o.label, value: o.cents })),
  },
  {
    key: "mainGoal",
    title: "What matters most right now?",
    subtitle: "Your top priorities will lead the report.",
    options: GOALS.map((v) => ({ label: v, value: v })),
  },
  {
    key: "biggestChallenge",
    title: "What's your biggest challenge?",
    subtitle: "We'll dig hardest where it hurts most.",
    options: CHALLENGES.map((v) => ({ label: v, value: v })),
  },
];

export function OnboardingWizard({ url }: { url: string }) {
  const [step, setStep] = React.useState(0);
  const [answers, setAnswers] = React.useState<Partial<OnboardingAnswers>>({});
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  let host = url;
  try {
    host = new URL(url).host;
  } catch {
    /* keep */
  }

  const question = QUESTIONS[step];
  const isLast = step === QUESTIONS.length - 1;

  async function choose(value: string | number) {
    const next = { ...answers, [question.key]: value } as Partial<OnboardingAnswers>;
    setAnswers(next);

    if (!isLast) {
      setStep((s) => s + 1);
      return;
    }

    // Final answer — start the analysis.
    setSubmitting(true);
    setError(null);
    const result = await startReportWithContext({
      url,
      industry: String(next.industry),
      country: String(next.country),
      averageOrderValueCents: Number(next.averageOrderValueCents),
      mainGoal: String(next.mainGoal),
      biggestChallenge: String(next.biggestChallenge),
    });
    if (result?.error) {
      setError(result.error);
      setSubmitting(false);
    }
  }

  if (submitting && !error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <Logo />
        <div className="mt-10 flex items-center gap-2 text-sm font-medium text-foreground">
          <Loader2 className="size-4 animate-spin text-accent" />
          Preparing your personalised analysis…
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-between">
          <Logo />
          <span className="text-xs text-muted-foreground">
            Question {step + 1} of {QUESTIONS.length}
          </span>
        </div>

        {/* Progress */}
        <div className="mt-5 flex gap-1.5">
          {QUESTIONS.map((q, i) => (
            <div
              key={q.key}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                i <= step ? "bg-accent" : "bg-secondary",
              )}
            />
          ))}
        </div>

        <div className="mt-8">
          <p className="text-xs font-medium text-muted-foreground">{host}</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
            {question.title}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">{question.subtitle}</p>
        </div>

        {error ? <div className="mt-5"><FormError message={error} /></div> : null}

        <div className="mt-6 flex flex-col gap-2.5">
          {question.options.map((opt) => {
            const selected = answers[question.key] === opt.value;
            return (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => choose(opt.value)}
                disabled={submitting}
                className={cn(
                  "flex items-center justify-between rounded-lg border px-4 py-3 text-left text-[15px] transition-colors",
                  "hover:border-accent hover:bg-accent/5",
                  selected ? "border-accent bg-accent/5 text-foreground" : "border-border text-foreground/90",
                )}
              >
                {opt.label}
                {selected ? <Check className="size-4 text-accent" /> : null}
              </button>
            );
          })}
        </div>

        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className="mt-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back
          </button>
        ) : null}
      </div>
    </div>
  );
}

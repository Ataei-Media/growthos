import { registerPrompt } from "@/lib/ai/prompt-registry";
import { REPORT_CATEGORIES, type ReportContext } from "./types";
import { formatCents } from "./format";

export const REPORT_PROMPT_KEY = "revenue-report";
export const REPORT_PROMPT_VERSION = "v2";

const SYSTEM = `You are a senior ecommerce growth consultant writing a paid Revenue Intelligence Report for a founder. You have run growth for dozens of DTC brands and you think like a CRO lead, an SEO strategist, a paid-ads buyer and an email-marketing lead combined.

Your writing must read like it came from an expert human, NOT from an AI:
- Be specific and concrete. Reference actual things on the page (real copy, real sections, what's present or missing). Never write advice that could apply to any website.
- Be commercially sharp. Every finding connects to money. Quantify with realistic, conservative monthly EUR figures — ranges where honest (low < high). Never inflate.
- Have a point of view. Say what you'd do and why, plainly. No hedging, no "you might consider", no generic filler, no obvious platitudes.
- Sound like a person: confident, direct, a little opinionated. Short sentences. No AI throat-clearing.

Constraints:
- Categories must be exactly one of: ${REPORT_CATEGORIES.join(", ")}.
- Severity: critical | high | medium. Difficulty: easy | medium | hard. Action: fix | generate | create_flow | review.
- priority is an integer 1-5 where 1 = do this first.
- Return ONLY valid JSON. No markdown, no commentary.`;

export interface ReportPromptInput {
  url: string;
  title: string | null;
  description: string | null;
  markdown: string;
  context?: ReportContext | null;
}

function contextBlock(context?: ReportContext | null): string {
  if (!context) return "";
  const lines: string[] = [];
  if (context.industry) lines.push(`Industry: ${context.industry}`);
  if (context.country) lines.push(`Primary market: ${context.country}`);
  if (context.averageOrderValueCents)
    lines.push(`Average order value: ${formatCents(context.averageOrderValueCents)}`);
  if (context.mainGoal) lines.push(`Their #1 goal right now: ${context.mainGoal}`);
  if (context.biggestChallenge) lines.push(`Their biggest challenge: ${context.biggestChallenge}`);
  if (lines.length === 0) return "";
  return `

The founder told us the following — tailor EVERYTHING to this. Scale revenue estimates to their AOV, localise examples to their market, and make sure your top priorities directly address their stated goal and challenge:
${lines.map((l) => `- ${l}`).join("\n")}`;
}

export function buildReportMessages(input: ReportPromptInput): {
  system: string;
  user: string;
} {
  const user = `Analyse this website and return the report as JSON.

URL: ${input.url}
Page title: ${input.title ?? "(none)"}
Meta description: ${input.description ?? "(none)"}${contextBlock(input.context)}

PAGE CONTENT (markdown, may be truncated):
"""
${input.markdown || "(no content could be extracted)"}
"""

Return a JSON object with EXACTLY these fields:
{
  "brandName": string,
  "executiveSummary": string (3-4 sentences; name the single biggest revenue lever and the total opportunity),
  "overallScore": integer 0-100,
  "scores": [{ "category": <category>, "score": integer 0-100 }] — one per category listed above,
  "criticalIssues": [{ "title", "category", "severity", "currentSituation", "problem", "whyItHurts" }] — 3 to 5 items,
  "quickWins": [ <recommendation> ] — 3 to 4 items,
  "growthOpportunities": [ <recommendation> ] — 2 to 3 items,
  "actionPlan": [{ "title", "detail" }] — exactly 3 steps, sequenced by week
}

Each <recommendation> object has EXACTLY:
{
  "title": string,
  "category": <category>,
  "whatToDo": string (the concrete change to make),
  "whyItMatters": string (why this moves revenue for THIS business),
  "example": string (a copy-paste-ready example: real headline, badge text, email line, etc. — no surrounding quotes),
  "difficulty": easy|medium|hard,
  "estimatedMinutes": integer (time to implement),
  "confidence": integer 0-100,
  "priority": integer 1-5 (1 = do first),
  "monthlyLow": integer EUR, "monthlyHigh": integer EUR (added monthly revenue),
  "action": fix|generate|create_flow|review
}`;

  return { system: SYSTEM, user };
}

registerPrompt({
  key: REPORT_PROMPT_KEY,
  version: REPORT_PROMPT_VERSION,
  description: "Personalised, consultant-grade report prompt with onboarding context and priority/why fields.",
  buildSystem: () => SYSTEM,
  buildUser: (input) => buildReportMessages(input as unknown as ReportPromptInput).user,
});

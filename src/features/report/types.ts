import { z } from "zod";

/**
 * The Revenue Intelligence Report — the product.
 *
 * One schema powers three surfaces: the AI output (validated), the on-screen
 * report, and the PDF. The AI returns euro figures; we store/display cents.
 */

export const REPORT_CATEGORIES = [
  "conversion",
  "trust",
  "copywriting",
  "seo",
  "mobile",
  "speed",
  "email",
] as const;
export type ReportCategory = (typeof REPORT_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<ReportCategory, string> = {
  conversion: "Conversion",
  trust: "Trust & Credibility",
  copywriting: "Messaging",
  seo: "SEO & Discoverability",
  mobile: "Mobile Experience",
  speed: "Performance",
  email: "Email Capture",
};

const severityEnum = z.enum(["critical", "high", "medium"]);
const difficultyEnum = z.enum(["easy", "medium", "hard"]);
const actionEnum = z.enum(["fix", "generate", "create_flow", "review"]);

/** A single recommendation — the consultant-grade unit of value. */
const opportunitySchema = z.object({
  title: z.string(),
  category: z.enum(REPORT_CATEGORIES),
  whatToDo: z.string(),
  whyItMatters: z.string(),
  example: z.string(),
  difficulty: difficultyEnum,
  estimatedMinutes: z.number().int().min(5).max(20000),
  confidence: z.number().int().min(0).max(100),
  priority: z.number().int().min(1).max(5), // 1 = do this first
  monthlyLow: z.number().int().min(0),
  monthlyHigh: z.number().int().min(0),
  action: actionEnum,
});

/** Shape the model must return (euros as whole numbers). */
export const aiReportSchema = z.object({
  brandName: z.string(),
  executiveSummary: z.string(),
  overallScore: z.number().int().min(0).max(100),
  scores: z.array(
    z.object({
      category: z.enum(REPORT_CATEGORIES),
      score: z.number().int().min(0).max(100),
    }),
  ),
  criticalIssues: z.array(
    z.object({
      title: z.string(),
      category: z.enum(REPORT_CATEGORIES),
      severity: severityEnum,
      currentSituation: z.string(),
      problem: z.string(),
      whyItHurts: z.string(),
    }),
  ),
  quickWins: z.array(opportunitySchema),
  growthOpportunities: z.array(opportunitySchema),
  actionPlan: z.array(
    z.object({ title: z.string(), detail: z.string() }),
  ),
});

export type AiReport = z.infer<typeof aiReportSchema>;

/** Normalised report used by UI + PDF (euros converted to cents, ids added). */
export interface ReportIssue {
  id: string;
  title: string;
  category: ReportCategory;
  severity: "critical" | "high" | "medium";
  currentSituation: string;
  problem: string;
  whyItHurts: string;
}

export interface ReportOpportunity {
  id: string;
  title: string;
  category: ReportCategory;
  whatToDo: string;
  whyItMatters: string;
  example: string;
  difficulty: "easy" | "medium" | "hard";
  estimatedMinutes: number;
  confidence: number;
  priority: number;
  monthlyLowCents: number;
  monthlyHighCents: number;
  action: "fix" | "generate" | "create_flow" | "review";
}

/** Onboarding answers used to personalise every generation. */
export interface ReportContext {
  industry?: string | null;
  country?: string | null;
  averageOrderValueCents?: number | null;
  mainGoal?: string | null;
  biggestChallenge?: string | null;
}

export interface RevenueReport {
  url: string;
  brandName: string;
  overallScore: number;
  executiveSummary: string;
  totalMonthlyLowCents: number;
  totalMonthlyHighCents: number;
  scores: { category: ReportCategory; score: number }[];
  criticalIssues: ReportIssue[];
  quickWins: ReportOpportunity[];
  growthOpportunities: ReportOpportunity[];
  actionPlan: { title: string; detail: string }[];
}

let counter = 0;
function nextId(prefix: string) {
  counter += 1;
  return `${prefix}-${counter}`;
}

/** Convert validated AI output into the normalised report (euros → cents). */
export function normalizeReport(ai: AiReport, url: string): RevenueReport {
  const toCents = (euros: number) => Math.round(euros) * 100;

  const opportunities = [...ai.quickWins, ...ai.growthOpportunities];
  const totalMonthlyLowCents = opportunities.reduce((sum, o) => sum + toCents(o.monthlyLow), 0);
  const totalMonthlyHighCents = opportunities.reduce((sum, o) => sum + toCents(o.monthlyHigh), 0);

  const mapOpp = (o: AiReport["quickWins"][number]): ReportOpportunity => ({
    id: nextId("opp"),
    title: o.title,
    category: o.category,
    whatToDo: o.whatToDo,
    whyItMatters: o.whyItMatters,
    example: o.example,
    difficulty: o.difficulty,
    estimatedMinutes: o.estimatedMinutes,
    confidence: o.confidence,
    priority: o.priority,
    monthlyLowCents: toCents(o.monthlyLow),
    monthlyHighCents: toCents(o.monthlyHigh),
    action: o.action,
  });

  return {
    url,
    brandName: ai.brandName,
    overallScore: ai.overallScore,
    executiveSummary: ai.executiveSummary,
    totalMonthlyLowCents,
    totalMonthlyHighCents,
    scores: ai.scores,
    criticalIssues: ai.criticalIssues.map((i) => ({ ...i, id: nextId("issue") })),
    quickWins: ai.quickWins.map(mapOpp),
    growthOpportunities: ai.growthOpportunities.map(mapOpp),
    actionPlan: ai.actionPlan,
  };
}

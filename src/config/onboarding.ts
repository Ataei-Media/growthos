/**
 * The five onboarding questions asked before analysis. Kept deliberately short
 * (five quick taps) to protect conversion while personalising the report.
 */

export const INDUSTRIES = [
  "Fashion & Apparel",
  "Jewelry & Accessories",
  "Beauty & Cosmetics",
  "Health & Supplements",
  "Home & Living",
  "Electronics & Gadgets",
  "Food & Beverage",
  "Sports & Outdoors",
  "Other",
] as const;

export const COUNTRIES = [
  "Netherlands",
  "Belgium",
  "Germany",
  "United Kingdom",
  "France",
  "United States",
  "Other",
] as const;

/** AOV bands map to a representative value (cents) for the AI's revenue math. */
export const AOV_OPTIONS = [
  { label: "Under €25", cents: 1_500 },
  { label: "€25 – €50", cents: 3_800 },
  { label: "€50 – €100", cents: 7_500 },
  { label: "€100 – €250", cents: 17_500 },
  { label: "€250+", cents: 35_000 },
] as const;

export const GOALS = [
  "Increase conversion rate",
  "Drive more traffic",
  "Raise average order value",
  "Improve retention & repeat purchases",
  "Launch or scale a new store",
] as const;

export const CHALLENGES = [
  "Low conversion rate",
  "Not enough traffic",
  "Rising ad costs",
  "Cart abandonment",
  "Weak brand trust",
] as const;

export interface OnboardingAnswers {
  industry: string;
  country: string;
  averageOrderValueCents: number;
  mainGoal: string;
  biggestChallenge: string;
}

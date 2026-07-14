/** Presentation helpers shared by the report page and the PDF. */

const eur = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export function formatCents(cents: number): string {
  return eur.format(Math.round(cents / 100));
}

/** "€2,300–€4,900" style range from two cent values. */
export function formatRange(lowCents: number, highCents: number): string {
  if (lowCents === highCents) return formatCents(lowCents);
  return `${formatCents(lowCents)}–${formatCents(highCents)}`;
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.round((minutes / 60) * 10) / 10;
  if (hours < 8) return `${hours} hr${hours === 1 ? "" : "s"}`;
  const days = Math.round(hours / 8);
  return `${days} day${days === 1 ? "" : "s"}`;
}

export const DIFFICULTY_LABEL: Record<string, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Involved",
};

export const ACTION_LABEL: Record<string, string> = {
  fix: "Fix",
  generate: "Generate",
  create_flow: "Create flow",
  review: "Review",
};

/** Score → tone bucket used for color coding across surfaces. */
export function scoreTone(score: number): "strong" | "ok" | "weak" {
  if (score >= 75) return "strong";
  if (score >= 55) return "ok";
  return "weak";
}

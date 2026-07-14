import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind class names with correct precedence.
 * Used by every UI primitive to compose variant + consumer classes.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number as EUR currency (GrowthOS is EUR-priced). */
export function formatCurrency(amount: number, currency = "EUR", locale = "en-US") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Clamp a score into the 0-100 range used across audits. */
export function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

/** Absolute URL helper built on the configured app URL. */
export function absoluteUrl(path: string, baseUrl: string) {
  return new URL(path, baseUrl).toString();
}

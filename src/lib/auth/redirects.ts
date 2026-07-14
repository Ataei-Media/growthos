/** Only allow same-site absolute paths, preventing open-redirect abuse. */
export function sanitizeNext(next: string | null | undefined, fallback = "/dashboard"): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return fallback;
}

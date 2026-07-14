/**
 * Rate limiting foundation.
 *
 * A fixed-window in-memory limiter — correct and dependency-free for a single
 * instance. The `RateLimiter` shape is the seam: in production, swap this for a
 * distributed limiter (e.g. Upstash Redis) without touching call sites.
 */

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  /** Epoch ms when the window resets. */
  reset: number;
}

export interface RateLimiter {
  check(key: string): RateLimitResult;
}

type Bucket = { count: number; expiresAt: number };

const store = new Map<string, Bucket>();
let lastSweep = 0;

function sweep(now: number) {
  // Opportunistic cleanup so the map can't grow unbounded.
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, bucket] of store) {
    if (bucket.expiresAt < now) store.delete(key);
  }
}

/**
 * Allow `limit` requests per `windowMs` for a given key. Returns whether this
 * request is within budget along with the remaining allowance.
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const bucket = store.get(key);
  if (!bucket || bucket.expiresAt < now) {
    store.set(key, { count: 1, expiresAt: now + windowMs });
    return { success: true, limit, remaining: limit - 1, reset: now + windowMs };
  }

  bucket.count += 1;
  return {
    success: bucket.count <= limit,
    limit,
    remaining: Math.max(0, limit - bucket.count),
    reset: bucket.expiresAt,
  };
}

/** Named policies so limits live in one place. */
export const RATE_LIMITS = {
  authAttempt: { limit: 8, windowMs: 60_000 }, // per IP+identifier / minute
  passwordReset: { limit: 5, windowMs: 15 * 60_000 },
  magicLink: { limit: 5, windowMs: 15 * 60_000 },
} as const;

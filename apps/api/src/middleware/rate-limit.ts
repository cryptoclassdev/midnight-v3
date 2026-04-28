import type { Context, Next } from "hono";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const DEFAULT_WINDOW_MS = 60_000;
const DEFAULT_MAX_REQUESTS = 100;
const CLEANUP_INTERVAL_MS = 5 * 60_000;

const store = new Map<string, RateLimitEntry>();

// Periodic cleanup of expired entries
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}, CLEANUP_INTERVAL_MS);

function getClientIp(c: Context): string {
  return (
    c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ??
    c.req.header("cf-connecting-ip") ??
    c.req.header("x-real-ip") ??
    "unknown"
  );
}

export function rateLimit(options?: {
  windowMs?: number;
  max?: number;
  keyPrefix?: string;
  /**
   * Derive the rate-limit bucket identifier from the request. Return a value
   * (e.g. a wallet address) to scope the quota to that identity; return a
   * falsy value to fall back to client IP. Async-capable for handlers that
   * need to read the request body.
   */
  keyExtractor?: (c: Context) => string | undefined | Promise<string | undefined>;
}) {
  const windowMs = options?.windowMs ?? DEFAULT_WINDOW_MS;
  const max = options?.max ?? DEFAULT_MAX_REQUESTS;
  const prefix = options?.keyPrefix ?? "global";
  const keyExtractor = options?.keyExtractor;

  return async (c: Context, next: Next) => {
    const extracted = keyExtractor ? await keyExtractor(c) : undefined;
    const identity = extracted && extracted.length > 0 ? extracted : getClientIp(c);
    const key = `${prefix}:${identity}`;
    const now = Date.now();

    let entry = store.get(key);
    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + windowMs };
      store.set(key, entry);
    }

    entry.count += 1;

    c.header("X-RateLimit-Limit", String(max));
    c.header("X-RateLimit-Remaining", String(Math.max(0, max - entry.count)));
    c.header("X-RateLimit-Reset", String(Math.ceil(entry.resetAt / 1000)));

    if (entry.count > max) {
      return c.json(
        { error: "Too many requests. Please try again later." },
        429,
      );
    }

    await next();
  };
}

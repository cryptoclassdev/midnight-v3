// In-memory cache wrapper for Jupiter upstream calls.
//
// Layers, in order: (1) fresh-TTL cache, (2) in-flight dedup, (3) circuit
// breaker, (4) stale-while-error fallback. On loader failure, serves the last
// successful value if one exists — callers see cached data instead of 502s
// when Jupiter is flaky.
//
// Not shared across server instances. Each Railway dyno has its own cache.
// That's fine for our scale; we can swap in Redis later if we horizontally
// scale and cache coherence matters.

type Entry<T> = { value: T; fetchedAt: number };

export type LoadStatus = "hit" | "miss" | "stale" | "circuit";

export type LoadResult<T> = { value: T; status: LoadStatus };

export interface JupiterCacheOptions {
  maxEntries?: number;
  circuitFailureThreshold?: number;
  circuitWindowMs?: number;
  circuitCooldownMs?: number;
  now?: () => number;
}

const DEFAULT_MAX_ENTRIES = 1000;
const DEFAULT_CIRCUIT_FAILURES = 5;
const DEFAULT_CIRCUIT_WINDOW_MS = 10_000;
const DEFAULT_CIRCUIT_COOLDOWN_MS = 30_000;

export class JupiterCache {
  private readonly store = new Map<string, Entry<unknown>>();
  private readonly inFlight = new Map<string, Promise<unknown>>();
  private readonly failureTimestamps: number[] = [];
  private circuitOpenUntil = 0;

  private readonly maxEntries: number;
  private readonly circuitFailureThreshold: number;
  private readonly circuitWindowMs: number;
  private readonly circuitCooldownMs: number;
  private readonly now: () => number;

  constructor(opts: JupiterCacheOptions = {}) {
    this.maxEntries = opts.maxEntries ?? DEFAULT_MAX_ENTRIES;
    this.circuitFailureThreshold = opts.circuitFailureThreshold ?? DEFAULT_CIRCUIT_FAILURES;
    this.circuitWindowMs = opts.circuitWindowMs ?? DEFAULT_CIRCUIT_WINDOW_MS;
    this.circuitCooldownMs = opts.circuitCooldownMs ?? DEFAULT_CIRCUIT_COOLDOWN_MS;
    this.now = opts.now ?? Date.now;
  }

  async fetch<T>(
    key: string,
    freshTtlMs: number,
    loader: () => Promise<T>,
  ): Promise<LoadResult<T>> {
    const now = this.now();
    const entry = this.store.get(key) as Entry<T> | undefined;

    if (entry && now - entry.fetchedAt < freshTtlMs) {
      return { value: entry.value, status: "hit" };
    }

    if (now < this.circuitOpenUntil) {
      if (entry) return { value: entry.value, status: "circuit" };
      throw new CircuitOpenError(key);
    }

    const existing = this.inFlight.get(key) as Promise<T> | undefined;
    if (existing) {
      const value = await existing;
      return { value, status: "hit" };
    }

    const promise = loader();
    this.inFlight.set(key, promise);

    try {
      const value = await promise;
      this.set(key, value, now);
      this.resetFailures();
      return { value, status: "miss" };
    } catch (err) {
      this.recordFailure(now);
      if (entry) return { value: entry.value, status: "stale" };
      throw err;
    } finally {
      this.inFlight.delete(key);
    }
  }

  // Test helpers — not used by production code paths.
  _peek<T>(key: string): Entry<T> | undefined {
    return this.store.get(key) as Entry<T> | undefined;
  }

  _clear(): void {
    this.store.clear();
    this.inFlight.clear();
    this.failureTimestamps.length = 0;
    this.circuitOpenUntil = 0;
  }

  private set<T>(key: string, value: T, at: number): void {
    if (this.store.size >= this.maxEntries && !this.store.has(key)) {
      const firstKey = this.store.keys().next().value;
      if (firstKey !== undefined) this.store.delete(firstKey);
    }
    this.store.set(key, { value, fetchedAt: at });
  }

  private recordFailure(now: number): void {
    this.failureTimestamps.push(now);
    const cutoff = now - this.circuitWindowMs;
    while (this.failureTimestamps.length > 0 && this.failureTimestamps[0]! < cutoff) {
      this.failureTimestamps.shift();
    }
    if (this.failureTimestamps.length >= this.circuitFailureThreshold) {
      this.circuitOpenUntil = now + this.circuitCooldownMs;
      this.failureTimestamps.length = 0;
    }
  }

  private resetFailures(): void {
    this.failureTimestamps.length = 0;
  }
}

export class CircuitOpenError extends Error {
  constructor(public readonly key: string) {
    super(`Upstream circuit open for key "${key}" — no cached value available`);
    this.name = "CircuitOpenError";
  }
}

export const jupiterCache = new JupiterCache();

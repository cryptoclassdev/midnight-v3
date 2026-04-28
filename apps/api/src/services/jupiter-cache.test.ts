import { describe, expect, it, vi } from "vitest";
import { JupiterCache, CircuitOpenError } from "./jupiter-cache";

function makeClock(start = 1_000_000) {
  let now = start;
  return {
    now: () => now,
    advance: (ms: number) => {
      now += ms;
    },
  };
}

describe("JupiterCache", () => {
  it("returns fresh hits without invoking the loader", async () => {
    const clock = makeClock();
    const cache = new JupiterCache({ now: clock.now });
    const loader = vi.fn().mockResolvedValue("v1");

    const first = await cache.fetch("k", 1000, loader);
    const second = await cache.fetch("k", 1000, loader);

    expect(first).toEqual({ value: "v1", status: "miss" });
    expect(second).toEqual({ value: "v1", status: "hit" });
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it("refetches after TTL expires", async () => {
    const clock = makeClock();
    const cache = new JupiterCache({ now: clock.now });
    const loader = vi.fn().mockResolvedValueOnce("v1").mockResolvedValueOnce("v2");

    await cache.fetch("k", 1000, loader);
    clock.advance(1500);
    const result = await cache.fetch("k", 1000, loader);

    expect(result).toEqual({ value: "v2", status: "miss" });
    expect(loader).toHaveBeenCalledTimes(2);
  });

  it("coalesces concurrent misses into a single loader call", async () => {
    const cache = new JupiterCache();
    let resolve!: (v: string) => void;
    const loader = vi.fn().mockImplementation(
      () => new Promise<string>((r) => (resolve = r)),
    );

    const a = cache.fetch("k", 1000, loader);
    const b = cache.fetch("k", 1000, loader);
    resolve("shared");
    const [ar, br] = await Promise.all([a, b]);

    expect(loader).toHaveBeenCalledTimes(1);
    expect(ar.value).toBe("shared");
    expect(br.value).toBe("shared");
  });

  it("serves stale value when loader fails after TTL", async () => {
    const clock = makeClock();
    const cache = new JupiterCache({ now: clock.now });
    const loader = vi
      .fn()
      .mockResolvedValueOnce("v1")
      .mockRejectedValueOnce(new Error("jupiter 500"));

    await cache.fetch("k", 1000, loader);
    clock.advance(1500);
    const result = await cache.fetch("k", 1000, loader);

    expect(result).toEqual({ value: "v1", status: "stale" });
  });

  it("throws when loader fails with no cached fallback", async () => {
    const cache = new JupiterCache();
    const err = new Error("jupiter 500");
    const loader = vi.fn().mockRejectedValue(err);

    await expect(cache.fetch("k", 1000, loader)).rejects.toBe(err);
  });

  it("opens the circuit after threshold failures and serves stale", async () => {
    const clock = makeClock();
    const cache = new JupiterCache({
      now: clock.now,
      circuitFailureThreshold: 3,
      circuitWindowMs: 10_000,
      circuitCooldownMs: 30_000,
    });

    // Seed cache with a successful value
    const seedLoader = vi.fn().mockResolvedValue("seed");
    await cache.fetch("k", 100, seedLoader);
    clock.advance(200);

    // Three consecutive failures trip the breaker
    const failLoader = vi.fn().mockRejectedValue(new Error("boom"));
    await cache.fetch("k", 100, failLoader);
    await cache.fetch("k", 100, failLoader);
    await cache.fetch("k", 100, failLoader);

    // Next call should short-circuit; loader is NOT invoked
    const noopLoader = vi.fn().mockResolvedValue("should-not-run");
    const result = await cache.fetch("k", 100, noopLoader);

    expect(result).toEqual({ value: "seed", status: "circuit" });
    expect(noopLoader).not.toHaveBeenCalled();
  });

  it("closes the circuit after cooldown and retries the loader", async () => {
    const clock = makeClock();
    const cache = new JupiterCache({
      now: clock.now,
      circuitFailureThreshold: 2,
      circuitWindowMs: 10_000,
      circuitCooldownMs: 30_000,
    });

    await cache.fetch("k", 100, vi.fn().mockResolvedValue("seed"));
    clock.advance(200);
    await cache.fetch("k", 100, vi.fn().mockRejectedValue(new Error("x")));
    await cache.fetch("k", 100, vi.fn().mockRejectedValue(new Error("x")));

    clock.advance(31_000); // past cooldown

    const recovery = vi.fn().mockResolvedValue("recovered");
    const result = await cache.fetch("k", 100, recovery);

    expect(result).toEqual({ value: "recovered", status: "miss" });
    expect(recovery).toHaveBeenCalledTimes(1);
  });

  it("throws CircuitOpenError when circuit is open and no cache exists", async () => {
    const clock = makeClock();
    const cache = new JupiterCache({
      now: clock.now,
      circuitFailureThreshold: 2,
      circuitCooldownMs: 30_000,
    });

    const failing = vi.fn().mockRejectedValue(new Error("boom"));
    // Two failures on different keys — trips the breaker on the shared
    // failure counter
    await expect(cache.fetch("a", 100, failing)).rejects.toThrow();
    await expect(cache.fetch("b", 100, failing)).rejects.toThrow();

    // Circuit is now open; fresh key has no cache → must throw CircuitOpenError
    await expect(cache.fetch("c", 100, failing)).rejects.toBeInstanceOf(CircuitOpenError);
  });
});

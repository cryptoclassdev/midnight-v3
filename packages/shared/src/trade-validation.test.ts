import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  validateTradeAmount,
  parseTradeAmount,
  isBinaryMarket,
  formatResolutionCountdown,
} from "./trade-validation";

describe("validateTradeAmount", () => {
  it("returns valid for amounts >= $1", () => {
    expect(validateTradeAmount("5.00")).toEqual({ valid: true });
    expect(validateTradeAmount("1")).toEqual({ valid: true });
    expect(validateTradeAmount("1.00")).toEqual({ valid: true });
    expect(validateTradeAmount("1000000")).toEqual({ valid: true });
  });

  it("returns BELOW_MINIMUM for amounts < $1", () => {
    expect(validateTradeAmount("0.99")).toEqual({ valid: false, error: "BELOW_MINIMUM" });
    expect(validateTradeAmount("0.50")).toEqual({ valid: false, error: "BELOW_MINIMUM" });
    expect(validateTradeAmount("0")).toEqual({ valid: false, error: "BELOW_MINIMUM" });
  });

  it("returns INVALID_NUMBER for non-numeric input", () => {
    expect(validateTradeAmount("")).toEqual({ valid: false, error: "INVALID_NUMBER" });
    expect(validateTradeAmount("abc")).toEqual({ valid: false, error: "INVALID_NUMBER" });
    expect(validateTradeAmount("1.2.3")).toEqual({ valid: false, error: "INVALID_NUMBER" });
  });

  it("returns INVALID_NUMBER for negative amounts", () => {
    expect(validateTradeAmount("-5")).toEqual({ valid: false, error: "INVALID_NUMBER" });
  });
});

describe("parseTradeAmount", () => {
  it("returns number for valid strings", () => {
    expect(parseTradeAmount("5")).toBe(5);
    expect(parseTradeAmount("1.50")).toBe(1.5);
    expect(parseTradeAmount("0")).toBe(0);
  });

  it("returns null for invalid strings", () => {
    expect(parseTradeAmount("")).toBeNull();
    expect(parseTradeAmount("abc")).toBeNull();
    expect(parseTradeAmount("1.2.3")).toBeNull();
  });
});

describe("isBinaryMarket", () => {
  it("returns true for [Yes, No] arrays", () => {
    expect(isBinaryMarket(["Yes", "No"])).toBe(true);
    expect(isBinaryMarket(["yes", "no"])).toBe(true);
    expect(isBinaryMarket(["YES", "NO"])).toBe(true);
    expect(isBinaryMarket(["No", "Yes"])).toBe(true);
  });

  it("returns false for non-binary arrays", () => {
    expect(isBinaryMarket(["Yes", "No", "Maybe"])).toBe(false);
    expect(isBinaryMarket([])).toBe(false);
    expect(isBinaryMarket(["Yes"])).toBe(false);
    expect(isBinaryMarket(null)).toBe(false);
    expect(isBinaryMarket(undefined)).toBe(false);
    expect(isBinaryMarket("Yes")).toBe(false);
  });
});

describe("formatResolutionCountdown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-08T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns days countdown", () => {
    const threeDaysFromNow = Math.floor(Date.now() / 1000) + 3 * 86400;
    expect(formatResolutionCountdown(threeDaysFromNow)).toBe("Resolves in 3 days");
  });

  it("returns singular day", () => {
    const oneDayFromNow = Math.floor(Date.now() / 1000) + 86400;
    expect(formatResolutionCountdown(oneDayFromNow)).toBe("Resolves in 1 day");
  });

  it("returns hours countdown", () => {
    const fiveHoursFromNow = Math.floor(Date.now() / 1000) + 5 * 3600;
    expect(formatResolutionCountdown(fiveHoursFromNow)).toBe("Resolves in 5 hours");
  });

  it("returns minutes countdown", () => {
    const thirtyMinFromNow = Math.floor(Date.now() / 1000) + 30 * 60;
    expect(formatResolutionCountdown(thirtyMinFromNow)).toBe("Resolves in 30 min");
  });

  it("returns Resolves today for very short time", () => {
    const secondsFromNow = Math.floor(Date.now() / 1000) + 30;
    expect(formatResolutionCountdown(secondsFromNow)).toBe("Resolves today");
  });

  it("returns Resolved for past times", () => {
    const pastTime = Math.floor(Date.now() / 1000) - 3600;
    expect(formatResolutionCountdown(pastTime)).toBe("Resolved");
  });
});

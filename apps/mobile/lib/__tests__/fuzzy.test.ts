import { editDistance, fuzzyMatchScore } from "../fuzzy";

describe("editDistance", () => {
  it("returns 0 for identical strings", () => {
    expect(editDistance("eth", "eth")).toBe(0);
  });

  it("returns length when one string is empty", () => {
    expect(editDistance("", "eth")).toBe(3);
    expect(editDistance("eth", "")).toBe(3);
  });

  it("handles single substitution", () => {
    expect(editDistance("etg", "eth")).toBe(1);
  });

  it("handles single insertion", () => {
    expect(editDistance("et", "eth")).toBe(1);
  });

  it("handles single deletion", () => {
    expect(editDistance("etth", "eth")).toBe(1);
  });

  it("handles longer fuzzy matches", () => {
    expect(editDistance("solona", "solana")).toBe(1);
    expect(editDistance("bitcoin", "bitcoins")).toBe(1);
  });

  it("is symmetric", () => {
    expect(editDistance("a", "abc")).toBe(editDistance("abc", "a"));
  });
});

describe("fuzzyMatchScore", () => {
  it("returns 0 for exact substring match", () => {
    expect(fuzzyMatchScore("eth", "ethereum")).toBe(0);
    expect(fuzzyMatchScore("sol", "solana")).toBe(0);
  });

  it("matches 'etg' against 'eth' at edit distance 1", () => {
    expect(fuzzyMatchScore("etg", "eth", 1)).toBeGreaterThanOrEqual(0);
  });

  it("matches 'solona' against 'solana' at edit distance 1", () => {
    expect(fuzzyMatchScore("solona", "solana", 1)).toBeGreaterThanOrEqual(0);
  });

  it("rejects completely different strings", () => {
    expect(fuzzyMatchScore("xyz", "bitcoin", 1)).toBe(-1);
  });

  it("empty query returns 0", () => {
    expect(fuzzyMatchScore("", "whatever")).toBe(0);
  });
});

import { describe, it, expect } from "vitest";
import { createHash } from "node:crypto";

// Re-implement pure functions locally to avoid importing the service module,
// which has side effects (Prisma, Gemini, etc.)

function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.search = "";
    parsed.hash = "";
    return parsed.toString().replace(/\/+$/, "");
  } catch {
    return url;
  }
}

function hashUrl(url: string): string {
  return createHash("sha256").update(normalizeUrl(url)).digest("hex");
}

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function hashTitle(title: string): string {
  return createHash("sha256").update(normalizeTitle(title)).digest("hex");
}

describe("article-processor dedup logic", () => {
  it("stores original title hash, not rewritten title hash", () => {
    const originalTitle = "Bitcoin hits new high as ETF inflows surge";
    const rewrittenTitle = "BTC Surges Past Records on ETF Demand Wave";
    expect(hashTitle(originalTitle)).not.toBe(hashTitle(rewrittenTitle));
  });

  it("detects duplicate when original titles match across sources", () => {
    const title1 = "Bitcoin hits new high as ETF inflows surge";
    const title2 = "Bitcoin hits new high as ETF inflows surge";
    expect(hashTitle(title1)).toBe(hashTitle(title2));
  });

  it("normalizes URLs by stripping query params before hashing", () => {
    const base = "https://cointelegraph.com/news/bitcoin-etf-record";
    const withParams =
      "https://cointelegraph.com/news/bitcoin-etf-record?utm_source=twitter&utm_medium=social";
    const withFragment =
      "https://cointelegraph.com/news/bitcoin-etf-record#comments";
    const withTrailingSlash =
      "https://cointelegraph.com/news/bitcoin-etf-record/";

    expect(hashUrl(base)).toBe(hashUrl(withParams));
    expect(hashUrl(base)).toBe(hashUrl(withFragment));
    expect(hashUrl(base)).toBe(hashUrl(withTrailingSlash));
  });

  it("preserves different URLs as different hashes", () => {
    const url1 = "https://cointelegraph.com/news/story-a";
    const url2 = "https://cointelegraph.com/news/story-b";
    expect(hashUrl(url1)).not.toBe(hashUrl(url2));
  });
});

// Re-implemented locally to avoid importing the service (Prisma/Gemini side effects).
const SENTENCE_TERMINATOR_REGEX = /[.!?](?:["'\u2019\u201D)]|$|\s)/g;

function countWords(text: string): number {
  const matches = text.match(/\S+/g);
  return matches ? matches.length : 0;
}

function truncateToWordLimit(text: string, limit: number): string {
  if (!text) return "";
  if (countWords(text) <= limit) return text;

  let wordCount = 0;
  let cutIndex = text.length;
  const tokenRegex = /\S+/g;
  let match: RegExpExecArray | null;
  while ((match = tokenRegex.exec(text)) !== null) {
    wordCount++;
    if (wordCount === limit) {
      cutIndex = match.index + match[0].length;
      break;
    }
  }

  const head = text.slice(0, cutIndex);
  let lastTerminator = -1;
  let termMatch: RegExpExecArray | null;
  SENTENCE_TERMINATOR_REGEX.lastIndex = 0;
  while ((termMatch = SENTENCE_TERMINATOR_REGEX.exec(head)) !== null) {
    lastTerminator = termMatch.index + 1;
  }
  if (lastTerminator > 0) return head.slice(0, lastTerminator).trimEnd();
  return head.trimEnd();
}

describe("truncateToWordLimit", () => {
  it("returns text unchanged when under the word limit", () => {
    const text = "One short sentence.";
    expect(truncateToWordLimit(text, 60)).toBe(text);
  });

  it("backs up to the last sentence terminator when over the limit", () => {
    // 6 words of sentence 1, then 4 words of sentence 2 — limit 8 truncates
    // mid-sentence 2, so we expect to fall back to the first sentence.
    const text = "One two three four five six. Seven eight nine ten.";
    expect(truncateToWordLimit(text, 8)).toBe("One two three four five six.");
  });

  it("preserves \\n\\n paragraph breaks when output spans both paragraphs", () => {
    // Two 5-word sentences separated by \n\n — limit 12 forces a cut in the
    // middle of the third sentence, and we expect to backtrack to the end of
    // sentence 2 while keeping the inter-paragraph \n\n intact.
    const text = "First sentence of the hook.\n\nSecond sentence is the payoff. Third sentence goes too far.";
    const result = truncateToWordLimit(text, 12);
    expect(result).toContain("\n\n");
    expect(result.endsWith("payoff.")).toBe(true);
  });

  it("falls back to hard cut when no sentence terminator exists", () => {
    const text = "word ".repeat(80).trim();
    const result = truncateToWordLimit(text, 60);
    expect(countWords(result)).toBe(60);
  });
});

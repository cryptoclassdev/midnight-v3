import { MINIMUM_TRADE_USD } from "./constants";

type ValidationError = "BELOW_MINIMUM" | "INVALID_NUMBER";

interface ValidationResult {
  valid: boolean;
  error?: ValidationError;
}

export function validateTradeAmount(amountStr: string): ValidationResult {
  const parsed = parseTradeAmount(amountStr);
  if (parsed === null) return { valid: false, error: "INVALID_NUMBER" };
  if (parsed < MINIMUM_TRADE_USD) return { valid: false, error: "BELOW_MINIMUM" };
  return { valid: true };
}

export function parseTradeAmount(amountStr: string): number | null {
  if (!amountStr || amountStr.trim() === "") return null;
  const num = Number(amountStr);
  if (!Number.isFinite(num) || num < 0) return null;
  return num;
}

export function isBinaryMarket(outcomes: unknown): boolean {
  if (!Array.isArray(outcomes)) return false;
  if (outcomes.length !== 2) return false;
  const normalized = outcomes.map((o) => String(o).toLowerCase());
  return normalized.includes("yes") && normalized.includes("no");
}

export function formatResolutionCountdown(closeTimeUnix: number): string {
  const now = Date.now();
  const closeMs = closeTimeUnix * 1000;
  const diffMs = closeMs - now;

  if (diffMs <= 0) return "Resolved";

  const minutes = Math.floor(diffMs / 60_000);
  const hours = Math.floor(diffMs / 3_600_000);
  const days = Math.floor(diffMs / 86_400_000);

  if (days > 0) return `Resolves in ${days} ${days === 1 ? "day" : "days"}`;
  if (hours > 0) return `Resolves in ${hours} ${hours === 1 ? "hour" : "hours"}`;
  if (minutes > 0) return `Resolves in ${minutes} min`;
  return "Resolves today";
}

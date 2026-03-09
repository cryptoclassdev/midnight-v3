import type { PredictionPosition } from "./types";
import { microToUsd } from "./types";

export function getPositionValue(position: PredictionPosition): number {
  if (position.valueUsd != null) {
    return Number(position.valueUsd) / 1_000_000;
  }
  // Fallback: cost + pnl
  return microToUsd(position.costBasisUsd) + microToUsd(position.pnlUsd);
}

export function getPositionPnl(position: PredictionPosition): number {
  if (position.pnlUsdAfterFees != null) {
    return Number(position.pnlUsdAfterFees) / 1_000_000;
  }
  return microToUsd(position.pnlUsd);
}

export function getPositionPnlPercent(position: PredictionPosition): number {
  if (position.pnlUsdPercent != null) {
    return position.pnlUsdPercent;
  }
  const cost = microToUsd(position.costBasisUsd);
  if (cost <= 0) return 0;
  return (getPositionPnl(position) / cost) * 100;
}

export function getPositionAvgPrice(position: PredictionPosition): number | null {
  if (position.avgPriceUsd != null) {
    return Number(position.avgPriceUsd) / 1_000_000;
  }
  return null;
}

export function getPositionFees(position: PredictionPosition): number {
  if (position.feesPaidUsd != null) {
    return Number(position.feesPaidUsd) / 1_000_000;
  }
  return 0;
}

export interface PortfolioSummary {
  totalValue: number;
  totalPnl: number;
  totalFees: number;
  positionCount: number;
}

export function getPortfolioSummary(positions: PredictionPosition[]): PortfolioSummary {
  let totalValue = 0;
  let totalPnl = 0;
  let totalFees = 0;

  for (const pos of positions) {
    totalValue += getPositionValue(pos);
    totalPnl += getPositionPnl(pos);
    totalFees += getPositionFees(pos);
  }

  return {
    totalValue,
    totalPnl,
    totalFees,
    positionCount: positions.length,
  };
}

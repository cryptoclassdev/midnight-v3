import { describe, it, expect } from "vitest";
import {
  getPositionValue,
  getPositionPnl,
  getPositionPnlPercent,
  getPositionAvgPrice,
  getPositionFees,
  getPortfolioSummary,
} from "./position-helpers";
import type { PredictionPosition } from "./types";

function makePosition(overrides: Partial<PredictionPosition> = {}): PredictionPosition {
  return {
    pubkey: "7UX2i7SucgLMQcfZ75s3VXmZZY4YRUyJN9X1RgfMoDUi",
    ownerPubkey: "7UX2i7SucgLMQcfZ75s3VXmZZY4YRUyJN9X1RgfMoDUi",
    marketId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    isYes: true,
    contracts: "10",
    costBasisUsd: "5000000", // $5
    pnlUsd: "1000000", // $1
    claimable: false,
    valueUsd: null,
    avgPriceUsd: null,
    pnlUsdAfterFees: null,
    pnlUsdPercent: null,
    feesPaidUsd: null,
    realizedPnlUsd: null,
    payoutUsd: null,
    claimableAt: null,
    claimed: false,
    openedAt: null,
    ...overrides,
  };
}

describe("getPositionValue", () => {
  it("uses valueUsd from API when available", () => {
    const pos = makePosition({ valueUsd: "7000000" }); // $7
    expect(getPositionValue(pos)).toBe(7);
  });

  it("falls back to cost + pnl", () => {
    const pos = makePosition();
    expect(getPositionValue(pos)).toBe(6); // $5 + $1
  });
});

describe("getPositionPnl", () => {
  it("uses pnlUsdAfterFees when available", () => {
    const pos = makePosition({ pnlUsdAfterFees: "800000" }); // $0.80
    expect(getPositionPnl(pos)).toBeCloseTo(0.8);
  });

  it("falls back to pnlUsd", () => {
    const pos = makePosition();
    expect(getPositionPnl(pos)).toBe(1);
  });
});

describe("getPositionPnlPercent", () => {
  it("uses pnlUsdPercent from API", () => {
    const pos = makePosition({ pnlUsdPercent: 15.5 });
    expect(getPositionPnlPercent(pos)).toBe(15.5);
  });

  it("calculates from cost and pnl", () => {
    const pos = makePosition(); // cost $5, pnl $1 → 20%
    expect(getPositionPnlPercent(pos)).toBeCloseTo(20);
  });

  it("returns 0 when cost is 0", () => {
    const pos = makePosition({ costBasisUsd: "0" });
    expect(getPositionPnlPercent(pos)).toBe(0);
  });
});

describe("getPositionAvgPrice", () => {
  it("returns converted avgPriceUsd", () => {
    const pos = makePosition({ avgPriceUsd: "500000" }); // $0.50
    expect(getPositionAvgPrice(pos)).toBe(0.5);
  });

  it("returns null when not available", () => {
    const pos = makePosition();
    expect(getPositionAvgPrice(pos)).toBeNull();
  });
});

describe("getPositionFees", () => {
  it("returns converted feesPaidUsd", () => {
    const pos = makePosition({ feesPaidUsd: "200000" }); // $0.20
    expect(getPositionFees(pos)).toBeCloseTo(0.2);
  });

  it("returns 0 when not available", () => {
    const pos = makePosition();
    expect(getPositionFees(pos)).toBe(0);
  });
});

describe("getPortfolioSummary", () => {
  it("aggregates multiple positions", () => {
    const positions = [
      makePosition({ valueUsd: "7000000", pnlUsdAfterFees: "800000", feesPaidUsd: "200000" }),
      makePosition({ valueUsd: "3000000", pnlUsdAfterFees: "-500000", feesPaidUsd: "100000" }),
    ];
    const summary = getPortfolioSummary(positions);
    expect(summary.totalValue).toBe(10);
    expect(summary.totalPnl).toBeCloseTo(0.3);
    expect(summary.totalFees).toBeCloseTo(0.3);
    expect(summary.positionCount).toBe(2);
  });

  it("returns zeros for empty array", () => {
    const summary = getPortfolioSummary([]);
    expect(summary.totalValue).toBe(0);
    expect(summary.totalPnl).toBe(0);
    expect(summary.totalFees).toBe(0);
    expect(summary.positionCount).toBe(0);
  });
});

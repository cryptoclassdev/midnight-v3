import { microToUsd } from "@midnight/shared";

/**
 * ProfileView position splitting logic tests.
 *
 * Full component rendering requires extensive RN/Expo mocking.
 * These tests validate the filtering and computation logic extracted
 * from ProfileView to ensure correctness.
 */

const makePosition = (
  pubkey: string,
  marketStatus: string | undefined,
  costBasisUsd: number,
  pnlUsd: number,
) => ({
  pubkey,
  costBasisUsd,
  pnlUsd,
  market: marketStatus !== undefined ? { status: marketStatus } : undefined,
});

type Position = ReturnType<typeof makePosition>;

function splitPositions(positions: Position[]) {
  const openPositions = positions.filter(
    (p) => !p.market?.status || p.market.status === "open",
  );
  const closedPositions = positions.filter(
    (p) => p.market?.status === "closed" || p.market?.status === "cancelled",
  );
  return { openPositions, closedPositions };
}

function computeSummary(openPositions: Position[]) {
  const totalValue = openPositions.reduce(
    (sum, p) => sum + microToUsd(p.costBasisUsd) + microToUsd(p.pnlUsd),
    0,
  );
  const totalPnl = openPositions.reduce(
    (sum, p) => sum + microToUsd(p.pnlUsd),
    0,
  );
  return { totalValue, totalPnl };
}

describe("ProfileView position splitting", () => {
  const positions: Position[] = [
    makePosition("open1", "open", 5_000_000, 500_000),
    makePosition("open2", undefined, 3_000_000, -200_000),
    makePosition("closed1", "closed", 2_000_000, 1_000_000),
    makePosition("cancelled1", "cancelled", 1_000_000, -500_000),
  ];

  it("separates open positions from closed/cancelled", () => {
    const { openPositions, closedPositions } = splitPositions(positions);
    expect(openPositions.map((p) => p.pubkey)).toEqual(["open1", "open2"]);
    expect(closedPositions.map((p) => p.pubkey)).toEqual([
      "closed1",
      "cancelled1",
    ]);
  });

  it("treats positions with no market as open", () => {
    const { openPositions } = splitPositions([
      makePosition("noMarket", undefined, 1_000_000, 0),
    ]);
    expect(openPositions).toHaveLength(1);
    expect(openPositions[0].pubkey).toBe("noMarket");
  });

  it("computes summary from open positions only", () => {
    const { openPositions } = splitPositions(positions);
    const { totalValue, totalPnl } = computeSummary(openPositions);

    // open1: cost 5.00 + pnl 0.50 = 5.50
    // open2: cost 3.00 + pnl -0.20 = 2.80
    // total value = 8.30, total pnl = 0.30
    expect(totalValue).toBeCloseTo(8.3, 2);
    expect(totalPnl).toBeCloseTo(0.3, 2);
  });

  it("returns empty arrays when no positions exist", () => {
    const { openPositions, closedPositions } = splitPositions([]);
    expect(openPositions).toEqual([]);
    expect(closedPositions).toEqual([]);
  });

  it("counts history as orders plus closed positions", () => {
    const orders = [{ pubkey: "order1" }, { pubkey: "order2" }];
    const { closedPositions } = splitPositions(positions);
    const historyCount = orders.length + closedPositions.length;
    expect(historyCount).toBe(4);
  });
});

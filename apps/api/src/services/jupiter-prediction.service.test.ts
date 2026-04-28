import { beforeEach, describe, expect, it, vi } from "vitest";

const { findMany } = vi.hoisted(() => ({
  findMany: vi.fn(),
}));

vi.mock("@midnight/db", () => ({
  prisma: {
    predictionMarket: {
      findMany,
    },
  },
}));

vi.mock("./notification.service", () => ({
  sendSettlementNotification: vi.fn(),
}));

import { fetchLivePrices } from "./jupiter-prediction.service";

describe("fetchLivePrices", () => {
  beforeEach(() => {
    findMany.mockReset();
  });

  it("serves live prices from the DB snapshot without hitting Jupiter", async () => {
    findMany.mockResolvedValue([
      { id: "mkt-1", outcomePrices: { Yes: 0.61, No: 0.39 } },
      { id: "mkt-2", outcomePrices: { Yes: 0.22, No: 0.78 } },
    ]);

    const result = await fetchLivePrices(["mkt-1", "mkt-2", "missing"]);

    expect(findMany).toHaveBeenCalledWith({
      where: { id: { in: ["mkt-1", "mkt-2", "missing"] } },
      select: { id: true, outcomePrices: true },
    });
    expect(result).toEqual({
      "mkt-1": { Yes: 0.61, No: 0.39 },
      "mkt-2": { Yes: 0.22, No: 0.78 },
    });
  });
});

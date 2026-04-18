import { Hono } from "hono";
import { prisma } from "@midnight/db";

export const marketRoutes = new Hono();

marketRoutes.get("/market", async (c) => {
  const coins = await prisma.marketCoin.findMany({
    orderBy: { marketCap: "desc" },
  });

  return c.json({ data: coins });
});

import { Hono } from "hono";
import ky from "ky";

const JUPITER_API_URL = "https://api.jup.ag/prediction/v1";

const jupiter = ky.create({
  prefixUrl: JUPITER_API_URL,
  headers: { "x-api-key": process.env.JUPITER_API_KEY ?? "" },
  timeout: 10_000,
  retry: { limit: 1 },
});

export const predictionRoutes = new Hono();

// --- Events ---

predictionRoutes.get("/predictions/events", async (c) => {
  const params = Object.fromEntries(new URL(c.req.url).searchParams);
  const data = await jupiter.get("events", { searchParams: params }).json();
  return c.json(data);
});

predictionRoutes.get("/predictions/events/search", async (c) => {
  const params = Object.fromEntries(new URL(c.req.url).searchParams);
  const data = await jupiter.get("events/search", { searchParams: params }).json();
  return c.json(data);
});

predictionRoutes.get("/predictions/events/suggested/:pubkey", async (c) => {
  const { pubkey } = c.req.param();
  const params = Object.fromEntries(new URL(c.req.url).searchParams);
  const data = await jupiter.get(`events/suggested/${pubkey}`, { searchParams: params }).json();
  return c.json(data);
});

predictionRoutes.get("/predictions/events/:eventId/markets", async (c) => {
  const { eventId } = c.req.param();
  const params = Object.fromEntries(new URL(c.req.url).searchParams);
  const data = await jupiter.get(`events/${eventId}/markets`, { searchParams: params }).json();
  return c.json(data);
});

predictionRoutes.get("/predictions/events/:eventId", async (c) => {
  const { eventId } = c.req.param();
  const params = Object.fromEntries(new URL(c.req.url).searchParams);
  const data = await jupiter.get(`events/${eventId}`, { searchParams: params }).json();
  return c.json(data);
});

// --- Markets ---

predictionRoutes.get("/predictions/markets/:marketId", async (c) => {
  const { marketId } = c.req.param();
  const data = await jupiter.get(`markets/${marketId}`).json();
  return c.json(data);
});

predictionRoutes.get("/predictions/orderbook/:marketId", async (c) => {
  const { marketId } = c.req.param();
  const data = await jupiter.get(`orderbook/${marketId}`).json();
  return c.json(data);
});

// --- Trading Status ---

predictionRoutes.get("/predictions/trading-status", async (c) => {
  const data = await jupiter.get("trading-status").json();
  return c.json(data);
});

// --- Orders ---

predictionRoutes.post("/predictions/orders", async (c) => {
  const body = await c.req.json();
  const data = await jupiter.post("orders", { json: body }).json();
  return c.json(data);
});

predictionRoutes.get("/predictions/orders", async (c) => {
  const params = Object.fromEntries(new URL(c.req.url).searchParams);
  const data = await jupiter.get("orders", { searchParams: params }).json();
  return c.json(data);
});

predictionRoutes.get("/predictions/orders/status/:orderPubkey", async (c) => {
  const { orderPubkey } = c.req.param();
  const data = await jupiter.get(`orders/status/${orderPubkey}`).json();
  return c.json(data);
});

predictionRoutes.get("/predictions/orders/:orderPubkey", async (c) => {
  const { orderPubkey } = c.req.param();
  const data = await jupiter.get(`orders/${orderPubkey}`).json();
  return c.json(data);
});

// --- Positions ---

predictionRoutes.get("/predictions/positions", async (c) => {
  const params = Object.fromEntries(new URL(c.req.url).searchParams);
  const data = await jupiter.get("positions", { searchParams: params }).json();
  return c.json(data);
});

predictionRoutes.get("/predictions/positions/:positionPubkey", async (c) => {
  const { positionPubkey } = c.req.param();
  const data = await jupiter.get(`positions/${positionPubkey}`).json();
  return c.json(data);
});

predictionRoutes.delete("/predictions/positions/:positionPubkey", async (c) => {
  const { positionPubkey } = c.req.param();
  const body = await c.req.json();
  const data = await jupiter.delete(`positions/${positionPubkey}`, { json: body }).json();
  return c.json(data);
});

predictionRoutes.delete("/predictions/positions", async (c) => {
  const body = await c.req.json();
  const data = await jupiter.delete("positions", { json: body }).json();
  return c.json(data);
});

predictionRoutes.post("/predictions/positions/:positionPubkey/claim", async (c) => {
  const { positionPubkey } = c.req.param();
  const body = await c.req.json();
  const data = await jupiter.post(`positions/${positionPubkey}/claim`, { json: body }).json();
  return c.json(data);
});

// --- History ---

predictionRoutes.get("/predictions/history", async (c) => {
  const params = Object.fromEntries(new URL(c.req.url).searchParams);
  const data = await jupiter.get("history", { searchParams: params }).json();
  return c.json(data);
});

// --- Profiles ---

predictionRoutes.get("/predictions/profiles/:ownerPubkey/pnl-history", async (c) => {
  const { ownerPubkey } = c.req.param();
  const params = Object.fromEntries(new URL(c.req.url).searchParams);
  const data = await jupiter.get(`profiles/${ownerPubkey}/pnl-history`, { searchParams: params }).json();
  return c.json(data);
});

predictionRoutes.get("/predictions/profiles/:ownerPubkey", async (c) => {
  const { ownerPubkey } = c.req.param();
  const data = await jupiter.get(`profiles/${ownerPubkey}`).json();
  return c.json(data);
});

// --- Trades & Leaderboards ---

predictionRoutes.get("/predictions/trades", async (c) => {
  const data = await jupiter.get("trades").json();
  return c.json(data);
});

predictionRoutes.get("/predictions/leaderboards", async (c) => {
  const params = Object.fromEntries(new URL(c.req.url).searchParams);
  const data = await jupiter.get("leaderboards", { searchParams: params }).json();
  return c.json(data);
});

// --- Social (Follow) ---

predictionRoutes.post("/predictions/follow/:pubkey", async (c) => {
  const { pubkey } = c.req.param();
  const data = await jupiter.post(`follow/${pubkey}`).json();
  return c.json(data);
});

predictionRoutes.delete("/predictions/unfollow/:pubkey", async (c) => {
  const { pubkey } = c.req.param();
  const data = await jupiter.delete(`unfollow/${pubkey}`).json();
  return c.json(data);
});

predictionRoutes.get("/predictions/followers/:pubkey", async (c) => {
  const { pubkey } = c.req.param();
  const data = await jupiter.get(`followers/${pubkey}`).json();
  return c.json(data);
});

predictionRoutes.get("/predictions/following/:pubkey", async (c) => {
  const { pubkey } = c.req.param();
  const data = await jupiter.get(`following/${pubkey}`).json();
  return c.json(data);
});

// --- Vault ---

predictionRoutes.get("/predictions/vault-info", async (c) => {
  const data = await jupiter.get("vault-info").json();
  return c.json(data);
});

// --- Live prices (existing, kept) ---

predictionRoutes.get("/predictions/live", async (c) => {
  const idsParam = c.req.query("ids") ?? "";
  const marketIds = idsParam.split(",").filter(Boolean);
  if (marketIds.length === 0) return c.json({ data: {} });

  const results: Record<string, Record<string, number>> = {};
  await Promise.allSettled(
    marketIds.map(async (id) => {
      try {
        const market = await jupiter.get(`markets/${id}`).json<{
          pricing: { buyYesPriceUsd: number; buyNoPriceUsd: number };
        }>();
        results[id] = {
          Yes: Math.round((market.pricing.buyYesPriceUsd / 1_000_000) * 100) / 100,
          No: Math.round((market.pricing.buyNoPriceUsd / 1_000_000) * 100) / 100,
        };
      } catch { /* keep existing DB prices */ }
    }),
  );
  return c.json({ data: results });
});

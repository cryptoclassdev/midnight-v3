import ky from "ky";
import { prisma } from "@mintfeed/db";
import { TOP_COINS_COUNT } from "@mintfeed/shared";

const COINGECKO_API_URL =
  process.env.COINGECKO_API_URL ?? "https://api.coingecko.com/api/v3";

interface CoinGeckoMarket {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  image: string;
}

export async function fetchMarketData(): Promise<void> {
  console.log("[CoinGecko] Fetching market data...");

  try {
    const coins = await ky
      .get(`${COINGECKO_API_URL}/coins/markets`, {
        searchParams: {
          vs_currency: "usd",
          order: "market_cap_desc",
          per_page: TOP_COINS_COUNT,
          page: 1,
          sparkline: false,
        },
        timeout: 15_000,
        retry: { limit: 2 },
      })
      .json<CoinGeckoMarket[]>();

    for (const coin of coins) {
      await prisma.marketCoin.upsert({
        where: { id: coin.id },
        update: {
          currentPrice: coin.current_price,
          priceChange24h: coin.price_change_percentage_24h ?? 0,
          marketCap: coin.market_cap,
          imageUrl: coin.image,
        },
        create: {
          id: coin.id,
          symbol: coin.symbol,
          name: coin.name,
          currentPrice: coin.current_price,
          priceChange24h: coin.price_change_percentage_24h ?? 0,
          marketCap: coin.market_cap,
          imageUrl: coin.image,
        },
      });
    }

    console.log(`[CoinGecko] Updated ${coins.length} coins`);
  } catch (error) {
    console.error("[CoinGecko] Failed to fetch market data:", error);
  }
}

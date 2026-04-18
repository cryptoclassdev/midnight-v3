import { useQuery } from "@tanstack/react-query";
import { fetchMarket, fetchOrderbook } from "@/lib/prediction-client";
import type { PredictionMarketDetail, OrderbookData } from "@midnight/shared";

const MARKET_REFETCH_INTERVAL_MS = 15_000;
const ORDERBOOK_REFETCH_INTERVAL_MS = 10_000;

export function usePredictionMarketDetail(marketId: string | undefined) {
  return useQuery<PredictionMarketDetail>({
    queryKey: ["prediction-market", marketId],
    queryFn: () => fetchMarket(marketId!),
    enabled: !!marketId,
    refetchInterval: MARKET_REFETCH_INTERVAL_MS,
  });
}

export function usePredictionOrderbook(marketId: string | undefined) {
  return useQuery<OrderbookData>({
    queryKey: ["prediction-orderbook", marketId],
    queryFn: () => fetchOrderbook(marketId!),
    enabled: !!marketId,
    refetchInterval: ORDERBOOK_REFETCH_INTERVAL_MS,
  });
}

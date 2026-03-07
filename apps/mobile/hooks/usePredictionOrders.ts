import { useQuery } from "@tanstack/react-query";
import { fetchOrders } from "@/lib/prediction-client";
import type { JupiterPaginatedResponse, PredictionOrder } from "@mintfeed/shared";

const ORDERS_REFETCH_INTERVAL_MS = 30_000;

export function usePredictionOrders(ownerPubkey: string | undefined) {
  return useQuery<JupiterPaginatedResponse<PredictionOrder>>({
    queryKey: ["prediction-orders", ownerPubkey],
    queryFn: () => fetchOrders(ownerPubkey!),
    enabled: !!ownerPubkey,
    refetchInterval: ORDERS_REFETCH_INTERVAL_MS,
  });
}

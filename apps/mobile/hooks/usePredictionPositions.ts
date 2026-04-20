import { useQuery } from "@tanstack/react-query";
import { fetchPositions } from "@/lib/prediction-client";
import type { JupiterPaginatedResponse, PredictionPosition } from "@midnight/shared";

const POSITIONS_REFETCH_INTERVAL_MS = 30_000;

export function usePredictionPositions(ownerPubkey: string | undefined) {
  return useQuery<JupiterPaginatedResponse<PredictionPosition>>({
    queryKey: ["prediction-positions", ownerPubkey],
    queryFn: () => fetchPositions(ownerPubkey!),
    enabled: !!ownerPubkey,
    refetchInterval: POSITIONS_REFETCH_INTERVAL_MS,
  });
}

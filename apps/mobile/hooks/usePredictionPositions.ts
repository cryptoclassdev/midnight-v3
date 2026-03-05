import { useQuery } from "@tanstack/react-query";
import {
  fetchPositions,
  fetchPosition,
  fetchOrders,
  fetchHistory,
} from "@/lib/prediction-client";
import type {
  JupiterPaginatedResponse,
  PredictionPosition,
  PredictionOrder,
  HistoryEvent,
} from "@mintfeed/shared";

const POSITIONS_REFETCH_INTERVAL_MS = 30_000;

export function usePredictionPositions(ownerPubkey: string | undefined) {
  return useQuery<JupiterPaginatedResponse<PredictionPosition>>({
    queryKey: ["prediction-positions", ownerPubkey],
    queryFn: () => fetchPositions(ownerPubkey!),
    enabled: !!ownerPubkey,
    refetchInterval: POSITIONS_REFETCH_INTERVAL_MS,
  });
}

export function usePredictionPosition(positionPubkey: string | undefined) {
  return useQuery<PredictionPosition>({
    queryKey: ["prediction-position", positionPubkey],
    queryFn: () => fetchPosition(positionPubkey!),
    enabled: !!positionPubkey,
  });
}

export function usePredictionOrders(ownerPubkey: string | undefined) {
  return useQuery<JupiterPaginatedResponse<PredictionOrder>>({
    queryKey: ["prediction-orders", ownerPubkey],
    queryFn: () => fetchOrders(ownerPubkey!),
    enabled: !!ownerPubkey,
  });
}

export function usePredictionHistory(ownerPubkey: string | undefined) {
  return useQuery<JupiterPaginatedResponse<HistoryEvent>>({
    queryKey: ["prediction-history", ownerPubkey],
    queryFn: () => fetchHistory(ownerPubkey!),
    enabled: !!ownerPubkey,
  });
}

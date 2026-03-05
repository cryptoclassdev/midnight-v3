import { useQuery } from "@tanstack/react-query";
import { fetchProfile, fetchPnLHistory } from "@/lib/prediction-client";
import type { PredictionProfile, PnLHistoryEntry } from "@mintfeed/shared";

export function usePredictionProfile(ownerPubkey: string | undefined) {
  return useQuery<PredictionProfile>({
    queryKey: ["prediction-profile", ownerPubkey],
    queryFn: () => fetchProfile(ownerPubkey!),
    enabled: !!ownerPubkey,
  });
}

export function usePnLHistory(
  ownerPubkey: string | undefined,
  interval?: string,
) {
  return useQuery<{ data: PnLHistoryEntry[] }>({
    queryKey: ["prediction-pnl-history", ownerPubkey, interval],
    queryFn: () => fetchPnLHistory(ownerPubkey!, interval),
    enabled: !!ownerPubkey,
  });
}

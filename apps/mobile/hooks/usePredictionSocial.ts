import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchLeaderboard,
  fetchTrades,
  followUser,
  unfollowUser,
  fetchFollowers,
  fetchFollowing,
} from "@/lib/prediction-client";
import type { LeaderboardParams } from "@/lib/prediction-client";
import type {
  LeaderboardResponse,
  PredictionTrade,
  FollowListResponse,
} from "@mintfeed/shared";

const TRADES_REFETCH_INTERVAL_MS = 30_000;

export function useLeaderboard(params: LeaderboardParams = {}) {
  return useQuery<LeaderboardResponse>({
    queryKey: ["prediction-leaderboard", params],
    queryFn: () => fetchLeaderboard(params),
  });
}

export function usePredictionTrades() {
  return useQuery<{ data: PredictionTrade[] }>({
    queryKey: ["prediction-trades"],
    queryFn: fetchTrades,
    refetchInterval: TRADES_REFETCH_INTERVAL_MS,
  });
}

export function useFollowUser() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { pubkey: string }>({
    mutationFn: ({ pubkey }) => followUser(pubkey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prediction-followers"] });
      queryClient.invalidateQueries({ queryKey: ["prediction-following"] });
    },
  });
}

export function useUnfollowUser() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { pubkey: string }>({
    mutationFn: ({ pubkey }) => unfollowUser(pubkey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prediction-followers"] });
      queryClient.invalidateQueries({ queryKey: ["prediction-following"] });
    },
  });
}

export function useFollowers(pubkey: string | undefined) {
  return useQuery<FollowListResponse>({
    queryKey: ["prediction-followers", pubkey],
    queryFn: () => fetchFollowers(pubkey!),
    enabled: !!pubkey,
  });
}

export function useFollowing(pubkey: string | undefined) {
  return useQuery<FollowListResponse>({
    queryKey: ["prediction-following", pubkey],
    queryFn: () => fetchFollowing(pubkey!),
    enabled: !!pubkey,
  });
}

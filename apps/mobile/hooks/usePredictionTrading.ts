import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchTradingStatus,
  createOrder,
  closePosition,
  closeAllPositions,
  claimPosition,
} from "@/lib/prediction-client";
import { mwaSignAndSend } from "@/lib/wallet-adapter";
import { useAppStore } from "@/lib/store";
import type {
  CreateOrderRequest,
  CreateOrderResponse,
  ClaimPositionResponse,
  TradingStatus,
} from "@mintfeed/shared";

const TRADING_STATUS_REFETCH_INTERVAL_MS = 30_000;

export function useTradingStatus() {
  return useQuery<TradingStatus>({
    queryKey: ["prediction-trading-status"],
    queryFn: fetchTradingStatus,
    refetchInterval: TRADING_STATUS_REFETCH_INTERVAL_MS,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  const walletAddress = useAppStore((s) => s.walletAddress);

  return useMutation<string, Error, CreateOrderRequest>({
    mutationFn: async (request) => {
      const response: CreateOrderResponse = await createOrder(request);
      const txSignature = await mwaSignAndSend(response.transaction);
      return txSignature;
    },
    onSuccess: () => {
      if (walletAddress) {
        queryClient.invalidateQueries({ queryKey: ["prediction-positions", walletAddress] });
        queryClient.invalidateQueries({ queryKey: ["prediction-orders", walletAddress] });
      }
    },
  });
}

export function useClosePosition() {
  const queryClient = useQueryClient();
  const walletAddress = useAppStore((s) => s.walletAddress);

  return useMutation<
    string,
    Error,
    { positionPubkey: string; ownerPubkey: string }
  >({
    mutationFn: async ({ positionPubkey, ownerPubkey }) => {
      const response: CreateOrderResponse = await closePosition(
        positionPubkey,
        ownerPubkey,
      );
      const txSignature = await mwaSignAndSend(response.transaction);
      return txSignature;
    },
    onSuccess: () => {
      if (walletAddress) {
        queryClient.invalidateQueries({ queryKey: ["prediction-positions", walletAddress] });
        queryClient.invalidateQueries({ queryKey: ["prediction-orders", walletAddress] });
      }
    },
  });
}

export function useCloseAllPositions() {
  const queryClient = useQueryClient();
  const walletAddress = useAppStore((s) => s.walletAddress);

  return useMutation<string[], Error, { ownerPubkey: string }>({
    mutationFn: async ({ ownerPubkey }) => {
      const responses: CreateOrderResponse[] =
        await closeAllPositions(ownerPubkey);
      const signatures = await Promise.all(
        responses.map((r) => mwaSignAndSend(r.transaction)),
      );
      return signatures;
    },
    onSuccess: () => {
      if (walletAddress) {
        queryClient.invalidateQueries({ queryKey: ["prediction-positions", walletAddress] });
        queryClient.invalidateQueries({ queryKey: ["prediction-orders", walletAddress] });
      }
    },
  });
}

export function useClaimPosition() {
  const queryClient = useQueryClient();
  const walletAddress = useAppStore((s) => s.walletAddress);

  return useMutation<
    string,
    Error,
    { positionPubkey: string; ownerPubkey: string }
  >({
    mutationFn: async ({ positionPubkey, ownerPubkey }) => {
      const response: ClaimPositionResponse = await claimPosition(
        positionPubkey,
        ownerPubkey,
      );
      const txSignature = await mwaSignAndSend(response.transaction);
      return txSignature;
    },
    onSuccess: () => {
      if (walletAddress) {
        queryClient.invalidateQueries({ queryKey: ["prediction-positions", walletAddress] });
        queryClient.invalidateQueries({ queryKey: ["prediction-orders", walletAddress] });
      }
    },
  });
}

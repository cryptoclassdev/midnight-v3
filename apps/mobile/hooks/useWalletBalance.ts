import { useQuery } from "@tanstack/react-query";
import { fetchWalletBalances, type WalletBalances } from "@/lib/balance";

const BALANCE_REFETCH_INTERVAL_MS = 15_000;

export function useWalletBalance(walletAddress: string | null) {
  return useQuery<WalletBalances>({
    queryKey: ["wallet-balance", walletAddress],
    queryFn: () => fetchWalletBalances(walletAddress!),
    enabled: !!walletAddress,
    refetchInterval: BALANCE_REFETCH_INTERVAL_MS,
    staleTime: 0,
  });
}

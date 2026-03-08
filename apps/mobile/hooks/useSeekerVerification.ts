import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

interface SeekerStatus {
  isSeeker: boolean;
}

/**
 * Checks whether the connected wallet holds a Seeker Genesis Token (SGT).
 * Only runs when a wallet address is provided.
 */
export function useSeekerVerification(walletAddress: string | null) {
  return useQuery<SeekerStatus>({
    queryKey: ["seeker-verification", walletAddress],
    queryFn: async () => {
      const res = await api
        .post("api/v1/seeker/verify", { json: { address: walletAddress } })
        .json<SeekerStatus>();
      return res;
    },
    enabled: !!walletAddress,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
}

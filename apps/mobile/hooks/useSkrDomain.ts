import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

interface SkrResolveResponse {
  domain?: string;
  error?: string;
}

async function resolveAddressToSkr(
  address: string,
): Promise<string | null> {
  try {
    const response: SkrResolveResponse = await api
      .post("api/v1/skr/resolve-address", { json: { address } })
      .json();
    return response.domain ?? null;
  } catch {
    return null;
  }
}

/**
 * Resolve a wallet address to its .skr domain name.
 * Returns null if no domain found or on error.
 * Results are cached for 5 minutes.
 */
export function useSkrDomain(address: string | null) {
  return useQuery({
    queryKey: ["skr-domain", address],
    queryFn: () => resolveAddressToSkr(address!),
    enabled: !!address,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

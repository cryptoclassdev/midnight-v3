import { useQuery } from "@tanstack/react-query";

interface FearGreedData {
  value: number;
  classification: string;
  timestamp: string;
}

interface FearGreedApiResponse {
  data: {
    value: string;
    value_classification: string;
    timestamp: string;
  }[];
}

export function useFearGreed() {
  return useQuery({
    queryKey: ["fear-greed"],
    queryFn: async (): Promise<FearGreedData> => {
      const res = await fetch("https://api.alternative.me/fng/?limit=1");
      const json: FearGreedApiResponse = await res.json();
      const entry = json.data[0];
      return {
        value: parseInt(entry.value, 10),
        classification: entry.value_classification,
        timestamp: entry.timestamp,
      };
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  fetchEvents,
  fetchEvent,
  fetchEventMarkets,
  searchEvents,
} from "@/lib/prediction-client";
import type { FetchEventsParams } from "@/lib/prediction-client";
import type {
  JupiterPaginatedResponse,
  PredictionEvent,
  PredictionMarketDetail,
} from "@mintfeed/shared";

const DEFAULT_PAGE_SIZE = 20;

export function usePredictionEvents(params: FetchEventsParams = {}) {
  return useInfiniteQuery({
    queryKey: ["prediction-events", params],
    queryFn: async ({ pageParam = 0 }) => {
      return fetchEvents({
        ...params,
        start: pageParam,
        end: pageParam + DEFAULT_PAGE_SIZE,
      });
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage: JupiterPaginatedResponse<PredictionEvent>) =>
      lastPage.pagination.hasNext ? lastPage.pagination.end : undefined,
  });
}

export function usePredictionEventSearch(query: string) {
  return useQuery({
    queryKey: ["prediction-event-search", query],
    queryFn: () => searchEvents(query),
    enabled: query.length > 0,
  });
}

export function usePredictionEvent(eventId: string | undefined) {
  return useQuery({
    queryKey: ["prediction-event", eventId],
    queryFn: () => fetchEvent(eventId!, true),
    enabled: !!eventId,
  });
}

export function usePredictionEventMarkets(eventId: string | undefined) {
  return useQuery<JupiterPaginatedResponse<PredictionMarketDetail>>({
    queryKey: ["prediction-event-markets", eventId],
    queryFn: () => fetchEventMarkets(eventId!),
    enabled: !!eventId,
  });
}

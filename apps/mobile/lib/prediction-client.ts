import { api } from "@/lib/api-client";
import type {
  JupiterPaginatedResponse,
  PredictionEvent,
  PredictionMarketDetail,
  OrderbookData,
  TradingStatus,
  CreateOrderRequest,
  CreateOrderResponse,
  ClaimPositionResponse,
  PredictionOrder,
  PredictionOrderStatus,
  PredictionPosition,
  HistoryEvent,
  PredictionProfile,
  PnLHistoryEntry,
  PredictionTrade,
  LeaderboardResponse,
  FollowListResponse,
  PredictionCategory,
} from "@mintfeed/shared";

const BASE = "api/v1/predictions";

// --- Events ---

export interface FetchEventsParams {
  category?: PredictionCategory;
  filter?: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  start?: number;
  end?: number;
  includeMarkets?: boolean;
}

export function fetchEvents(
  params: FetchEventsParams = {},
): Promise<JupiterPaginatedResponse<PredictionEvent>> {
  const sp: Record<string, string> = {};
  if (params.category && params.category !== "all") sp.category = params.category;
  if (params.filter) sp.filter = params.filter;
  if (params.sortBy) sp.sortBy = params.sortBy;
  if (params.sortDirection) sp.sortDirection = params.sortDirection;
  if (params.start !== undefined) sp.start = String(params.start);
  if (params.end !== undefined) sp.end = String(params.end);
  if (params.includeMarkets) sp.includeMarkets = "true";
  return api.get(`${BASE}/events`, { searchParams: sp }).json();
}

export function searchEvents(
  query: string,
  limit?: number,
): Promise<{ data: PredictionEvent[] }> {
  const sp: Record<string, string> = { query };
  if (limit !== undefined) sp.limit = String(limit);
  return api.get(`${BASE}/events/search`, { searchParams: sp }).json();
}

export function fetchEvent(
  eventId: string,
  includeMarkets = true,
): Promise<PredictionEvent> {
  const sp: Record<string, string> = {};
  if (includeMarkets) sp.includeMarkets = "true";
  return api.get(`${BASE}/events/${eventId}`, { searchParams: sp }).json();
}

export function fetchEventMarkets(
  eventId: string,
): Promise<JupiterPaginatedResponse<PredictionMarketDetail>> {
  return api.get(`${BASE}/events/${eventId}/markets`).json();
}

export function fetchSuggestedEvents(
  pubkey: string,
): Promise<{ data: PredictionEvent[] }> {
  return api.get(`${BASE}/events/suggested/${pubkey}`).json();
}

// --- Markets ---

export function fetchMarket(marketId: string): Promise<PredictionMarketDetail> {
  return api.get(`${BASE}/markets/${marketId}`).json();
}

export function fetchOrderbook(marketId: string): Promise<OrderbookData> {
  return api.get(`${BASE}/orderbook/${marketId}`).json();
}

// --- Trading ---

export function fetchTradingStatus(): Promise<TradingStatus> {
  return api.get(`${BASE}/trading-status`).json();
}

export function createOrder(body: CreateOrderRequest): Promise<CreateOrderResponse> {
  return api.post(`${BASE}/orders`, { json: body }).json();
}

// --- Orders ---

export function fetchOrders(
  ownerPubkey: string,
): Promise<JupiterPaginatedResponse<PredictionOrder>> {
  return api.get(`${BASE}/orders`, { searchParams: { ownerPubkey } }).json();
}

export function fetchOrder(orderPubkey: string): Promise<PredictionOrder> {
  return api.get(`${BASE}/orders/${orderPubkey}`).json();
}

export function fetchOrderStatus(orderPubkey: string): Promise<PredictionOrderStatus> {
  return api.get(`${BASE}/orders/status/${orderPubkey}`).json();
}

// --- Positions ---

export function fetchPositions(
  ownerPubkey: string,
): Promise<JupiterPaginatedResponse<PredictionPosition>> {
  return api.get(`${BASE}/positions`, { searchParams: { ownerPubkey } }).json();
}

export function fetchPosition(positionPubkey: string): Promise<PredictionPosition> {
  return api.get(`${BASE}/positions/${positionPubkey}`).json();
}

export function closePosition(
  positionPubkey: string,
  ownerPubkey: string,
): Promise<CreateOrderResponse> {
  return api.delete(`${BASE}/positions/${positionPubkey}`, { json: { ownerPubkey } }).json();
}

export function closeAllPositions(ownerPubkey: string): Promise<CreateOrderResponse[]> {
  return api.delete(`${BASE}/positions`, { json: { ownerPubkey } }).json();
}

export function claimPosition(
  positionPubkey: string,
  ownerPubkey: string,
): Promise<ClaimPositionResponse> {
  return api.post(`${BASE}/positions/${positionPubkey}/claim`, { json: { ownerPubkey } }).json();
}

// --- History ---

export function fetchHistory(
  ownerPubkey: string,
): Promise<JupiterPaginatedResponse<HistoryEvent>> {
  return api.get(`${BASE}/history`, { searchParams: { ownerPubkey } }).json();
}

// --- Profile ---

export function fetchProfile(ownerPubkey: string): Promise<PredictionProfile> {
  return api.get(`${BASE}/profiles/${ownerPubkey}`).json();
}

export function fetchPnLHistory(
  ownerPubkey: string,
  interval?: string,
  count?: number,
): Promise<{ data: PnLHistoryEntry[] }> {
  const sp: Record<string, string> = {};
  if (interval) sp.interval = interval;
  if (count !== undefined) sp.count = String(count);
  return api.get(`${BASE}/profiles/${ownerPubkey}/pnl-history`, { searchParams: sp }).json();
}

// --- Social ---

export function fetchTrades(): Promise<{ data: PredictionTrade[] }> {
  return api.get(`${BASE}/trades`).json();
}

export interface LeaderboardParams {
  period?: string;
  metric?: string;
  limit?: number;
}

export function fetchLeaderboard(params: LeaderboardParams = {}): Promise<LeaderboardResponse> {
  const sp: Record<string, string> = {};
  if (params.period) sp.period = params.period;
  if (params.metric) sp.metric = params.metric;
  if (params.limit !== undefined) sp.limit = String(params.limit);
  return api.get(`${BASE}/leaderboards`, { searchParams: sp }).json();
}

export function followUser(pubkey: string): Promise<void> {
  return api.post(`${BASE}/follow/${pubkey}`).json();
}

export function unfollowUser(pubkey: string): Promise<void> {
  return api.delete(`${BASE}/unfollow/${pubkey}`).json();
}

export function fetchFollowers(pubkey: string): Promise<FollowListResponse> {
  return api.get(`${BASE}/followers/${pubkey}`).json();
}

export function fetchFollowing(pubkey: string): Promise<FollowListResponse> {
  return api.get(`${BASE}/following/${pubkey}`).json();
}

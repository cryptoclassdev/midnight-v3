export enum Category {
  CRYPTO = "CRYPTO",
  AI = "AI",
}

export interface Article {
  id: string;
  sourceUrl: string;
  sourceName: string;
  category: Category;
  title: string;
  summary: string;
  originalTitle: string;
  imageUrl: string | null;
  imageBlurhash: string | null;
  publishedAt: string;
  createdAt: string;
  predictionMarkets: PredictionMarket[];
}

export interface MarketCoin {
  id: string;
  symbol: string;
  name: string;
  currentPrice: number;
  priceChange24h: number;
  marketCap: number;
  imageUrl: string | null;
}

export interface FeedSource {
  url: string;
  name: string;
  category: Category;
  isActive: boolean;
  lastFetchAt: string | null;
}

export interface PredictionMarket {
  id: string;           // Jupiter marketId (UUID)
  question: string;     // Event title
  outcomePrices: Record<string, number>;  // { "Yes": 0.73, "No": 0.27 }
  marketUrl: string;    // Jupiter prediction page URL
}

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface FeedQueryParams {
  category?: "crypto" | "ai" | "all";
  cursor?: string;
  limit?: number;
}

// --- Jupiter Prediction Markets (Trading) ---

export const PREDICTION_CATEGORIES = [
  "all", "crypto", "sports", "politics", "esports", "culture", "economics", "tech",
] as const;
export type PredictionCategory = (typeof PREDICTION_CATEGORIES)[number];

export const MICRO_USD = 1_000_000;
export const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

export function microToUsd(micro: number | string): number {
  return Number(micro) / MICRO_USD;
}

export function usdToMicro(usd: number): string {
  return Math.round(usd * MICRO_USD).toString();
}

export interface JupiterPagination {
  start: number;
  end: number;
  total: number;
  hasNext: boolean;
}

export interface JupiterPaginatedResponse<T> {
  data: T[];
  pagination: JupiterPagination;
}

export interface PredictionEventMetadata {
  title: string;
  imageUrl: string | null;
  closeTime: string | null;
  rulesPdf?: string;
}

export interface PredictionEvent {
  eventId: string;
  isActive: boolean;
  isLive: boolean;
  category: string | null;
  subcategory: string | null;
  volumeUsd: string; // micro-USD as string
  metadata: PredictionEventMetadata;
  markets?: PredictionMarketDetail[];
  beginAt?: string;
}

export interface PredictionMarketPricing {
  buyYesPriceUsd: number;  // micro-USD
  buyNoPriceUsd: number;
  sellYesPriceUsd: number;
  sellNoPriceUsd: number;
  volume: number;
}

export interface PredictionMarketDetail {
  marketId: string;
  status: "open" | "closed" | "cancelled";
  result: string | null;
  openTime: number;
  closeTime: number;
  resolveAt: number | null;
  metadata: {
    title: string;
    rulesPrimary?: string;
  };
  pricing: PredictionMarketPricing;
}

export interface OrderbookData {
  yes: [number, number][];
  no: [number, number][];
  yes_dollars: [string, number][];
  no_dollars: [string, number][];
}

export interface CreateOrderRequest {
  ownerPubkey: string;
  marketId?: string;
  positionPubkey?: string;
  isYes: boolean;
  isBuy: boolean;
  contracts?: string;
  depositAmount?: string;
  depositMint?: string;
}

export interface CreateOrderResponse {
  transaction: string; // base64-encoded unsigned tx
  txMeta: {
    blockhash: string;
    lastValidBlockHeight: number;
  };
  externalOrderId?: string;
  order: Record<string, unknown>;
}

export interface ClaimPositionResponse {
  transaction: string;
  txMeta: {
    blockhash: string;
    lastValidBlockHeight: number;
  };
}

export interface PredictionPosition {
  pubkey: string;
  ownerPubkey: string;
  marketId: string;
  isYes: boolean;
  contracts: string;
  costBasisUsd: string;
  pnlUsd: string;
  claimable: boolean;
  market?: {
    title: string;
    status: string;
    result: string | null;
    pricing?: PredictionMarketPricing;
  };
}

export interface PredictionOrder {
  pubkey: string;
  ownerPubkey: string;
  marketId: string;
  isYes: boolean;
  isBuy: boolean;
  contracts: string;
  priceUsd: string;
  status: string;
}

export interface PredictionOrderStatus {
  pubkey: string;
  status: string;
  events: Array<{
    type: string;
    timestamp: string;
    details: Record<string, unknown>;
  }>;
}

export interface PredictionProfile {
  ownerPubkey: string;
  realizedPnl: string;
  volume: string;
  predictionsCount: number;
  winRate: number;
  portfolioValue: string;
}

export interface PnLHistoryEntry {
  timestamp: string;
  realizedPnl: string;
}

export interface PredictionTrade {
  id: string;
  traderPubkey: string;
  marketId: string;
  action: "buy" | "sell";
  side: "yes" | "no";
  price: string;
  amountUsd: string;
  timestamp: string;
  market?: { title: string };
}

export interface LeaderboardEntry {
  rank: number;
  ownerPubkey: string;
  pnl: string;
  volume: string;
  winRate: number;
  predictionsCount: number;
}

export interface LeaderboardResponse {
  data: LeaderboardEntry[];
  summary: Record<string, unknown>;
}

export interface HistoryEvent {
  id: number;
  type: string;
  positionPubkey: string;
  ownerPubkey: string;
  details: Record<string, unknown>;
  timestamp: string;
}

export interface TradingStatus {
  trading_active: boolean;
}

export interface FollowUser {
  pubkey: string;
}

export interface FollowListResponse {
  data: FollowUser[];
}

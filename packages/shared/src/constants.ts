export const API_VERSION = "v1";

export const DEFAULT_PAGE_SIZE = 20;

export const ARTICLE_SUMMARY_WORD_LIMIT = 60;

export const ARTICLE_TITLE_MAX_LENGTH = 80;

export const ARTICLE_FETCH_INTERVAL_MINUTES = 15;

export const MARKET_FETCH_INTERVAL_MINUTES = 5;

export const TOP_COINS_COUNT = 20;

export const CATEGORIES = ["crypto", "ai", "all"] as const;

export const CategoryLabel: Record<(typeof CATEGORIES)[number], string> = {
  crypto: "Crypto",
  ai: "AI",
  all: "All",
};

export const PREDICTION_EVENT_CATEGORIES = [
  "all", "crypto", "sports", "politics", "esports", "culture", "economics", "tech",
] as const;

export const PredictionCategoryLabel: Record<
  (typeof PREDICTION_EVENT_CATEGORIES)[number],
  string
> = {
  all: "All",
  crypto: "Crypto",
  sports: "Sports",
  politics: "Politics",
  esports: "Esports",
  culture: "Culture",
  economics: "Economics",
  tech: "Tech",
};

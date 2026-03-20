import ky from "ky";
import { prisma } from "@mintfeed/db";
import type { Category, TwitterSourceTier } from "@mintfeed/db";
import type { ParsedFeedItem } from "./rss-fetcher.service";
import { extractOgImage } from "./og-image.service";

const TWITTER_API = "https://api.twitter.com/2";

interface TweetMedia {
  type: string;
  url?: string;
  preview_image_url?: string;
}

interface TweetPublicMetrics {
  like_count: number;
  retweet_count: number;
}

interface Tweet {
  id: string;
  text: string;
  author_id: string;
  created_at: string;
  public_metrics: TweetPublicMetrics;
  referenced_tweets?: { type: string; id: string }[];
  entities?: {
    urls?: { expanded_url: string; unwound_url?: string }[];
    cashtags?: { tag: string }[];
  };
  attachments?: { media_keys?: string[] };
  in_reply_to_user_id?: string;
}

interface TwitterTimelineResponse {
  data?: Tweet[];
  includes?: { media?: (TweetMedia & { media_key: string })[] };
  meta?: { newest_id?: string; result_count?: number };
}

function getApi() {
  const token = process.env.TWITTER_BEARER_TOKEN;
  if (!token) throw new Error("TWITTER_BEARER_TOKEN not set");

  return ky.create({
    prefixUrl: TWITTER_API,
    timeout: 15_000,
    headers: { Authorization: `Bearer ${token}` },
  });
}

/** Count cashtags in tweet text */
function countCashtags(tweet: Tweet): number {
  return tweet.entities?.cashtags?.length ?? 0;
}

/** Check if tweet is a pure retweet (no commentary) */
function isPureRetweet(tweet: Tweet): boolean {
  return (
    tweet.referenced_tweets?.some((ref) => ref.type === "retweeted") === true &&
    tweet.text.startsWith("RT @")
  );
}

/** Check if tweet is a reply to someone else */
function isReplyToOther(tweet: Tweet): boolean {
  if (!tweet.in_reply_to_user_id) return false;
  return tweet.in_reply_to_user_id !== tweet.author_id;
}

/** Check if tweet meets engagement threshold for TIER_2 */
function meetsEngagementThreshold(tweet: Tweet): boolean {
  const metrics = tweet.public_metrics;
  return metrics.like_count >= 10 || metrics.retweet_count >= 5;
}

/** Extract the best image URL from a tweet */
async function extractTweetImage(
  tweet: Tweet,
  mediaMap: Map<string, TweetMedia>,
): Promise<string | null> {
  // 1. If tweet has a URL, try og:image
  const urls = tweet.entities?.urls;
  if (urls?.length) {
    const externalUrl = urls.find(
      (u) =>
        !u.expanded_url.includes("twitter.com") &&
        !u.expanded_url.includes("x.com"),
    );
    if (externalUrl) {
      const ogImage = await extractOgImage(
        externalUrl.unwound_url ?? externalUrl.expanded_url,
      );
      if (ogImage) return ogImage;
    }
  }

  // 2. Attached media
  const mediaKeys = tweet.attachments?.media_keys;
  if (mediaKeys?.length) {
    for (const key of mediaKeys) {
      const media = mediaMap.get(key);
      if (media) {
        if (media.url) return media.url;
        if (media.preview_image_url) return media.preview_image_url;
      }
    }
  }

  // 3. Fallback
  return null;
}

/** Clean tweet text: remove t.co links */
function cleanTweetText(text: string): string {
  return text.replace(/https?:\/\/t\.co\/\w+/g, "").trim();
}

async function fetchUserTimeline(
  api: ReturnType<typeof getApi>,
  userId: string,
  handle: string,
  tier: TwitterSourceTier,
  category: Category,
): Promise<ParsedFeedItem[]> {
  try {
    const response = await api
      .get(`users/${userId}/tweets`, {
        searchParams: {
          max_results: "20",
          "tweet.fields": "created_at,public_metrics,referenced_tweets,entities,attachments,in_reply_to_user_id,author_id",
          expansions: "attachments.media_keys",
          "media.fields": "url,preview_image_url,type",
        },
      })
      .json<TwitterTimelineResponse>();

    if (!response.data?.length) return [];

    const mediaMap = new Map<string, TweetMedia>();
    for (const media of response.includes?.media ?? []) {
      mediaMap.set(media.media_key, media);
    }

    const items: ParsedFeedItem[] = [];

    for (const tweet of response.data) {
      // Filter: skip pure retweets
      if (isPureRetweet(tweet)) continue;
      // Filter: skip replies to others
      if (isReplyToOther(tweet)) continue;
      // Filter: skip shill tweets (>2 cashtags)
      if (countCashtags(tweet) > 2) continue;
      // Filter: TIER_2 engagement threshold
      if (tier === "TIER_2" && !meetsEngagementThreshold(tweet)) continue;
      // Filter: TIER_3 excluded (background context only — not surfaced in feed)
      if (tier === "TIER_3") continue;

      const cleanText = cleanTweetText(tweet.text);
      if (!cleanText.trim()) continue;

      const imageUrl = await extractTweetImage(tweet, mediaMap);

      items.push({
        title: cleanText.slice(0, 120) + (cleanText.length > 120 ? "..." : ""),
        link: `https://x.com/${handle}/status/${tweet.id}`,
        content: cleanText,
        pubDate: tweet.created_at,
        imageUrl,
        sourceName: `@${handle}`,
        category,
      });
    }

    return items;
  } catch (error) {
    console.error(`[TwitterFetcher] Failed to fetch timeline for @${handle}:`, error);
    return [];
  }
}

/** Resolve Twitter handle → user ID via API */
async function resolveUserId(
  api: ReturnType<typeof getApi>,
  handle: string,
): Promise<string | null> {
  try {
    const response = await api
      .get(`users/by/username/${handle}`)
      .json<{ data?: { id: string } }>();
    return response.data?.id ?? null;
  } catch (error) {
    console.error(`[TwitterFetcher] Failed to resolve @${handle}:`, error);
    return null;
  }
}

export async function fetchAllTwitterFeeds(): Promise<ParsedFeedItem[]> {
  const api = getApi();

  const sources = await prisma.twitterSource.findMany({
    where: { isActive: true },
  });

  if (!sources.length) {
    console.log("[TwitterFetcher] No active Twitter sources found");
    return [];
  }

  const results: ParsedFeedItem[] = [];

  // Process sources sequentially to respect rate limits
  for (const source of sources) {
    // Use cached userId if available to avoid extra API calls each run
    let userId = (source as typeof source & { userId?: string | null }).userId ?? null;
    if (!userId) {
      userId = await resolveUserId(api, source.handle);
      if (!userId) continue;
      await prisma.twitterSource.update({
        where: { id: source.id },
        data: { userId },
      }).catch((err) => {
        console.error(`[TwitterFetcher] Failed to cache userId for @${source.handle}:`, err);
      });
    }

    const items = await fetchUserTimeline(
      api,
      userId,
      source.handle,
      source.tier,
      source.category,
    );

    results.push(...items);

    // Update lastFetchAt
    await prisma.twitterSource.update({
      where: { id: source.id },
      data: { lastFetchAt: new Date() },
    }).catch((err) => {
      console.error(`[TwitterFetcher] Failed to update lastFetchAt for @${source.handle}:`, err);
    });
  }

  return results;
}

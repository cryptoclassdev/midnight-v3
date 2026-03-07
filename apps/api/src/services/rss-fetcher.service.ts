import Parser from "rss-parser";
import { prisma } from "@mintfeed/db";
import type { Category } from "@mintfeed/db";

const parser = new Parser({
  timeout: 10_000,
  headers: {
    "User-Agent": "Midnight/1.0",
  },
});

export interface ParsedFeedItem {
  title: string;
  link: string;
  content: string;
  pubDate: string;
  imageUrl: string | null;
  sourceName: string;
  category: Category;
}

function extractImageUrl(item: Parser.Item): string | null {
  const enclosure = item.enclosure?.url;
  if (enclosure) return enclosure;

  const mediaContent = (item as Record<string, unknown>)["media:content"] as
    | { $?: { url?: string } }
    | undefined;
  if (mediaContent?.$?.url) return mediaContent.$.url;

  const contentMatch = item.content?.match(/<img[^>]+src="([^"]+)"/);
  if (contentMatch?.[1]) return contentMatch[1];

  return null;
}

export async function fetchAllFeeds(): Promise<ParsedFeedItem[]> {
  const sources = await prisma.feedSource.findMany({
    where: { isActive: true },
  });

  const results: ParsedFeedItem[] = [];

  const feedPromises = sources.map(async (source) => {
    try {
      const feed = await parser.parseURL(source.url);

      const items: ParsedFeedItem[] = (feed.items ?? [])
        .filter((item) => {
          // Filter out non-English Cointelegraph links (es.cointelegraph.com, etc.)
          if (item.link && /^https?:\/\/[a-z]{2}\.cointelegraph\./i.test(item.link)) {
            return false;
          }
          return true;
        })
        .map((item) => ({
          title: item.title ?? "Untitled",
          link: item.link ?? "",
          content: item.contentSnippet ?? item.content ?? "",
          pubDate: item.pubDate ?? new Date().toISOString(),
          imageUrl: extractImageUrl(item),
          sourceName: source.name,
          category: source.category,
        }));

      await prisma.feedSource.update({
        where: { id: source.id },
        data: { lastFetchAt: new Date() },
      });

      return items;
    } catch (error) {
      console.error(`Failed to fetch RSS from ${source.name}:`, error);
      return [];
    }
  });

  const allItems = await Promise.allSettled(feedPromises);

  for (const result of allItems) {
    if (result.status === "fulfilled") {
      results.push(...result.value);
    }
  }

  return results;
}

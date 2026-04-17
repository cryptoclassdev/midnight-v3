import { extract } from "@extractus/article-extractor";
import { stripHtml } from "./rss-fetcher.service";

const FETCH_TIMEOUT_MS = 5_000;
const ENRICH_THRESHOLD_WORDS = 80;

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export async function enrichContent(currentContent: string, url: string): Promise<string> {
  if (!url) return currentContent;
  if (wordCount(currentContent) >= ENRICH_THRESHOLD_WORDS) return currentContent;

  try {
    const result = await Promise.race([
      extract(url),
      new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error(`extract timeout after ${FETCH_TIMEOUT_MS}ms`)), FETCH_TIMEOUT_MS),
      ),
    ]);

    const extracted = stripHtml(result?.content ?? "");
    if (wordCount(extracted) > wordCount(currentContent)) {
      return extracted;
    }
    return currentContent;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.warn(`[ArticleFetcher] enrich failed for ${url}: ${msg}`);
    return currentContent;
  }
}

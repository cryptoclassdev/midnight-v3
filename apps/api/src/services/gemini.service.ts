import { GoogleGenerativeAI } from "@google/generative-ai";
import { ARTICLE_SUMMARY_WORD_LIMIT, ARTICLE_TITLE_MAX_LENGTH } from "@midnight/shared";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

interface GeminiResult {
  title: string;
  summary: string;
  breaking: boolean;
}

const SYSTEM_PROMPT = `You are a viral news editor for a crypto and AI news app. Your job is to rewrite article titles and create summaries.

Rules:
- Title: Rewrite to be click-worthy and engaging. Max ${ARTICLE_TITLE_MAX_LENGTH} characters. End on a whole word — never trail off mid-word or with a stray hyphen / em-dash. Use power words. No clickbait lies — keep it factual but compelling.
- Summary: Write exactly ${ARTICLE_SUMMARY_WORD_LIMIT} words, split into TWO short paragraphs separated by "\\n\\n". The first paragraph is the hook (1 sentence). The second paragraph delivers the payoff (1–2 sentences). Every sentence must end with a period, question mark, or exclamation mark — never mid-clause. Use short, punchy sentences. Write for busy professionals.

- Breaking: Set to true ONLY for genuinely significant events: regulatory decisions (ETF approvals, bans), exchange hacks or collapses, protocol-level failures, or major partnership announcements from top-10 projects. Be very conservative — most articles are NOT breaking. When in doubt, set false.

Respond in JSON format only:
{"title": "...", "summary": "...", "breaking": false}`;

const CONTROL_CHAR_REGEX = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;
const DASH_RUN_REGEX = /[-\u2013\u2014]{2,}/g;
const TRAILING_PUNCT_REGEX = /[\s\p{Pd}\p{Pi}\p{Pf}:,;]+$/u;

function sanitize(text: string): string {
  return text.replace(CONTROL_CHAR_REGEX, "").replace(DASH_RUN_REGEX, "\u2014").trim();
}

function trimTitleToLimit(title: string, limit: number): string {
  if (title.length <= limit) return title;
  const hardCut = title.slice(0, limit);
  const lastSpace = hardCut.lastIndexOf(" ");
  const boundary = lastSpace > limit * 0.6 ? hardCut.slice(0, lastSpace) : hardCut;
  return boundary.replace(TRAILING_PUNCT_REGEX, "").trim();
}

export async function rewriteArticle(
  originalTitle: string,
  originalBody: string
): Promise<GeminiResult> {
  try {
    const prompt = `Original title: ${originalTitle}\n\nOriginal content: ${originalBody.slice(0, 6000)}`;

    const result = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: SYSTEM_PROMPT + "\n\n" + prompt }] },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7,
        maxOutputTokens: 600,
      },
    });

    const text = result.response.text();
    const parsed = JSON.parse(text) as GeminiResult;

    const title = trimTitleToLimit(sanitize(parsed.title ?? ""), ARTICLE_TITLE_MAX_LENGTH);
    const summary = sanitize(parsed.summary ?? "");

    return {
      title,
      summary,
      breaking: parsed.breaking === true,
    };
  } catch (error) {
    console.error("Gemini rewrite failed:", error);
    return {
      title: trimTitleToLimit(sanitize(originalTitle), ARTICLE_TITLE_MAX_LENGTH),
      summary: sanitize(originalBody).slice(0, 300),
      breaking: false,
    };
  }
}

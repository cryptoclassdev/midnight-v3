import { View, Text, StyleSheet, Dimensions, Pressable, Linking } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { fonts, fontSize, letterSpacing } from "@/constants/typography";
import type { Article } from "@mintfeed/shared";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const NEGATIVE_KEYWORDS = [
  "crash", "drop", "fall", "dump", "panic", "hack", "ban", "plunge",
  "decline", "loss", "fear", "bearish", "sell-off", "liquidation", "scam",
  "fraud", "theft", "vulnerability", "exploit", "attack", "warning", "risk",
  "concern", "tumble", "sink", "plummet", "collapse", "downturn", "recession",
  "slump", "reject", "fail", "penalty", "fine", "lawsuit", "crisis",
];

const POSITIVE_KEYWORDS = [
  "surge", "rally", "rise", "pump", "boom", "launch", "upgrade", "bullish",
  "gain", "profit", "soar", "breakout", "milestone", "adoption", "approval",
  "partnership", "integration", "growth", "record", "high", "success",
  "recover", "bull", "ath", "all-time", "breakthrough", "innovation",
  "support", "accept", "embrace", "fund", "invest", "optimism",
];

type Sentiment = "positive" | "negative" | "neutral";

function detectSentiment(title: string, summary: string): Sentiment {
  const text = `${title} ${summary}`.toLowerCase();
  let positiveScore = 0;
  let negativeScore = 0;

  for (const keyword of POSITIVE_KEYWORDS) {
    if (text.includes(keyword)) positiveScore++;
  }
  for (const keyword of NEGATIVE_KEYWORDS) {
    if (text.includes(keyword)) negativeScore++;
  }

  if (positiveScore > negativeScore) return "positive";
  if (negativeScore > positiveScore) return "negative";
  return "neutral";
}

const ACCENT_RED = "#E60000";
const ACCENT_GREEN = "#00ff66";

function getAccentColor(sentiment: Sentiment): string {
  if (sentiment === "positive") return ACCENT_GREEN;
  if (sentiment === "negative") return ACCENT_RED;
  return ACCENT_GREEN;
}

function timeAgo(dateString: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateString).getTime()) / 1000
  );
  if (seconds < 60) return "JUST NOW";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}M AGO`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}H AGO`;
  const days = Math.floor(hours / 24);
  return `${days}D AGO`;
}

interface NewsCardProps {
  article: Article;
}

export function NewsCard({ article }: NewsCardProps) {
  const sentiment = detectSentiment(article.title, article.summary);
  const accentColor = getAccentColor(sentiment);
  const isNegative = sentiment === "negative";

  return (
    <Pressable
      style={styles.container}
      onPress={() => Linking.openURL(article.sourceUrl)}
    >
      {/* Background image */}
      {article.imageUrl && (
        <Image
          source={{ uri: article.imageUrl }}
          placeholder={article.imageBlurhash ?? undefined}
          style={styles.bgImage}
          contentFit="cover"
          transition={300}
        />
      )}

      {/* Gradient overlay */}
      <LinearGradient
        colors={["rgba(0,0,0,0.5)", "rgba(0,0,0,0.2)", "rgba(0,0,0,0.88)"]}
        locations={[0, 0.3, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Tinted gradient based on sentiment */}
      <LinearGradient
        colors={
          isNegative
            ? ["transparent", "rgba(230,0,0,0.06)"]
            : ["transparent", "rgba(0,255,102,0.04)"]
        }
        style={styles.waterLine}
      />

      {/* Decorative stars */}
      <Text style={[styles.decoStar, styles.starTL, { color: accentColor }]}>
        ✶
      </Text>
      <Text style={[styles.decoStar, styles.starBR, { color: accentColor }]}>
        ✶
      </Text>

      {/* Content layer at bottom */}
      <View style={styles.contentLayer}>
        {/* Meta tag */}
        <View style={[styles.metaTag, { borderColor: accentColor }]}>
          <Text style={[styles.metaTagText, { color: accentColor }]}>
            {article.category}
          </Text>
        </View>

        {/* News title — fully visible */}
        <Text style={styles.newsTitle}>{article.title}</Text>

        {/* News summary — fully visible */}
        <View
          style={[styles.snippetContainer, { borderLeftColor: accentColor }]}
        >
          <Text style={styles.newsSnippet}>{article.summary}</Text>
        </View>

        {/* Tech stat grid */}
        <View style={styles.statGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>SOURCE</Text>
            <Text style={styles.statValue}>
              {article.sourceName.toUpperCase()}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>PUBLISHED</Text>
            <Text style={styles.statValue}>
              {timeAgo(article.publishedAt)}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  bgImage: {
    ...StyleSheet.absoluteFillObject,
    width: SCREEN_WIDTH,
    height: "100%",
    opacity: 0.5,
  },
  waterLine: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    height: "40%",
  },
  decoStar: {
    position: "absolute",
    fontSize: 16,
    zIndex: 5,
    opacity: 0.6,
  },
  starTL: {
    top: 80,
    left: 20,
  },
  starBR: {
    bottom: 120,
    right: 20,
  },
  contentLayer: {
    position: "relative",
    zIndex: 5,
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  metaTag: {
    alignSelf: "flex-start",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  metaTagText: {
    fontFamily: fonts.mono.regular,
    fontSize: fontSize.xxs,
    textTransform: "uppercase",
    letterSpacing: letterSpacing.wide,
  },
  newsTitle: {
    fontFamily: fonts.body.bold,
    fontSize: fontSize.xl,
    lineHeight: 30,
    color: "#f0f0f0",
    textTransform: "uppercase",
    letterSpacing: letterSpacing.tight,
    marginBottom: 12,
    textShadowColor: "rgba(0,0,0,1)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  snippetContainer: {
    borderLeftWidth: 2,
    paddingLeft: 12,
    marginBottom: 16,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  newsSnippet: {
    fontFamily: fonts.mono.regular,
    fontSize: fontSize.sm,
    color: "#cccccc",
    lineHeight: 18,
  },
  statGrid: {
    flexDirection: "row",
    gap: 24,
    marginTop: 4,
  },
  statItem: {},
  statLabel: {
    fontFamily: fonts.mono.regular,
    fontSize: fontSize.xs,
    color: "#888888",
    letterSpacing: letterSpacing.wide,
  },
  statValue: {
    fontFamily: fonts.mono.regular,
    fontSize: fontSize.xs,
    color: "#f0f0f0",
    marginTop: 2,
  },
});

import { View, Text, StyleSheet, Dimensions, Pressable } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useAppStore } from "@/lib/store";
import { colors } from "@/constants/theme";
import { fonts, fontSize, lineHeight } from "@/constants/typography";
import type { Article } from "@mintfeed/shared";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface NewsCardProps {
  article: Article;
}

function timeAgo(dateString: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateString).getTime()) / 1000
  );
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NewsCard({ article }: NewsCardProps) {
  const theme = useAppStore((s) => s.theme);
  const themeColors = colors[theme];
  const router = useRouter();

  return (
    <Pressable
      style={styles.container}
      onPress={() => router.push(`/article/${article.id}`)}
    >
      <Image
        source={{ uri: article.imageUrl! }}
        placeholder={article.imageBlurhash ?? undefined}
        style={styles.image}
        contentFit="cover"
        transition={300}
      />

      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.4)", "rgba(0,0,0,0.92)"]}
        locations={[0, 0.3, 1]}
        style={styles.gradient}
      />

      <View style={styles.content}>
        <View
          style={[styles.badge, { backgroundColor: themeColors.accent }]}
        >
          <Text style={styles.badgeText}>
            {article.category}
          </Text>
        </View>

        <Text style={styles.source}>
          {article.sourceName} · {timeAgo(article.publishedAt)}
        </Text>

        <Text style={styles.title} numberOfLines={3}>
          {article.title}
        </Text>

        <Text style={styles.summary}>
          {article.summary}
        </Text>

        <View style={styles.swipeHint}>
          <Text style={styles.swipeHintText}>Swipe up for more</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: SCREEN_WIDTH,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: SCREEN_WIDTH,
    height: "100%",
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  badgeText: {
    fontFamily: fonts.sans.bold,
    fontSize: fontSize.xs,
    color: "#0A0A0A",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  source: {
    fontFamily: fonts.sans.medium,
    fontSize: fontSize.sm,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 8,
  },
  title: {
    fontFamily: fonts.serif.bold,
    fontSize: fontSize.xl,
    lineHeight: lineHeight.xl,
    color: "#FAFAFA",
    marginBottom: 10,
  },
  summary: {
    fontFamily: fonts.sans.regular,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    color: "rgba(255,255,255,0.85)",
  },
  swipeHint: {
    alignItems: "center",
    marginTop: 20,
  },
  swipeHintText: {
    fontFamily: fonts.sans.regular,
    fontSize: fontSize.xs,
    color: "rgba(255,255,255,0.4)",
  },
});

import { View, Text, ScrollView, StyleSheet, Pressable, Linking } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { api } from "@/lib/api-client";
import { useAppStore } from "@/lib/store";
import { colors } from "@/constants/theme";
import { fonts, fontSize, lineHeight } from "@/constants/typography";
import type { Article } from "@mintfeed/shared";

export default function ArticleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useAppStore((s) => s.theme);
  const themeColors = colors[theme];

  const { data: article } = useQuery({
    queryKey: ["article", id],
    queryFn: () => api.get(`api/v1/feed/${id}`).json<Article>(),
    enabled: !!id,
  });

  if (!article) return null;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="close" size={28} color={themeColors.text} />
        </Pressable>
        <Pressable onPress={() => Linking.openURL(article.sourceUrl)}>
          <Ionicons
            name="open-outline"
            size={22}
            color={themeColors.accent}
          />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        {article.imageUrl && (
          <Image
            source={{ uri: article.imageUrl }}
            style={styles.heroImage}
            contentFit="cover"
            transition={300}
          />
        )}

        <View
          style={[styles.badge, { backgroundColor: themeColors.accent }]}
        >
          <Text style={styles.badgeText}>{article.category}</Text>
        </View>

        <Text style={[styles.source, { color: themeColors.textMuted }]}>
          {article.sourceName}
        </Text>

        <Text style={[styles.title, { color: themeColors.text }]}>
          {article.title}
        </Text>

        <Text style={[styles.summary, { color: themeColors.textSecondary }]}>
          {article.summary}
        </Text>

        <Pressable
          style={[styles.readMore, { backgroundColor: themeColors.accent }]}
          onPress={() => Linking.openURL(article.sourceUrl)}
        >
          <Text style={styles.readMoreText}>Read full article</Text>
          <Ionicons name="arrow-forward" size={16} color="#0A0A0A" />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  heroImage: {
    width: "100%",
    height: 240,
    borderRadius: 16,
    marginBottom: 16,
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
    marginBottom: 8,
  },
  title: {
    fontFamily: fonts.serif.bold,
    fontSize: fontSize.xxxl,
    lineHeight: lineHeight.xxxl,
    marginBottom: 16,
  },
  summary: {
    fontFamily: fonts.sans.regular,
    fontSize: fontSize.lg,
    lineHeight: lineHeight.lg,
    marginBottom: 24,
  },
  readMore: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  readMoreText: {
    fontFamily: fonts.sans.bold,
    fontSize: fontSize.base,
    color: "#0A0A0A",
  },
});

import { useCallback, useRef, useState, useEffect } from "react";
import { View, StyleSheet, ActivityIndicator, Text } from "react-native";
import PagerView, {
  type PagerViewOnPageSelectedEvent,
} from "react-native-pager-view";
import * as Haptics from "expo-haptics";
import { useFeed } from "@/hooks/useFeed";
import { useAppStore } from "@/lib/store";
import { colors } from "@/constants/theme";
import { fonts, fontSize } from "@/constants/typography";
import { NewsCard } from "./NewsCard";

const PREFETCH_THRESHOLD = 5;
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3005";

export function SwipeFeed() {
  const theme = useAppStore((s) => s.theme);
  const markAsRead = useAppStore((s) => s.markAsRead);
  const themeColors = colors[theme];
  const pagerRef = useRef<PagerView>(null);
  const [debugInfo, setDebugInfo] = useState("Initializing...");

  // Raw fetch test to bypass ky/tanstack and see what's actually happening
  useEffect(() => {
    const testUrl = `${API_URL}/api/v1/feed?category=all&limit=2`;
    setDebugInfo(`Fetching: ${testUrl}`);
    fetch(testUrl)
      .then(async (res) => {
        const text = await res.text();
        const preview = text.substring(0, 200);
        setDebugInfo(`Status: ${res.status}\nURL: ${testUrl}\nBody: ${preview}`);
      })
      .catch((err) => {
        setDebugInfo(`FETCH ERROR:\n${err.name}: ${err.message}\nURL: ${testUrl}`);
      });
  }, []);

  const query = useFeed();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = query;

  const articles = data?.pages.flatMap((page) => page.data) ?? [];

  const onPageSelected = useCallback(
    (e: PagerViewOnPageSelectedEvent) => {
      const index = e.nativeEvent.position;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const article = articles[index];
      if (article) {
        markAsRead(article.id);
      }

      if (
        hasNextPage &&
        !isFetchingNextPage &&
        index >= articles.length - PREFETCH_THRESHOLD
      ) {
        fetchNextPage();
      }
    },
    [articles, hasNextPage, isFetchingNextPage, fetchNextPage, markAsRead]
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={themeColors.accent} />
        {__DEV__ && (
          <Text style={[styles.debugText, { color: themeColors.accent }]}>
            {`Loading...\nQuery: ${query.fetchStatus}\n\n${debugInfo}`}
          </Text>
        )}
      </View>
    );
  }

  if (articles.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={[styles.emptyText, { color: themeColors.textMuted }]}>
          No articles yet. Pull down to refresh.
        </Text>
        {__DEV__ && (
          <Text style={[styles.debugText, { color: themeColors.accent }]}>
            {`Query status: ${query.status}\nError: ${query.error?.message ?? "none"}\nPages: ${data?.pages?.length ?? 0}\n\n${debugInfo}`}
          </Text>
        )}
      </View>
    );
  }

  return (
    <PagerView
      ref={pagerRef}
      style={styles.pager}
      orientation="vertical"
      initialPage={0}
      offscreenPageLimit={2}
      onPageSelected={onPageSelected}
    >
      {articles.map((article) => (
        <View key={article.id} style={styles.page}>
          <NewsCard article={article} />
        </View>
      ))}
    </PagerView>
  );
}

const styles = StyleSheet.create({
  pager: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    fontFamily: fonts.sans.medium,
    fontSize: fontSize.base,
    textAlign: "center",
  },
  debugText: {
    fontSize: 11,
    marginTop: 16,
    textAlign: "left",
    fontFamily: fonts.sans.regular,
  },
});

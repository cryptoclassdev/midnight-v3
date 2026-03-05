import { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAppStore } from "@/lib/store";
import { colors } from "@/constants/theme";
import { fonts, fontSize, letterSpacing } from "@/constants/typography";
import { usePredictionEvent, usePredictionEventMarkets } from "@/hooks/usePredictionEvents";
import { MarketRow } from "@/components/predict/MarketRow";
import { microToUsd } from "@mintfeed/shared";
import type { PredictionMarketDetail } from "@mintfeed/shared";

const IMAGE_HEIGHT = 200;
const VOLUME_THOUSAND = 1_000;
const VOLUME_MILLION = 1_000_000;

function formatVolume(microUsdString: string): string {
  const usd = microToUsd(microUsdString);
  if (usd >= VOLUME_MILLION) return `$${(usd / VOLUME_MILLION).toFixed(1)}M`;
  if (usd >= VOLUME_THOUSAND) return `$${(usd / VOLUME_THOUSAND).toFixed(1)}K`;
  return `$${usd.toFixed(0)}`;
}

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useAppStore((s) => s.theme);
  const themeColors = colors[theme];

  const { data: event, isLoading: eventLoading } = usePredictionEvent(id);
  const { data: marketsData, isLoading: marketsLoading } = usePredictionEventMarkets(id);

  const markets = marketsData?.data ?? event?.markets ?? [];

  const handleMarketPress = useCallback(
    (market: PredictionMarketDetail) => {
      router.push(`/predict/market/${market.marketId}`);
    },
    [router],
  );

  const renderMarket = useCallback(
    ({ item }: { item: PredictionMarketDetail }) => (
      <MarketRow market={item} onPress={handleMarketPress} />
    ),
    [handleMarketPress],
  );

  const keyExtractor = useCallback(
    (item: PredictionMarketDetail) => item.marketId,
    [],
  );

  if (eventLoading || !event) {
    return (
      <SafeAreaView
        style={[styles.container, styles.centered, { backgroundColor: themeColors.background }]}
        edges={["top"]}
      >
        <ActivityIndicator size="large" color={themeColors.accent} />
      </SafeAreaView>
    );
  }

  const renderHeader = () => (
    <View>
      {/* Event image with gradient overlay */}
      {event.metadata.imageUrl ? (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: event.metadata.imageUrl }}
            style={styles.image}
            contentFit="cover"
            transition={300}
          />
          <LinearGradient
            colors={["transparent", themeColors.background]}
            style={styles.gradient}
          />
        </View>
      ) : (
        <View style={styles.imagePlaceholder} />
      )}

      {/* Event info */}
      <View style={styles.eventInfo}>
        {/* Badges */}
        <View style={styles.badgeRow}>
          {event.category && (
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: themeColors.border },
              ]}
            >
              <Text style={[styles.categoryText, { color: themeColors.textMuted }]}>
                {event.category}
              </Text>
            </View>
          )}

          {event.isLive && (
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}

          <View style={styles.volumeBadge}>
            <Text style={[styles.volumeText, { color: themeColors.accent }]}>
              {formatVolume(event.volumeUsd)}
            </Text>
          </View>
        </View>

        {/* Title */}
        <Text style={[styles.eventTitle, { color: themeColors.text }]}>
          {event.metadata.title}
        </Text>

        {/* Markets section header */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>
            MARKETS
          </Text>
          <Text style={[styles.sectionCount, { color: themeColors.textMuted }]}>
            {markets.length}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      edges={["top"]}
    >
      {/* Back button (floating) */}
      <Pressable
        style={({ pressed }) => [
          styles.backButton,
          { backgroundColor: themeColors.background },
          pressed && { opacity: 0.7 },
        ]}
        onPress={() => router.back()}
      >
        <Ionicons name="chevron-back" size={24} color={themeColors.text} />
      </Pressable>

      {/* Markets list */}
      <FlatList
        data={markets}
        renderItem={renderMarket}
        keyExtractor={keyExtractor}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          marketsLoading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="small" color={themeColors.accent} />
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: themeColors.textMuted }]}>
                No markets available
              </Text>
            </View>
          )
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: 56,
    left: 16,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.9,
  },
  imageContainer: {
    width: "100%",
    height: IMAGE_HEIGHT,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 80,
  },
  imagePlaceholder: {
    height: 40,
  },
  eventInfo: {
    paddingHorizontal: 16,
    gap: 12,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderCurve: "continuous",
  },
  categoryText: {
    fontFamily: fonts.mono.regular,
    fontSize: fontSize.xxs,
    textTransform: "uppercase",
    letterSpacing: letterSpacing.wide,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderCurve: "continuous",
    backgroundColor: "rgba(0, 255, 102, 0.15)",
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#00ff66",
  },
  liveText: {
    fontFamily: fonts.mono.bold,
    fontSize: fontSize.xxs,
    color: "#00ff66",
    letterSpacing: letterSpacing.wide,
  },
  volumeBadge: {
    marginLeft: "auto",
  },
  volumeText: {
    fontFamily: fonts.mono.bold,
    fontSize: fontSize.sm,
    letterSpacing: letterSpacing.wide,
  },
  eventTitle: {
    fontFamily: fonts.body.bold,
    fontSize: fontSize.xl,
    lineHeight: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontFamily: fonts.mono.bold,
    fontSize: fontSize.xxs,
    letterSpacing: letterSpacing.wider,
  },
  sectionCount: {
    fontFamily: fonts.mono.regular,
    fontSize: fontSize.xxs,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontFamily: fonts.body.regular,
    fontSize: fontSize.base,
  },
});

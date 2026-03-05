import { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore } from "@/lib/store";
import { colors, type ThemeColors } from "@/constants/theme";
import { fonts, fontSize, letterSpacing } from "@/constants/typography";
import { usePredictionProfile, usePnLHistory } from "@/hooks/usePredictionProfile";
import { usePredictionTrades, useFollowUser, useUnfollowUser } from "@/hooks/usePredictionSocial";
import { formatSolanaAddress } from "@/lib/solana";
import { microToUsd } from "@mintfeed/shared";
import { TradeRow } from "@/components/predict/TradeRow";
import type { PredictionTrade, PnLHistoryEntry } from "@mintfeed/shared";

const VOLUME_THOUSAND = 1_000;
const VOLUME_MILLION = 1_000_000;
const PERCENTAGE_MULTIPLIER = 100;
const SPARKLINE_HEIGHT = 60;
const SPARKLINE_DOT_SIZE = 4;

function formatUsd(microUsd: string): string {
  const usd = microToUsd(microUsd);
  if (Math.abs(usd) >= VOLUME_MILLION) return `$${(usd / VOLUME_MILLION).toFixed(1)}M`;
  if (Math.abs(usd) >= VOLUME_THOUSAND) return `$${(usd / VOLUME_THOUSAND).toFixed(1)}K`;
  return `$${usd.toFixed(2)}`;
}

function PnLSparkline({
  entries,
  themeColors,
}: {
  entries: PnLHistoryEntry[];
  themeColors: ThemeColors;
}) {
  if (entries.length === 0) {
    return (
      <View style={[sparkStyles.container, { borderColor: themeColors.border }]}>
        <Text style={[sparkStyles.emptyText, { color: themeColors.textMuted }]}>
          No P&L data
        </Text>
      </View>
    );
  }

  const values = entries.map((e) => microToUsd(e.realizedPnl));
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;

  return (
    <View
      style={[
        sparkStyles.container,
        { borderColor: themeColors.border },
      ]}
    >
      <View style={sparkStyles.chartArea}>
        {/* Zero line */}
        {minVal < 0 && maxVal > 0 && (
          <View
            style={[
              sparkStyles.zeroLine,
              {
                bottom: `${((0 - minVal) / range) * PERCENTAGE_MULTIPLIER}%`,
                backgroundColor: themeColors.border,
              },
            ]}
          />
        )}

        {/* Dots */}
        {values.map((val, index) => {
          const xPercent = entries.length > 1
            ? (index / (entries.length - 1)) * PERCENTAGE_MULTIPLIER
            : 50;
          const yPercent = ((val - minVal) / range) * PERCENTAGE_MULTIPLIER;
          const isPositive = val >= 0;

          return (
            <View
              key={index}
              style={[
                sparkStyles.dot,
                {
                  left: `${xPercent}%`,
                  bottom: `${yPercent}%`,
                  backgroundColor: isPositive
                    ? themeColors.positive
                    : themeColors.negative,
                },
              ]}
            />
          );
        })}

        {/* Connect dots with lines */}
        {values.length > 1 &&
          values.slice(0, -1).map((val, index) => {
            const nextVal = values[index + 1];
            const x1 = (index / (entries.length - 1)) * PERCENTAGE_MULTIPLIER;
            const x2 = ((index + 1) / (entries.length - 1)) * PERCENTAGE_MULTIPLIER;
            const y1 = ((val - minVal) / range) * PERCENTAGE_MULTIPLIER;
            const y2 = ((nextVal - minVal) / range) * PERCENTAGE_MULTIPLIER;
            const lineColor = nextVal >= val ? themeColors.positive : themeColors.negative;

            const dx = x2 - x1;
            const dy = y2 - y1;
            const lineLength = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(-dy, dx) * (180 / Math.PI);

            return (
              <View
                key={`line-${index}`}
                style={[
                  sparkStyles.line,
                  {
                    left: `${x1}%`,
                    bottom: `${y1}%`,
                    width: `${lineLength}%`,
                    backgroundColor: lineColor,
                    transform: [{ rotate: `${angle}deg` }],
                  },
                ]}
              />
            );
          })}
      </View>
    </View>
  );
}

export default function TraderProfileScreen() {
  const { pubkey } = useLocalSearchParams<{ pubkey: string }>();
  const router = useRouter();
  const theme = useAppStore((s) => s.theme);
  const walletAddress = useAppStore((s) => s.walletAddress);
  const themeColors = colors[theme];

  const { data: profile, isLoading: profileLoading } = usePredictionProfile(pubkey);
  const { data: pnlData } = usePnLHistory(pubkey);
  const { data: tradesData, isLoading: tradesLoading } = usePredictionTrades();

  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();

  const [isFollowing, setIsFollowing] = useState(false);

  const pnlEntries = pnlData?.data ?? [];

  const traderTrades = useMemo(() => {
    if (!tradesData?.data) return [];
    return tradesData.data.filter((t) => t.traderPubkey === pubkey);
  }, [tradesData, pubkey]);

  const handleFollow = useCallback(async () => {
    if (!pubkey) return;
    try {
      if (isFollowing) {
        await unfollowUser.mutateAsync({ pubkey });
        setIsFollowing(false);
      } else {
        await followUser.mutateAsync({ pubkey });
        setIsFollowing(true);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Action failed";
      Alert.alert("Error", message);
    }
  }, [pubkey, isFollowing, followUser, unfollowUser]);

  const isOwnProfile = walletAddress === pubkey;
  const isFollowPending = followUser.isPending || unfollowUser.isPending;

  const renderTradeItem = useCallback(
    ({ item }: { item: PredictionTrade }) => <TradeRow trade={item} />,
    [],
  );

  const keyExtractor = useCallback(
    (item: PredictionTrade) => item.id,
    [],
  );

  if (profileLoading) {
    return (
      <SafeAreaView
        style={[styles.container, styles.centered, { backgroundColor: themeColors.background }]}
        edges={["top"]}
      >
        <ActivityIndicator size="large" color={themeColors.accent} />
      </SafeAreaView>
    );
  }

  const pnl = profile ? microToUsd(profile.realizedPnl) : 0;
  const isPnlPositive = pnl >= 0;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      edges={["top"]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => [pressed && { opacity: 0.7 }]}
        >
          <Ionicons name="chevron-back" size={24} color={themeColors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>
          Trader
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        data={traderTrades}
        renderItem={renderTradeItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={
          <View>
            {/* Trader address */}
            <View style={styles.profileSection}>
              <View style={[styles.avatarCircle, { borderColor: themeColors.border }]}>
                <Ionicons name="person" size={24} color={themeColors.textMuted} />
              </View>
              <Text style={[styles.address, { color: themeColors.text }]}>
                {pubkey ? formatSolanaAddress(pubkey) : ""}
              </Text>
              <Text style={[styles.fullAddress, { color: themeColors.textMuted }]}>
                {pubkey}
              </Text>

              {/* Follow button */}
              {walletAddress && !isOwnProfile && (
                <Pressable
                  style={({ pressed }) => [
                    styles.followButton,
                    {
                      backgroundColor: isFollowing
                        ? "transparent"
                        : themeColors.accent,
                      borderColor: isFollowing
                        ? themeColors.border
                        : themeColors.accent,
                    },
                    pressed && { opacity: 0.7 },
                    isFollowPending && { opacity: 0.5 },
                  ]}
                  onPress={handleFollow}
                  disabled={isFollowPending}
                >
                  <Text
                    style={[
                      styles.followText,
                      {
                        color: isFollowing
                          ? themeColors.textSecondary
                          : "#ffffff",
                      },
                    ]}
                  >
                    {isFollowing ? "Unfollow" : "Follow"}
                  </Text>
                </Pressable>
              )}
            </View>

            {/* Stats grid */}
            {profile && (
              <View style={styles.statsGrid}>
                <View style={[styles.statCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                  <Text style={[styles.statLabel, { color: themeColors.textMuted }]}>
                    P&L
                  </Text>
                  <Text
                    style={[
                      styles.statValue,
                      {
                        color: isPnlPositive
                          ? themeColors.positive
                          : themeColors.negative,
                      },
                    ]}
                  >
                    {isPnlPositive ? "+" : ""}
                    {formatUsd(profile.realizedPnl)}
                  </Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                  <Text style={[styles.statLabel, { color: themeColors.textMuted }]}>
                    VOLUME
                  </Text>
                  <Text style={[styles.statValue, { color: themeColors.text }]}>
                    {formatUsd(profile.volume)}
                  </Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                  <Text style={[styles.statLabel, { color: themeColors.textMuted }]}>
                    WIN RATE
                  </Text>
                  <Text style={[styles.statValue, { color: themeColors.text }]}>
                    {(profile.winRate * PERCENTAGE_MULTIPLIER).toFixed(0)}%
                  </Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                  <Text style={[styles.statLabel, { color: themeColors.textMuted }]}>
                    PREDICTIONS
                  </Text>
                  <Text style={[styles.statValue, { color: themeColors.text }]}>
                    {profile.predictionsCount}
                  </Text>
                </View>
              </View>
            )}

            {/* P&L History sparkline */}
            <View style={styles.pnlSection}>
              <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>
                P&L HISTORY
              </Text>
              <PnLSparkline entries={pnlEntries} themeColors={themeColors} />
            </View>

            {/* Recent trades header */}
            <View style={styles.tradesHeader}>
              <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>
                RECENT TRADES
              </Text>
              {tradesLoading && (
                <ActivityIndicator size="small" color={themeColors.accent} />
              )}
            </View>
          </View>
        }
        ListEmptyComponent={
          tradesLoading ? null : (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: themeColors.textMuted }]}>
                No recent trades
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

const sparkStyles = StyleSheet.create({
  container: {
    height: SPARKLINE_HEIGHT,
    borderWidth: 1,
    borderRadius: 10,
    borderCurve: "continuous",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  chartArea: {
    flex: 1,
    width: "100%",
    position: "relative",
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  zeroLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
  },
  dot: {
    position: "absolute",
    width: SPARKLINE_DOT_SIZE,
    height: SPARKLINE_DOT_SIZE,
    borderRadius: SPARKLINE_DOT_SIZE / 2,
    marginLeft: -(SPARKLINE_DOT_SIZE / 2),
    marginBottom: -(SPARKLINE_DOT_SIZE / 2),
  },
  line: {
    position: "absolute",
    height: 1,
    transformOrigin: "left center",
  },
  emptyText: {
    fontFamily: fonts.mono.regular,
    fontSize: fontSize.xs,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontFamily: fonts.display.regular,
    fontSize: fontSize.xxl,
    letterSpacing: letterSpacing.wide,
  },
  headerSpacer: {
    width: 24,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 16,
    gap: 8,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  address: {
    fontFamily: fonts.mono.bold,
    fontSize: fontSize.lg,
  },
  fullAddress: {
    fontFamily: fonts.mono.regular,
    fontSize: fontSize.xxs,
    letterSpacing: letterSpacing.wide,
  },
  followButton: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
    borderCurve: "continuous",
    borderWidth: 1,
    marginTop: 4,
  },
  followText: {
    fontFamily: fonts.body.bold,
    fontSize: fontSize.sm,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    width: "48%",
    flexGrow: 1,
    borderWidth: 1,
    borderRadius: 10,
    borderCurve: "continuous",
    padding: 12,
    gap: 4,
  },
  statLabel: {
    fontFamily: fonts.mono.regular,
    fontSize: fontSize.xxs,
    letterSpacing: letterSpacing.wider,
  },
  statValue: {
    fontFamily: fonts.mono.bold,
    fontSize: fontSize.lg,
  },
  pnlSection: {
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: fonts.mono.bold,
    fontSize: fontSize.xxs,
    letterSpacing: letterSpacing.wider,
  },
  tradesHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  listContent: {
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

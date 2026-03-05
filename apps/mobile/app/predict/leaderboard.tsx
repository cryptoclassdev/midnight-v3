import { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore } from "@/lib/store";
import { colors } from "@/constants/theme";
import { fonts, fontSize, letterSpacing } from "@/constants/typography";
import { useLeaderboard } from "@/hooks/usePredictionSocial";
import { LeaderboardRow } from "@/components/predict/LeaderboardRow";
import type { LeaderboardEntry } from "@mintfeed/shared";

type PeriodOption = "all" | "weekly" | "monthly";
type MetricOption = "pnl" | "volume" | "winRate";

const PERIOD_OPTIONS: { key: PeriodOption; label: string }[] = [
  { key: "all", label: "All Time" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
];

const METRIC_OPTIONS: { key: MetricOption; label: string }[] = [
  { key: "pnl", label: "PnL" },
  { key: "volume", label: "Volume" },
  { key: "winRate", label: "Win Rate" },
];

export default function LeaderboardScreen() {
  const router = useRouter();
  const theme = useAppStore((s) => s.theme);
  const themeColors = colors[theme];

  const [period, setPeriod] = useState<PeriodOption>("all");
  const [metric, setMetric] = useState<MetricOption>("pnl");

  const { data: leaderboardData, isLoading } = useLeaderboard({
    period,
    metric,
  });

  const entries = leaderboardData?.data ?? [];

  const handleEntryPress = useCallback(
    (entry: LeaderboardEntry) => {
      router.push(`/predict/trader/${entry.ownerPubkey}`);
    },
    [router],
  );

  const renderItem = useCallback(
    ({ item }: { item: LeaderboardEntry }) => (
      <LeaderboardRow entry={item} onPress={handleEntryPress} />
    ),
    [handleEntryPress],
  );

  const keyExtractor = useCallback(
    (item: LeaderboardEntry) => item.ownerPubkey,
    [],
  );

  const renderEmpty = useCallback(() => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="trophy-outline" size={40} color={themeColors.textMuted} />
        <Text style={[styles.emptyText, { color: themeColors.textMuted }]}>
          No leaderboard data yet
        </Text>
      </View>
    );
  }, [isLoading, themeColors]);

  const renderHeader = useCallback(
    () => (
      <View style={styles.filtersContainer}>
        {/* Period filter */}
        <View style={styles.filterRow}>
          {PERIOD_OPTIONS.map((option) => {
            const isActive = period === option.key;
            return (
              <Pressable
                key={option.key}
                onPress={() => setPeriod(option.key)}
                style={({ pressed }) => [
                  styles.filterPill,
                  {
                    backgroundColor: isActive
                      ? themeColors.accent
                      : "transparent",
                    borderColor: isActive
                      ? themeColors.accent
                      : themeColors.border,
                  },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    {
                      color: isActive ? "#ffffff" : themeColors.textMuted,
                    },
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Metric toggle */}
        <View style={styles.filterRow}>
          {METRIC_OPTIONS.map((option) => {
            const isActive = metric === option.key;
            return (
              <Pressable
                key={option.key}
                onPress={() => setMetric(option.key)}
                style={({ pressed }) => [
                  styles.metricPill,
                  {
                    backgroundColor: isActive
                      ? "rgba(230, 0, 0, 0.12)"
                      : "transparent",
                    borderColor: isActive
                      ? themeColors.accent
                      : themeColors.border,
                  },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    {
                      color: isActive
                        ? themeColors.accent
                        : themeColors.textMuted,
                    },
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Column headers */}
        <View style={styles.columnHeaders}>
          <Text style={[styles.colHeader, { color: themeColors.textMuted, width: 32, textAlign: "center" }]}>
            #
          </Text>
          <Text style={[styles.colHeader, { color: themeColors.textMuted, flex: 1, marginLeft: 8 }]}>
            TRADER
          </Text>
          <Text style={[styles.colHeader, { color: themeColors.textMuted, textAlign: "right" }]}>
            PNL
          </Text>
          <Text style={[styles.colHeader, { color: themeColors.textMuted, width: 42, textAlign: "right", marginLeft: 8 }]}>
            WIN%
          </Text>
        </View>
      </View>
    ),
    [period, metric, themeColors],
  );

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
          Leaderboard
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* List */}
      <FlatList
        data={entries}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={
          isLoading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="small" color={themeColors.accent} />
            </View>
          ) : null
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
  filtersContainer: {
    gap: 10,
    paddingBottom: 8,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderCurve: "continuous",
    borderWidth: 1,
  },
  metricPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderCurve: "continuous",
    borderWidth: 1,
  },
  filterText: {
    fontFamily: fonts.mono.regular,
    fontSize: fontSize.xxs,
    letterSpacing: letterSpacing.wide,
    textTransform: "uppercase",
  },
  columnHeaders: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  colHeader: {
    fontFamily: fonts.mono.regular,
    fontSize: fontSize.xxs,
    letterSpacing: letterSpacing.wider,
  },
  listContent: {
    paddingBottom: 40,
  },
  loaderContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontFamily: fonts.body.regular,
    fontSize: fontSize.base,
  },
});

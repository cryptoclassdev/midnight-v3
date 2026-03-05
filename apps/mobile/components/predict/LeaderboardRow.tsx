import { memo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { colors } from "@/constants/theme";
import { fonts, fontSize, letterSpacing } from "@/constants/typography";
import { useAppStore } from "@/lib/store";
import { formatSolanaAddress } from "@/lib/solana";
import type { LeaderboardEntry } from "@mintfeed/shared";
import { microToUsd } from "@mintfeed/shared";

const GOLD_COLOR = "#FFD700";
const SILVER_COLOR = "#C0C0C0";
const BRONZE_COLOR = "#CD7F32";

const GOLD_RANK = 1;
const SILVER_RANK = 2;
const BRONZE_RANK = 3;

function getRankColor(rank: number): string | null {
  if (rank === GOLD_RANK) return GOLD_COLOR;
  if (rank === SILVER_RANK) return SILVER_COLOR;
  if (rank === BRONZE_RANK) return BRONZE_COLOR;
  return null;
}

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  onPress?: (entry: LeaderboardEntry) => void;
}

export const LeaderboardRow = memo(function LeaderboardRow({
  entry,
  onPress,
}: LeaderboardRowProps) {
  const theme = useAppStore((s) => s.theme);
  const themeColors = colors[theme];

  const pnl = microToUsd(entry.pnl);
  const isPnlPositive = pnl >= 0;
  const rankColor = getRankColor(entry.rank);
  const winRatePercent = Math.round(entry.winRate * 100);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        { borderBottomColor: themeColors.border },
        pressed && onPress ? { opacity: 0.7 } : undefined,
      ]}
      onPress={() => onPress?.(entry)}
      disabled={!onPress}
    >
      {/* Rank */}
      <View style={styles.rankCell}>
        <Text
          style={[
            styles.rank,
            { color: rankColor ?? themeColors.textMuted },
            rankColor ? styles.rankHighlight : undefined,
          ]}
        >
          {entry.rank}
        </Text>
      </View>

      {/* Address */}
      <View style={styles.addressCell}>
        <Text style={[styles.address, { color: themeColors.text }]}>
          {formatSolanaAddress(entry.ownerPubkey)}
        </Text>
        <Text
          style={[styles.predictions, { color: themeColors.textMuted }]}
        >
          {entry.predictionsCount} predictions
        </Text>
      </View>

      {/* PnL */}
      <View style={styles.pnlCell}>
        <Text
          style={[
            styles.pnl,
            {
              color: isPnlPositive
                ? themeColors.positive
                : themeColors.negative,
            },
          ]}
        >
          {isPnlPositive ? "+" : ""}${pnl.toFixed(2)}
        </Text>
      </View>

      {/* Win rate */}
      <View style={styles.winRateCell}>
        <Text style={[styles.winRate, { color: themeColors.textSecondary }]}>
          {winRatePercent}%
        </Text>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rankCell: {
    width: 32,
    alignItems: "center",
  },
  rank: {
    fontFamily: fonts.mono.bold,
    fontSize: fontSize.base,
  },
  rankHighlight: {
    fontSize: fontSize.lg,
  },
  addressCell: {
    flex: 1,
    marginLeft: 8,
    gap: 2,
  },
  address: {
    fontFamily: fonts.mono.regular,
    fontSize: fontSize.sm,
  },
  predictions: {
    fontFamily: fonts.body.regular,
    fontSize: fontSize.xxs,
  },
  pnlCell: {
    marginLeft: 12,
    alignItems: "flex-end",
  },
  pnl: {
    fontFamily: fonts.mono.bold,
    fontSize: fontSize.sm,
  },
  winRateCell: {
    width: 42,
    alignItems: "flex-end",
    marginLeft: 8,
  },
  winRate: {
    fontFamily: fonts.mono.regular,
    fontSize: fontSize.xs,
  },
});

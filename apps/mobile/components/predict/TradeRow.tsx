import { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "@/constants/theme";
import { fonts, fontSize, letterSpacing } from "@/constants/typography";
import { useAppStore } from "@/lib/store";
import type { PredictionTrade } from "@mintfeed/shared";
import { microToUsd } from "@mintfeed/shared";

const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_DAY = 86400;
const SECONDS_PER_WEEK = 604800;

const MAX_MARKET_TITLE_LENGTH = 28;

function timeAgo(timestamp: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(timestamp).getTime()) / 1000,
  );
  if (seconds < SECONDS_PER_MINUTE) return "now";
  if (seconds < SECONDS_PER_HOUR)
    return `${Math.floor(seconds / SECONDS_PER_MINUTE)}m ago`;
  if (seconds < SECONDS_PER_DAY)
    return `${Math.floor(seconds / SECONDS_PER_HOUR)}h ago`;
  if (seconds < SECONDS_PER_WEEK)
    return `${Math.floor(seconds / SECONDS_PER_DAY)}d ago`;
  return `${Math.floor(seconds / SECONDS_PER_WEEK)}w ago`;
}

function truncateTitle(title: string): string {
  if (title.length <= MAX_MARKET_TITLE_LENGTH) return title;
  return `${title.slice(0, MAX_MARKET_TITLE_LENGTH)}...`;
}

interface TradeRowProps {
  trade: PredictionTrade;
}

export const TradeRow = memo(function TradeRow({ trade }: TradeRowProps) {
  const theme = useAppStore((s) => s.theme);
  const themeColors = colors[theme];

  const isBuy = trade.action === "buy";
  const isYes = trade.side === "yes";
  const price = microToUsd(trade.price);
  const amount = microToUsd(trade.amountUsd);
  const marketTitle = trade.market?.title ?? trade.marketId;

  return (
    <View
      style={[
        styles.container,
        { borderBottomColor: themeColors.border },
      ]}
    >
      {/* Action badge */}
      <View
        style={[
          styles.actionBadge,
          {
            backgroundColor: isBuy
              ? "rgba(0, 255, 102, 0.12)"
              : "rgba(230, 0, 0, 0.12)",
          },
        ]}
      >
        <Text
          style={[
            styles.actionText,
            { color: isBuy ? themeColors.positive : themeColors.negative },
          ]}
        >
          {isBuy ? "BUY" : "SELL"}
        </Text>
      </View>

      {/* Side badge */}
      <View
        style={[
          styles.sideBadge,
          {
            backgroundColor: isYes
              ? "rgba(0, 255, 102, 0.08)"
              : "rgba(230, 0, 0, 0.08)",
          },
        ]}
      >
        <Text
          style={[
            styles.sideText,
            { color: isYes ? themeColors.positive : themeColors.negative },
          ]}
        >
          {isYes ? "Y" : "N"}
        </Text>
      </View>

      {/* Market title */}
      <Text
        style={[styles.marketTitle, { color: themeColors.textSecondary }]}
        numberOfLines={1}
      >
        {truncateTitle(marketTitle)}
      </Text>

      {/* Price and amount */}
      <View style={styles.rightSection}>
        <Text style={[styles.price, { color: themeColors.text }]}>
          ${price.toFixed(2)}
        </Text>
        <Text style={[styles.amount, { color: themeColors.textMuted }]}>
          ${amount.toFixed(2)}
        </Text>
      </View>

      {/* Time */}
      <Text style={[styles.time, { color: themeColors.textMuted }]}>
        {timeAgo(trade.timestamp)}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 6,
  },
  actionBadge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
    borderCurve: "continuous",
  },
  actionText: {
    fontFamily: fonts.mono.bold,
    fontSize: fontSize.xxs,
    letterSpacing: letterSpacing.wide,
  },
  sideBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  sideText: {
    fontFamily: fonts.mono.bold,
    fontSize: fontSize.xxs,
  },
  marketTitle: {
    flex: 1,
    fontFamily: fonts.body.regular,
    fontSize: fontSize.xs,
  },
  rightSection: {
    alignItems: "flex-end",
    gap: 1,
  },
  price: {
    fontFamily: fonts.mono.regular,
    fontSize: fontSize.xs,
  },
  amount: {
    fontFamily: fonts.mono.regular,
    fontSize: fontSize.xxs,
  },
  time: {
    fontFamily: fonts.mono.regular,
    fontSize: fontSize.xxs,
    width: 40,
    textAlign: "right",
  },
});

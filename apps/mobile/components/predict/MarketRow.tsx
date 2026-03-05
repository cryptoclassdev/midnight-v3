import { memo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { colors } from "@/constants/theme";
import { fonts, fontSize, letterSpacing } from "@/constants/typography";
import { useAppStore } from "@/lib/store";
import type { PredictionMarketDetail } from "@mintfeed/shared";
import { microToUsd } from "@mintfeed/shared";

const VOLUME_THOUSAND = 1_000;
const VOLUME_MILLION = 1_000_000;

function formatVolume(volumeMicro: number): string {
  const usd = microToUsd(volumeMicro);
  if (usd >= VOLUME_MILLION) {
    return `$${(usd / VOLUME_MILLION).toFixed(1)}M`;
  }
  if (usd >= VOLUME_THOUSAND) {
    return `$${(usd / VOLUME_THOUSAND).toFixed(1)}K`;
  }
  return `$${usd.toFixed(2)}`;
}

interface MarketRowProps {
  market: PredictionMarketDetail;
  onPress: (market: PredictionMarketDetail) => void;
}

export const MarketRow = memo(function MarketRow({
  market,
  onPress,
}: MarketRowProps) {
  const theme = useAppStore((s) => s.theme);
  const themeColors = colors[theme];

  const yesPercent = Math.round(microToUsd(market.pricing.buyYesPriceUsd) * 100);
  const noPercent = Math.round(microToUsd(market.pricing.buyNoPriceUsd) * 100);
  const isOpen = market.status === "open";

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: themeColors.card, borderColor: themeColors.border },
        pressed && { opacity: 0.7 },
      ]}
      onPress={() => onPress(market)}
    >
      {/* Market title and status */}
      <View style={styles.header}>
        <Text
          style={[styles.title, { color: themeColors.text }]}
          numberOfLines={2}
        >
          {market.metadata.title}
        </Text>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: isOpen
                ? "rgba(0, 255, 102, 0.12)"
                : "rgba(230, 0, 0, 0.12)",
            },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: isOpen ? themeColors.positive : themeColors.negative },
            ]}
          >
            {market.status.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Probability bar */}
      <View style={styles.barSection}>
        <View style={styles.barLabels}>
          <Text style={[styles.yesLabel, { color: themeColors.positive }]}>
            YES {yesPercent}%
          </Text>
          <Text style={[styles.noLabel, { color: themeColors.negative }]}>
            {noPercent}% NO
          </Text>
        </View>
        <View
          style={[styles.barTrack, { backgroundColor: themeColors.border }]}
        >
          <View
            style={[
              styles.barFillYes,
              {
                width: `${yesPercent}%`,
                backgroundColor: themeColors.positive,
              },
            ]}
          />
        </View>
      </View>

      {/* Volume */}
      <Text style={[styles.volume, { color: themeColors.textMuted }]}>
        Vol {formatVolume(market.pricing.volume)}
      </Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    borderCurve: "continuous",
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
    gap: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  title: {
    flex: 1,
    fontFamily: fonts.body.semiBold,
    fontSize: fontSize.base,
    lineHeight: 18,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderCurve: "continuous",
  },
  statusText: {
    fontFamily: fonts.mono.bold,
    fontSize: fontSize.xxs,
    letterSpacing: letterSpacing.wide,
  },
  barSection: {
    gap: 4,
  },
  barLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  yesLabel: {
    fontFamily: fonts.mono.bold,
    fontSize: fontSize.sm,
    letterSpacing: letterSpacing.wide,
  },
  noLabel: {
    fontFamily: fonts.mono.bold,
    fontSize: fontSize.sm,
    letterSpacing: letterSpacing.wide,
  },
  barTrack: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  barFillYes: {
    height: "100%",
    borderRadius: 2,
  },
  volume: {
    fontFamily: fonts.mono.regular,
    fontSize: fontSize.xxs,
    letterSpacing: letterSpacing.wide,
    textTransform: "uppercase",
  },
});

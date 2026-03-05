import { memo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";
import { fonts, fontSize, letterSpacing } from "@/constants/typography";
import { useAppStore } from "@/lib/store";
import type { PredictionPosition } from "@mintfeed/shared";
import { microToUsd } from "@mintfeed/shared";

interface PositionCardProps {
  position: PredictionPosition;
  onClose: (pubkey: string) => void;
  onClaim: (pubkey: string) => void;
}

export const PositionCard = memo(function PositionCard({
  position,
  onClose,
  onClaim,
}: PositionCardProps) {
  const theme = useAppStore((s) => s.theme);
  const themeColors = colors[theme];

  const pnl = microToUsd(position.pnlUsd);
  const costBasis = microToUsd(position.costBasisUsd);
  const contracts = parseFloat(position.contracts);
  const isPnlPositive = pnl >= 0;
  const isMarketActive = position.market?.status === "open";

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: themeColors.card, borderColor: themeColors.border },
      ]}
    >
      {/* Header: title + side badge */}
      <View style={styles.header}>
        <Text
          style={[styles.title, { color: themeColors.text }]}
          numberOfLines={2}
        >
          {position.market?.title ?? position.marketId}
        </Text>
        <View
          style={[
            styles.sideBadge,
            {
              backgroundColor: position.isYes
                ? "rgba(0, 255, 102, 0.15)"
                : "rgba(230, 0, 0, 0.15)",
            },
          ]}
        >
          <Text
            style={[
              styles.sideBadgeText,
              {
                color: position.isYes
                  ? themeColors.positive
                  : themeColors.negative,
              },
            ]}
          >
            {position.isYes ? "YES" : "NO"}
          </Text>
        </View>
      </View>

      {/* Metrics row */}
      <View style={styles.metricsRow}>
        <View style={styles.metric}>
          <Text style={[styles.metricLabel, { color: themeColors.textMuted }]}>
            Contracts
          </Text>
          <Text style={[styles.metricValue, { color: themeColors.text }]}>
            {contracts.toFixed(2)}
          </Text>
        </View>

        <View style={styles.metric}>
          <Text style={[styles.metricLabel, { color: themeColors.textMuted }]}>
            Cost Basis
          </Text>
          <Text style={[styles.metricValue, { color: themeColors.text }]}>
            ${costBasis.toFixed(2)}
          </Text>
        </View>

        <View style={styles.metric}>
          <Text style={[styles.metricLabel, { color: themeColors.textMuted }]}>
            P&L
          </Text>
          <Text
            style={[
              styles.metricValue,
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
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        {position.claimable && (
          <Pressable
            style={({ pressed }) => [
              styles.claimButton,
              { backgroundColor: themeColors.accent },
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => onClaim(position.pubkey)}
          >
            <Ionicons name="gift-outline" size={14} color="#ffffff" />
            <Text style={styles.claimButtonText}>Claim</Text>
          </Pressable>
        )}

        {isMarketActive && (
          <Pressable
            style={({ pressed }) => [
              styles.closeButton,
              { borderColor: themeColors.textMuted },
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => onClose(position.pubkey)}
          >
            <Text
              style={[
                styles.closeButtonText,
                { color: themeColors.textMuted },
              ]}
            >
              Close
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderCurve: "continuous",
    borderWidth: 1,
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  title: {
    flex: 1,
    fontFamily: fonts.body.semiBold,
    fontSize: fontSize.base,
    lineHeight: 18,
  },
  sideBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderCurve: "continuous",
  },
  sideBadgeText: {
    fontFamily: fonts.mono.bold,
    fontSize: fontSize.xs,
    letterSpacing: letterSpacing.wider,
  },
  metricsRow: {
    flexDirection: "row",
    gap: 16,
  },
  metric: {
    flex: 1,
    gap: 2,
  },
  metricLabel: {
    fontFamily: fonts.mono.regular,
    fontSize: fontSize.xxs,
    letterSpacing: letterSpacing.wide,
    textTransform: "uppercase",
  },
  metricValue: {
    fontFamily: fonts.mono.bold,
    fontSize: fontSize.base,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  claimButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    borderCurve: "continuous",
  },
  claimButtonText: {
    fontFamily: fonts.body.bold,
    fontSize: fontSize.sm,
    color: "#ffffff",
    letterSpacing: letterSpacing.wide,
  },
  closeButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    borderCurve: "continuous",
    borderWidth: 1,
  },
  closeButtonText: {
    fontFamily: fonts.body.semiBold,
    fontSize: fontSize.sm,
    letterSpacing: letterSpacing.wide,
  },
});

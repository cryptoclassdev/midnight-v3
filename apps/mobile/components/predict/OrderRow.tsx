import { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore } from "@/lib/store";
import { colors } from "@/constants/theme";
import { fonts, fontSize, letterSpacing } from "@/constants/typography";
import { microToUsd } from "@mintfeed/shared";
import type { PredictionOrder } from "@mintfeed/shared";

interface OrderRowProps {
  order: PredictionOrder;
}

export const OrderRow = memo(function OrderRow({ order }: OrderRowProps) {
  const theme = useAppStore((s) => s.theme);
  const themeColors = colors[theme];

  const isBuy = order.isBuy;
  const price = microToUsd(order.priceUsd);
  const contracts = Number(order.contracts);

  return (
    <View
      style={[
        styles.row,
        { backgroundColor: themeColors.card, borderColor: themeColors.cardBorder },
      ]}
      accessibilityRole="text"
      accessibilityLabel={`${isBuy ? "Buy" : "Sell"} ${order.isYes ? "Yes" : "No"}, ${contracts} shares at ${price.toFixed(2)} dollars`}
    >
      <View style={styles.left}>
        <View style={styles.typeRow}>
          <Ionicons
            name={isBuy ? "arrow-down-circle" : "arrow-up-circle"}
            size={16}
            color={isBuy ? themeColors.positive : themeColors.negative}
          />
          <Text
            style={[
              styles.typeText,
              { color: isBuy ? themeColors.positive : themeColors.negative },
            ]}
          >
            {isBuy ? "BUY" : "SELL"}
          </Text>
          <View
            style={[
              styles.sidePill,
              {
                backgroundColor: order.isYes
                  ? themeColors.positive + "18"
                  : themeColors.negative + "18",
              },
            ]}
          >
            <Text
              style={[
                styles.sideText,
                {
                  color: order.isYes
                    ? themeColors.positive
                    : themeColors.negative,
                },
              ]}
            >
              {order.isYes ? "YES" : "NO"}
            </Text>
          </View>
        </View>
        <Text
          style={[styles.detail, { color: themeColors.textMuted }]}
          numberOfLines={1}
        >
          {contracts} shares · ${price.toFixed(2)}
        </Text>
      </View>
      <View
        style={[
          styles.statusPill,
          {
            backgroundColor:
              order.status === "filled"
                ? themeColors.positive + "18"
                : themeColors.textFaint + "30",
          },
        ]}
      >
        <Text
          style={[
            styles.statusText,
            {
              color:
                order.status === "filled"
                  ? themeColors.positive
                  : themeColors.textMuted,
            },
          ]}
        >
          {order.status.toUpperCase()}
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 10,
    borderCurve: "continuous",
    borderWidth: 0.5,
  },
  left: {
    flex: 1,
    gap: 4,
  },
  typeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  typeText: {
    fontFamily: fonts.mono.bold,
    fontSize: 10,
    letterSpacing: letterSpacing.wide,
  },
  sidePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderCurve: "continuous",
  },
  sideText: {
    fontFamily: fonts.mono.bold,
    fontSize: 9,
    letterSpacing: letterSpacing.wide,
  },
  detail: {
    fontFamily: fonts.mono.regular,
    fontSize: fontSize.xs,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderCurve: "continuous",
  },
  statusText: {
    fontFamily: fonts.mono.bold,
    fontSize: 9,
    letterSpacing: letterSpacing.wide,
  },
});

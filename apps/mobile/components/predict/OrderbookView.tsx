import { memo, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "@/constants/theme";
import { fonts, fontSize, letterSpacing } from "@/constants/typography";
import { useAppStore } from "@/lib/store";
import type { OrderbookData } from "@mintfeed/shared";
import { microToUsd } from "@mintfeed/shared";

const MAX_DISPLAY_ROWS = 8;

interface OrderbookViewProps {
  orderbook: OrderbookData;
}

interface OrderRow {
  price: number;
  quantity: number;
}

function processOrders(
  entries: [number, number][],
  maxRows: number,
): OrderRow[] {
  return entries.slice(0, maxRows).map(([price, quantity]) => ({
    price: microToUsd(price),
    quantity,
  }));
}

export const OrderbookView = memo(function OrderbookView({
  orderbook,
}: OrderbookViewProps) {
  const theme = useAppStore((s) => s.theme);
  const themeColors = colors[theme];

  const yesBids = useMemo(
    () => processOrders(orderbook.yes, MAX_DISPLAY_ROWS),
    [orderbook.yes],
  );
  const noBids = useMemo(
    () => processOrders(orderbook.no, MAX_DISPLAY_ROWS),
    [orderbook.no],
  );

  const maxYesQty = useMemo(
    () => Math.max(...yesBids.map((r) => r.quantity), 1),
    [yesBids],
  );
  const maxNoQty = useMemo(
    () => Math.max(...noBids.map((r) => r.quantity), 1),
    [noBids],
  );

  const maxRows = Math.max(yesBids.length, noBids.length);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: themeColors.card, borderColor: themeColors.border },
      ]}
    >
      {/* Column headers */}
      <View style={styles.headerRow}>
        <View style={styles.column}>
          <Text style={[styles.headerText, { color: themeColors.positive }]}>
            YES BIDS
          </Text>
        </View>
        <View style={styles.column}>
          <Text
            style={[
              styles.headerText,
              { color: themeColors.negative, textAlign: "right" },
            ]}
          >
            NO BIDS
          </Text>
        </View>
      </View>

      {/* Sub-headers */}
      <View style={styles.headerRow}>
        <View style={styles.subHeaderRow}>
          <Text
            style={[styles.subHeaderText, { color: themeColors.textMuted }]}
          >
            QTY
          </Text>
          <Text
            style={[styles.subHeaderText, { color: themeColors.textMuted }]}
          >
            PRICE
          </Text>
        </View>
        <View style={styles.subHeaderRow}>
          <Text
            style={[styles.subHeaderText, { color: themeColors.textMuted }]}
          >
            PRICE
          </Text>
          <Text
            style={[
              styles.subHeaderText,
              { color: themeColors.textMuted, textAlign: "right" },
            ]}
          >
            QTY
          </Text>
        </View>
      </View>

      {/* Order rows */}
      {Array.from({ length: maxRows }).map((_, index) => {
        const yesEntry = yesBids[index];
        const noEntry = noBids[index];

        return (
          <View key={index} style={styles.row}>
            {/* YES side (left) */}
            <View style={styles.column}>
              {yesEntry ? (
                <View style={styles.yesRow}>
                  <View
                    style={[
                      styles.barBackground,
                      {
                        backgroundColor: "rgba(0, 255, 102, 0.1)",
                        width: `${(yesEntry.quantity / maxYesQty) * 100}%`,
                      },
                    ]}
                  />
                  <Text
                    style={[styles.qtyText, { color: themeColors.textSecondary }]}
                  >
                    {yesEntry.quantity}
                  </Text>
                  <Text
                    style={[styles.priceText, { color: themeColors.positive }]}
                  >
                    ${yesEntry.price.toFixed(2)}
                  </Text>
                </View>
              ) : (
                <View style={styles.emptyRow} />
              )}
            </View>

            {/* NO side (right) */}
            <View style={styles.column}>
              {noEntry ? (
                <View style={styles.noRow}>
                  <View
                    style={[
                      styles.barBackgroundRight,
                      {
                        backgroundColor: "rgba(230, 0, 0, 0.1)",
                        width: `${(noEntry.quantity / maxNoQty) * 100}%`,
                      },
                    ]}
                  />
                  <Text
                    style={[styles.priceText, { color: themeColors.negative }]}
                  >
                    ${noEntry.price.toFixed(2)}
                  </Text>
                  <Text
                    style={[
                      styles.qtyText,
                      { color: themeColors.textSecondary, textAlign: "right" },
                    ]}
                  >
                    {noEntry.quantity}
                  </Text>
                </View>
              ) : (
                <View style={styles.emptyRow} />
              )}
            </View>
          </View>
        );
      })}

      {maxRows === 0 && (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: themeColors.textMuted }]}>
            No orders
          </Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    borderCurve: "continuous",
    borderWidth: 1,
    padding: 10,
    gap: 1,
  },
  headerRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 2,
  },
  column: {
    flex: 1,
  },
  headerText: {
    fontFamily: fonts.mono.bold,
    fontSize: fontSize.xxs,
    letterSpacing: letterSpacing.wider,
  },
  subHeaderRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  subHeaderText: {
    fontFamily: fonts.mono.regular,
    fontSize: fontSize.xxs,
    letterSpacing: letterSpacing.wide,
  },
  row: {
    flexDirection: "row",
    gap: 8,
    height: 24,
  },
  yesRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
    paddingHorizontal: 4,
  },
  noRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
    paddingHorizontal: 4,
  },
  barBackground: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 2,
  },
  barBackgroundRight: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 2,
  },
  priceText: {
    fontFamily: fonts.mono.regular,
    fontSize: fontSize.xs,
  },
  qtyText: {
    fontFamily: fonts.mono.regular,
    fontSize: fontSize.xs,
  },
  emptyRow: {
    height: 24,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 16,
  },
  emptyText: {
    fontFamily: fonts.mono.regular,
    fontSize: fontSize.xs,
  },
});

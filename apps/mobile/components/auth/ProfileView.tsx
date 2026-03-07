import { useState } from "react";
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";
import { fonts, fontSize, letterSpacing } from "@/constants/typography";
import { useAppStore } from "@/lib/store";
import { formatSolanaAddress } from "@/lib/solana";
import { usePredictionPositions } from "@/hooks/usePredictionPositions";
import { usePredictionOrders } from "@/hooks/usePredictionOrders";
import { PositionCard } from "@/components/predict/PositionCard";
import { OrderRow } from "@/components/predict/OrderRow";
import { microToUsd } from "@mintfeed/shared";

export default function ProfileView() {
  const theme = useAppStore((s) => s.theme);
  const themeColors = colors[theme];
  const walletAddress = useAppStore((s) => s.walletAddress);
  const disconnectWallet = useAppStore((s) => s.disconnectWallet);

  const { data: positionsData, isLoading: positionsLoading } =
    usePredictionPositions(walletAddress ?? undefined);
  const { data: ordersData, isLoading: ordersLoading } =
    usePredictionOrders(walletAddress ?? undefined);

  const positions = positionsData?.data ?? [];
  const orders = ordersData?.data ?? [];

  const displayName = walletAddress
    ? formatSolanaAddress(walletAddress)
    : "User";

  const totalValue = positions.reduce(
    (sum, p) => sum + microToUsd(p.costBasisUsd) + microToUsd(p.pnlUsd),
    0,
  );
  const totalPnl = positions.reduce((sum, p) => sum + microToUsd(p.pnlUsd), 0);
  const hasPositions = positions.length > 0;
  const hasOrders = orders.length > 0;
  const [showOrders, setShowOrders] = useState(false);

  return (
    <View style={styles.container}>
      {/* Wallet Section */}
      <View style={styles.section}>
        <Text
          style={[styles.sectionTitle, { color: themeColors.textMuted }]}
        >
          WALLET
        </Text>
        <View
          style={[
            styles.row,
            {
              backgroundColor: themeColors.card,
              borderColor: themeColors.cardBorder,
            },
          ]}
        >
          <View style={styles.walletRow}>
            <Ionicons name="wallet-outline" size={18} color={themeColors.accentMint} />
            <View>
              <Text style={[styles.rowLabel, { color: themeColors.text }]}>
                {displayName}
              </Text>
              {walletAddress && (
                <Text style={[styles.walletFull, { color: themeColors.textMuted }]}>
                  {walletAddress}
                </Text>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Positions Section */}
      <View style={styles.section}>
        <Text
          style={[styles.sectionTitle, { color: themeColors.textMuted }]}
        >
          MY POSITIONS
        </Text>

        {/* Portfolio Summary */}
        {hasPositions && (
          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor: themeColors.card,
                borderColor: themeColors.cardBorder,
              },
            ]}
          >
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: themeColors.textMuted }]}>
                TOTAL VALUE
              </Text>
              <Text style={[styles.summaryValue, { color: themeColors.text }]}>
                ${totalValue.toFixed(2)}
              </Text>
            </View>
            <View
              style={[styles.summaryDivider, { backgroundColor: themeColors.border }]}
            />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: themeColors.textMuted }]}>
                TOTAL P&L
              </Text>
              <Text
                style={[
                  styles.summaryValue,
                  {
                    color:
                      totalPnl >= 0
                        ? themeColors.positive
                        : themeColors.negative,
                  },
                ]}
              >
                {totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(2)}
              </Text>
            </View>
            <View
              style={[styles.summaryDivider, { backgroundColor: themeColors.border }]}
            />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: themeColors.textMuted }]}>
                ACTIVE
              </Text>
              <Text style={[styles.summaryValue, { color: themeColors.text }]}>
                {positions.length}
              </Text>
            </View>
          </View>
        )}

        {positionsLoading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={themeColors.accent} />
          </View>
        )}

        {!positionsLoading && !hasPositions && (
          <View
            style={[
              styles.emptyState,
              {
                backgroundColor: themeColors.card,
                borderColor: themeColors.cardBorder,
              },
            ]}
          >
            <Ionicons
              name="analytics-outline"
              size={28}
              color={themeColors.textFaint}
            />
            <Text
              style={[styles.emptyTitle, { color: themeColors.textMuted }]}
            >
              No open positions
            </Text>
            <Text
              style={[styles.emptySubtitle, { color: themeColors.textFaint }]}
            >
              Bet on prediction markets from the feed to see your positions here.
            </Text>
          </View>
        )}

        <View style={styles.positionsList}>
          {positions.map((position) => (
            <PositionCard key={position.pubkey} position={position} />
          ))}
        </View>
      </View>

      {/* Order History Section — collapsed by default */}
      <View style={styles.section}>
        <Pressable
          style={styles.sectionToggle}
          onPress={() => setShowOrders((prev) => !prev)}
          accessibilityRole="button"
          accessibilityLabel={showOrders ? "Hide order history" : "Show order history"}
        >
          <Text
            style={[styles.sectionTitle, { color: themeColors.textMuted, marginBottom: 0 }]}
          >
            ORDER HISTORY{hasOrders ? ` (${orders.length})` : ""}
          </Text>
          <Ionicons
            name={showOrders ? "chevron-up" : "chevron-down"}
            size={14}
            color={themeColors.textMuted}
          />
        </Pressable>

        {showOrders && (
          <>
            {ordersLoading && (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color={themeColors.accent} />
              </View>
            )}

            {!ordersLoading && !hasOrders && (
              <View
                style={[
                  styles.emptyState,
                  {
                    backgroundColor: themeColors.card,
                    borderColor: themeColors.cardBorder,
                  },
                ]}
              >
                <Text
                  style={[styles.emptyTitle, { color: themeColors.textMuted }]}
                >
                  No trades yet
                </Text>
              </View>
            )}

            <View style={styles.ordersList}>
              {orders.map((order) => (
                <OrderRow key={order.pubkey} order={order} />
              ))}
            </View>
          </>
        )}
      </View>

      {/* Disconnect */}
      <View style={styles.section}>
        <Pressable
          style={[
            styles.signOutButton,
            {
              backgroundColor: themeColors.card,
              borderColor: themeColors.border,
            },
          ]}
          onPress={disconnectWallet}
          accessibilityRole="button"
          accessibilityLabel="Disconnect wallet"
        >
          <Text style={[styles.signOutText, { color: themeColors.negative }]}>
            Disconnect
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: fonts.brand.bold,
    fontSize: fontSize.xxs,
    letterSpacing: letterSpacing.wider,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  sectionToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    borderCurve: "continuous",
    borderWidth: 0.5,
  },
  walletRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rowLabel: {
    fontFamily: fonts.brand.regular,
    fontSize: fontSize.base,
  },
  walletFull: {
    fontFamily: fonts.mono.regular,
    fontSize: 10,
    marginTop: 2,
  },

  // Summary
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderCurve: "continuous",
    borderWidth: 0.5,
    marginBottom: 12,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  summaryLabel: {
    fontFamily: fonts.mono.regular,
    fontSize: 9,
    letterSpacing: letterSpacing.wide,
    textTransform: "uppercase",
  },
  summaryValue: {
    fontFamily: fonts.mono.bold,
    fontSize: fontSize.base,
  },
  summaryDivider: {
    width: 1,
    height: 28,
    marginHorizontal: 4,
  },

  // Empty states
  emptyState: {
    alignItems: "center",
    padding: 24,
    borderRadius: 12,
    borderCurve: "continuous",
    borderWidth: 0.5,
    gap: 6,
  },
  emptyTitle: {
    fontFamily: fonts.brand.bold,
    fontSize: fontSize.base,
    marginTop: 4,
  },
  emptySubtitle: {
    fontFamily: fonts.brand.regular,
    fontSize: fontSize.sm,
    textAlign: "center",
    maxWidth: 240,
    lineHeight: 16,
  },

  // Lists
  positionsList: {
    gap: 10,
  },
  ordersList: {
    gap: 8,
  },

  loadingRow: {
    alignItems: "center",
    paddingVertical: 20,
  },
  signOutButton: {
    padding: 16,
    borderRadius: 12,
    borderCurve: "continuous",
    borderWidth: 0.5,
    alignItems: "center",
  },
  signOutText: {
    fontFamily: fonts.brand.bold,
    fontSize: fontSize.base,
  },
});

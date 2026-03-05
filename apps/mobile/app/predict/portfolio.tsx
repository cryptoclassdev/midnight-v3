import { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore } from "@/lib/store";
import { colors } from "@/constants/theme";
import { fonts, fontSize, letterSpacing } from "@/constants/typography";
import { usePredictionPositions, usePredictionOrders, usePredictionHistory } from "@/hooks/usePredictionPositions";
import { useClosePosition, useClaimPosition } from "@/hooks/usePredictionTrading";
import { PositionCard } from "@/components/predict/PositionCard";
import { microToUsd } from "@mintfeed/shared";
import type { PredictionPosition, PredictionOrder, HistoryEvent } from "@mintfeed/shared";

type PortfolioTab = "positions" | "orders" | "history";

const TABS: { key: PortfolioTab; label: string }[] = [
  { key: "positions", label: "Positions" },
  { key: "orders", label: "Orders" },
  { key: "history", label: "History" },
];

export default function PortfolioScreen() {
  const router = useRouter();
  const theme = useAppStore((s) => s.theme);
  const walletAddress = useAppStore((s) => s.walletAddress);
  const themeColors = colors[theme];

  const [activeTab, setActiveTab] = useState<PortfolioTab>("positions");

  const {
    data: positionsData,
    isLoading: positionsLoading,
    refetch: refetchPositions,
    isRefetching: positionsRefetching,
  } = usePredictionPositions(walletAddress ?? undefined);

  const {
    data: ordersData,
    isLoading: ordersLoading,
    refetch: refetchOrders,
    isRefetching: ordersRefetching,
  } = usePredictionOrders(walletAddress ?? undefined);

  const {
    data: historyData,
    isLoading: historyLoading,
    refetch: refetchHistory,
    isRefetching: historyRefetching,
  } = usePredictionHistory(walletAddress ?? undefined);

  const closePosition = useClosePosition();
  const claimPosition = useClaimPosition();

  const positions = positionsData?.data ?? [];
  const orders = ordersData?.data ?? [];
  const historyEvents = historyData?.data ?? [];

  const totalPnl = useMemo(() => {
    return positions.reduce((sum, pos) => sum + microToUsd(pos.pnlUsd), 0);
  }, [positions]);

  const isPnlPositive = totalPnl >= 0;

  const handleClosePosition = useCallback(
    async (pubkey: string) => {
      if (!walletAddress) return;
      try {
        await closePosition.mutateAsync({
          positionPubkey: pubkey,
          ownerPubkey: walletAddress,
        });
        Alert.alert("Position Closed", "Your position has been closed successfully.");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to close position";
        Alert.alert("Close Failed", message);
      }
    },
    [closePosition, walletAddress],
  );

  const handleClaimPosition = useCallback(
    async (pubkey: string) => {
      if (!walletAddress) return;
      try {
        await claimPosition.mutateAsync({
          positionPubkey: pubkey,
          ownerPubkey: walletAddress,
        });
        Alert.alert("Position Claimed", "Your winnings have been claimed successfully.");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to claim position";
        Alert.alert("Claim Failed", message);
      }
    },
    [claimPosition, walletAddress],
  );

  const handleRefresh = useCallback(() => {
    if (activeTab === "positions") refetchPositions();
    else if (activeTab === "orders") refetchOrders();
    else refetchHistory();
  }, [activeTab, refetchPositions, refetchOrders, refetchHistory]);

  const isRefreshing =
    activeTab === "positions"
      ? positionsRefetching
      : activeTab === "orders"
        ? ordersRefetching
        : historyRefetching;

  const renderPositionItem = useCallback(
    ({ item }: { item: PredictionPosition }) => (
      <PositionCard
        position={item}
        onClose={(pubkey) => handleClosePosition(pubkey)}
        onClaim={(pubkey) => handleClaimPosition(pubkey)}
      />
    ),
    [handleClosePosition, handleClaimPosition],
  );

  const renderOrderItem = useCallback(
    ({ item }: { item: PredictionOrder }) => (
      <View
        style={[
          styles.orderRow,
          { backgroundColor: themeColors.card, borderColor: themeColors.border },
        ]}
      >
        <View style={styles.orderHeader}>
          <View
            style={[
              styles.orderSideBadge,
              {
                backgroundColor: item.isYes
                  ? "rgba(0, 255, 102, 0.12)"
                  : "rgba(230, 0, 0, 0.12)",
              },
            ]}
          >
            <Text
              style={[
                styles.orderSideText,
                {
                  color: item.isYes
                    ? themeColors.positive
                    : themeColors.negative,
                },
              ]}
            >
              {item.isBuy ? "BUY" : "SELL"} {item.isYes ? "YES" : "NO"}
            </Text>
          </View>
          <Text style={[styles.orderStatus, { color: themeColors.textMuted }]}>
            {item.status.toUpperCase()}
          </Text>
        </View>
        <View style={styles.orderDetails}>
          <View style={styles.orderDetail}>
            <Text style={[styles.orderDetailLabel, { color: themeColors.textMuted }]}>
              CONTRACTS
            </Text>
            <Text style={[styles.orderDetailValue, { color: themeColors.text }]}>
              {item.contracts}
            </Text>
          </View>
          <View style={styles.orderDetail}>
            <Text style={[styles.orderDetailLabel, { color: themeColors.textMuted }]}>
              PRICE
            </Text>
            <Text style={[styles.orderDetailValue, { color: themeColors.text }]}>
              ${microToUsd(item.priceUsd).toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
    ),
    [themeColors],
  );

  const renderHistoryItem = useCallback(
    ({ item }: { item: HistoryEvent }) => (
      <View
        style={[
          styles.historyRow,
          { borderBottomColor: themeColors.border },
        ]}
      >
        <View style={styles.historyLeft}>
          <View
            style={[
              styles.historyTypeBadge,
              { backgroundColor: themeColors.border },
            ]}
          >
            <Text style={[styles.historyTypeText, { color: themeColors.textSecondary }]}>
              {item.type.toUpperCase()}
            </Text>
          </View>
          <Text
            style={[styles.historyTimestamp, { color: themeColors.textMuted }]}
          >
            {new Date(item.timestamp).toLocaleDateString()}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={themeColors.textMuted} />
      </View>
    ),
    [themeColors],
  );

  const renderEmpty = useCallback(
    (message: string) => () =>
      (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="folder-open-outline"
            size={40}
            color={themeColors.textMuted}
          />
          <Text style={[styles.emptyText, { color: themeColors.textMuted }]}>
            {message}
          </Text>
        </View>
      ),
    [themeColors],
  );

  if (!walletAddress) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: themeColors.background }]}
        edges={["top"]}
      >
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            style={({ pressed }) => [pressed && { opacity: 0.7 }]}
          >
            <Ionicons name="chevron-back" size={24} color={themeColors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: themeColors.text }]}>
            Portfolio
          </Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.walletPrompt}>
          <Ionicons name="wallet-outline" size={48} color={themeColors.textMuted} />
          <Text style={[styles.walletPromptTitle, { color: themeColors.text }]}>
            Connect Wallet
          </Text>
          <Text style={[styles.walletPromptSubtitle, { color: themeColors.textMuted }]}>
            Connect your wallet to view your positions, orders, and history.
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.connectButton,
              { backgroundColor: themeColors.accent },
              pressed && { opacity: 0.8 },
            ]}
            onPress={() => router.push("/(tabs)/settings")}
          >
            <Text style={styles.connectButtonText}>Go to Settings</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

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
          Portfolio
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* P&L Summary */}
      {activeTab === "positions" && positions.length > 0 && (
        <View style={[styles.pnlSummary, { borderColor: themeColors.border }]}>
          <Text style={[styles.pnlLabel, { color: themeColors.textMuted }]}>
            TOTAL P&L
          </Text>
          <Text
            style={[
              styles.pnlValue,
              {
                color: isPnlPositive
                  ? themeColors.positive
                  : themeColors.negative,
              },
            ]}
          >
            {isPnlPositive ? "+" : ""}${totalPnl.toFixed(2)}
          </Text>
        </View>
      )}

      {/* Tab bar */}
      <View style={[styles.tabBar, { borderBottomColor: themeColors.border }]}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              style={[
                styles.tab,
                isActive && {
                  borderBottomColor: themeColors.accent,
                  borderBottomWidth: 2,
                },
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: isActive
                      ? themeColors.text
                      : themeColors.textMuted,
                  },
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Tab content */}
      {activeTab === "positions" && (
        <FlatList
          data={positions}
          renderItem={renderPositionItem}
          keyExtractor={(item) => item.pubkey}
          ListEmptyComponent={
            positionsLoading ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="small" color={themeColors.accent} />
              </View>
            ) : (
              renderEmpty("No open positions")()
            )
          }
          onRefresh={handleRefresh}
          refreshing={isRefreshing}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {activeTab === "orders" && (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.pubkey}
          ListEmptyComponent={
            ordersLoading ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="small" color={themeColors.accent} />
              </View>
            ) : (
              renderEmpty("No pending orders")()
            )
          }
          onRefresh={handleRefresh}
          refreshing={isRefreshing}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {activeTab === "history" && (
        <FlatList
          data={historyEvents}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => String(item.id)}
          ListEmptyComponent={
            historyLoading ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="small" color={themeColors.accent} />
              </View>
            ) : (
              renderEmpty("No history yet")()
            )
          }
          onRefresh={handleRefresh}
          refreshing={isRefreshing}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  pnlSummary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 10,
    borderCurve: "continuous",
    marginBottom: 8,
  },
  pnlLabel: {
    fontFamily: fonts.mono.regular,
    fontSize: fontSize.xxs,
    letterSpacing: letterSpacing.wider,
  },
  pnlValue: {
    fontFamily: fonts.mono.bold,
    fontSize: fontSize.lg,
  },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
  },
  tabText: {
    fontFamily: fonts.mono.bold,
    fontSize: fontSize.sm,
    letterSpacing: letterSpacing.wide,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 100,
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
  walletPrompt: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 12,
  },
  walletPromptTitle: {
    fontFamily: fonts.body.bold,
    fontSize: fontSize.xl,
  },
  walletPromptSubtitle: {
    fontFamily: fonts.body.regular,
    fontSize: fontSize.base,
    textAlign: "center",
    lineHeight: 22,
  },
  connectButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    borderCurve: "continuous",
    marginTop: 8,
  },
  connectButtonText: {
    fontFamily: fonts.body.bold,
    fontSize: fontSize.base,
    color: "#ffffff",
  },
  orderRow: {
    borderRadius: 10,
    borderCurve: "continuous",
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
    gap: 8,
  },
  orderHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  orderSideBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderCurve: "continuous",
  },
  orderSideText: {
    fontFamily: fonts.mono.bold,
    fontSize: fontSize.xxs,
    letterSpacing: letterSpacing.wide,
  },
  orderStatus: {
    fontFamily: fonts.mono.regular,
    fontSize: fontSize.xxs,
    letterSpacing: letterSpacing.wide,
  },
  orderDetails: {
    flexDirection: "row",
    gap: 16,
  },
  orderDetail: {
    gap: 2,
  },
  orderDetailLabel: {
    fontFamily: fonts.mono.regular,
    fontSize: fontSize.xxs,
    letterSpacing: letterSpacing.wide,
  },
  orderDetailValue: {
    fontFamily: fonts.mono.bold,
    fontSize: fontSize.sm,
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  historyLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  historyTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderCurve: "continuous",
  },
  historyTypeText: {
    fontFamily: fonts.mono.bold,
    fontSize: fontSize.xxs,
    letterSpacing: letterSpacing.wide,
  },
  historyTimestamp: {
    fontFamily: fonts.mono.regular,
    fontSize: fontSize.xs,
  },
});

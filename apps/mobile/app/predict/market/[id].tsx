import { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore } from "@/lib/store";
import { colors } from "@/constants/theme";
import { fonts, fontSize, letterSpacing } from "@/constants/typography";
import { usePredictionMarketDetail, usePredictionOrderbook } from "@/hooks/usePredictionMarket";
import { useCreateOrder } from "@/hooks/usePredictionTrading";
import { OrderbookView } from "@/components/predict/OrderbookView";
import { OrderSheet } from "@/components/predict/OrderSheet";
import { microToUsd, USDC_MINT } from "@mintfeed/shared";

const PERCENTAGE_MULTIPLIER = 100;

export default function MarketDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useAppStore((s) => s.theme);
  const walletAddress = useAppStore((s) => s.walletAddress);
  const themeColors = colors[theme];

  const { data: market, isLoading: marketLoading } = usePredictionMarketDetail(id);
  const { data: orderbook } = usePredictionOrderbook(id);
  const createOrder = useCreateOrder();

  const [orderSheetVisible, setOrderSheetVisible] = useState(false);
  const [initialSide, setInitialSide] = useState<"yes" | "no">("yes");

  const yesPrice = market ? microToUsd(market.pricing.buyYesPriceUsd) : 0;
  const noPrice = market ? microToUsd(market.pricing.buyNoPriceUsd) : 0;
  const yesPercent = Math.round(yesPrice * PERCENTAGE_MULTIPLIER);
  const noPercent = Math.round(noPrice * PERCENTAGE_MULTIPLIER);

  const handleBuyYes = useCallback(() => {
    if (!walletAddress) {
      router.push("/(tabs)/settings");
      return;
    }
    setInitialSide("yes");
    setOrderSheetVisible(true);
  }, [walletAddress, router]);

  const handleBuyNo = useCallback(() => {
    if (!walletAddress) {
      router.push("/(tabs)/settings");
      return;
    }
    setInitialSide("no");
    setOrderSheetVisible(true);
  }, [walletAddress, router]);

  const handleCloseSheet = useCallback(() => {
    setOrderSheetVisible(false);
  }, []);

  const handleSubmitOrder = useCallback(
    async (order: { marketId: string; isYes: boolean; isBuy: boolean; depositAmount: string }) => {
      if (!walletAddress) return;
      try {
        await createOrder.mutateAsync({
          ownerPubkey: walletAddress,
          marketId: order.marketId,
          isYes: order.isYes,
          isBuy: order.isBuy,
          depositAmount: order.depositAmount,
          depositMint: USDC_MINT,
        });
        setOrderSheetVisible(false);
        Alert.alert("Order Placed", "Your order has been submitted successfully.");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to place order";
        Alert.alert("Order Failed", message);
      }
    },
    [createOrder, walletAddress],
  );

  if (marketLoading || !market) {
    return (
      <SafeAreaView
        style={[styles.container, styles.centered, { backgroundColor: themeColors.background }]}
        edges={["top"]}
      >
        <ActivityIndicator size="large" color={themeColors.accent} />
      </SafeAreaView>
    );
  }

  const isOpen = market.status === "open";

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

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Market question */}
        <Text style={[styles.marketTitle, { color: themeColors.text }]}>
          {market.metadata.title}
        </Text>

        {/* Price display */}
        <View style={styles.priceSection}>
          <View style={styles.priceBox}>
            <Text style={[styles.priceLabel, { color: themeColors.positive }]}>
              YES
            </Text>
            <Text style={[styles.priceValue, { color: themeColors.positive }]}>
              {yesPercent}%
            </Text>
          </View>
          <View style={styles.priceDivider}>
            <View
              style={[
                styles.dividerLine,
                { backgroundColor: themeColors.border },
              ]}
            />
          </View>
          <View style={styles.priceBox}>
            <Text style={[styles.priceLabel, { color: themeColors.negative }]}>
              NO
            </Text>
            <Text style={[styles.priceValue, { color: themeColors.negative }]}>
              {noPercent}%
            </Text>
          </View>
        </View>

        {/* Probability bar */}
        <View style={styles.probabilitySection}>
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
          <View style={styles.barLabels}>
            <Text style={[styles.barLabel, { color: themeColors.positive }]}>
              YES {yesPercent}%
            </Text>
            <Text style={[styles.barLabel, { color: themeColors.negative }]}>
              {noPercent}% NO
            </Text>
          </View>
        </View>

        {/* Orderbook */}
        {orderbook && (
          <View style={styles.orderbookSection}>
            <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>
              ORDERBOOK
            </Text>
            <OrderbookView orderbook={orderbook} />
          </View>
        )}
      </ScrollView>

      {/* Bottom action buttons */}
      {isOpen && (
        <View
          style={[
            styles.bottomActions,
            { borderTopColor: themeColors.border },
          ]}
        >
          <Pressable
            style={({ pressed }) => [
              styles.buyButton,
              styles.buyYesButton,
              pressed && { opacity: 0.8 },
            ]}
            onPress={handleBuyYes}
          >
            <Text style={styles.buyButtonText}>
              {walletAddress ? `Buy YES ${yesPercent}c` : "Connect Wallet"}
            </Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.buyButton,
              styles.buyNoButton,
              pressed && { opacity: 0.8 },
            ]}
            onPress={handleBuyNo}
          >
            <Text style={styles.buyNoButtonText}>
              {walletAddress ? `Buy NO ${noPercent}c` : "Connect Wallet"}
            </Text>
          </Pressable>
        </View>
      )}

      {/* Order Sheet */}
      {market && (
        <OrderSheet
          marketId={market.marketId}
          marketTitle={market.metadata.title}
          currentYesPrice={market.pricing.buyYesPriceUsd}
          currentNoPrice={market.pricing.buyNoPriceUsd}
          visible={orderSheetVisible}
          onClose={handleCloseSheet}
          onSubmitOrder={handleSubmitOrder}
        />
      )}
    </SafeAreaView>
  );
}

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
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderCurve: "continuous",
  },
  statusText: {
    fontFamily: fonts.mono.bold,
    fontSize: fontSize.xxs,
    letterSpacing: letterSpacing.wide,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 20,
  },
  marketTitle: {
    fontFamily: fonts.body.bold,
    fontSize: fontSize.xl,
    lineHeight: 30,
  },
  priceSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  priceBox: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  priceLabel: {
    fontFamily: fonts.mono.bold,
    fontSize: fontSize.sm,
    letterSpacing: letterSpacing.wider,
  },
  priceValue: {
    fontFamily: fonts.display.regular,
    fontSize: fontSize.hero,
    lineHeight: 80,
  },
  priceDivider: {
    alignItems: "center",
    justifyContent: "center",
    height: 80,
  },
  dividerLine: {
    width: 1,
    height: "100%",
  },
  probabilitySection: {
    gap: 6,
  },
  barTrack: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  barFillYes: {
    height: "100%",
    borderRadius: 3,
  },
  barLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  barLabel: {
    fontFamily: fonts.mono.bold,
    fontSize: fontSize.xs,
    letterSpacing: letterSpacing.wide,
  },
  orderbookSection: {
    gap: 8,
  },
  sectionTitle: {
    fontFamily: fonts.mono.bold,
    fontSize: fontSize.xxs,
    letterSpacing: letterSpacing.wider,
  },
  bottomActions: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 32,
    borderTopWidth: 1,
  },
  buyButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 10,
    borderCurve: "continuous",
  },
  buyYesButton: {
    backgroundColor: "rgba(0, 255, 102, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(0, 255, 102, 0.3)",
  },
  buyNoButton: {
    backgroundColor: "rgba(230, 0, 0, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(230, 0, 0, 0.3)",
  },
  buyButtonText: {
    fontFamily: fonts.body.bold,
    fontSize: fontSize.base,
    color: "#00ff66",
  },
  buyNoButtonText: {
    fontFamily: fonts.body.bold,
    fontSize: fontSize.base,
    color: "#E60000",
  },
});

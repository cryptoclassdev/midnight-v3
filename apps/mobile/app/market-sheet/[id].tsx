import { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore } from "@/lib/store";
import { mwaAuthorize } from "@/lib/wallet-adapter";
import { colors } from "@/constants/theme";
import { fonts, fontSize, letterSpacing } from "@/constants/typography";
import { usePredictionMarketDetail, usePredictionOrderbook } from "@/hooks/usePredictionMarket";
import { useCreateOrder, useTradingStatus } from "@/hooks/usePredictionTrading";
import { usePredictionOrders } from "@/hooks/usePredictionOrders";
import { OrderRow } from "@/components/predict/OrderRow";
import {
  microToUsd,
  usdToMicro,
  USDC_MINT,
  validateTradeAmount,
  parseTradeAmount,
  formatResolutionCountdown,
  MINIMUM_TRADE_USD,
} from "@mintfeed/shared";

const STATUS_COLORS = {
  open: "#00ff66",
  closed: "#E60000",
  cancelled: "#888888",
} as const;

export default function MarketSheet() {
  const { id: marketId, question } = useLocalSearchParams<{ id: string; question?: string }>();
  const router = useRouter();
  const theme = useAppStore((s) => s.theme);
  const walletAddress = useAppStore((s) => s.walletAddress);
  const connectWallet = useAppStore((s) => s.connectWallet);
  const themeColors = colors[theme];

  const { data: market, isLoading: marketLoading } = usePredictionMarketDetail(marketId);
  const { data: orderbook } = usePredictionOrderbook(marketId);
  const createOrder = useCreateOrder();
  const { data: tradingStatus } = useTradingStatus();
  const { data: ordersData } = usePredictionOrders(walletAddress ?? undefined);

  const [selectedSide, setSelectedSide] = useState<"yes" | "no">("yes");
  const [amount, setAmount] = useState("");

  const yesPrice = market ? microToUsd(market.pricing.buyYesPriceUsd) : 0;
  const noPrice = market ? microToUsd(market.pricing.buyNoPriceUsd) : 0;
  const yesPercent = Math.round(yesPrice * 100);
  const noPercent = Math.round(noPrice * 100);

  const tradeValidation = useMemo(() => validateTradeAmount(amount), [amount]);

  const estimatedShares = useMemo(() => {
    const usd = parseTradeAmount(amount);
    if (!usd || usd <= 0) return 0;
    const price = selectedSide === "yes" ? yesPrice : noPrice;
    if (price <= 0) return 0;
    return Math.floor(usd / price);
  }, [amount, selectedSide, yesPrice, noPrice]);

  const userOrders = useMemo(() => {
    if (!ordersData?.data || !marketId) return [];
    return ordersData.data.filter((o) => o.marketId === marketId);
  }, [ordersData, marketId]);

  const handleConnectWallet = useCallback(async () => {
    try {
      const { address, authToken } = await mwaAuthorize();
      connectWallet(address, authToken);
    } catch (err) {
      Alert.alert("Wallet Error", String(err));
    }
  }, [connectWallet]);

  const handlePlaceBet = useCallback(async () => {
    if (!walletAddress || !marketId) return;
    const validation = validateTradeAmount(amount);
    if (!validation.valid) {
      const msg = validation.error === "BELOW_MINIMUM"
        ? `Minimum bet: $${MINIMUM_TRADE_USD.toFixed(2)}`
        : "Enter a valid amount.";
      Alert.alert("Invalid amount", msg);
      return;
    }

    const usd = parseTradeAmount(amount)!;
    try {
      await createOrder.mutateAsync({
        ownerPubkey: walletAddress,
        marketId,
        isYes: selectedSide === "yes",
        isBuy: true,
        depositAmount: usdToMicro(usd),
        depositMint: USDC_MINT,
      });
      Alert.alert("Bet Placed", `Your ${selectedSide.toUpperCase()} bet was submitted.`);
      setAmount("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      Alert.alert("Trade Failed", message);
    }
  }, [walletAddress, marketId, amount, selectedSide, createOrder]);

  // Orderbook data
  const orderbookRows = useMemo(() => {
    if (!orderbook) return [];
    const yBids = (orderbook.yes_dollars ?? []).slice(0, 5);
    const nBids = (orderbook.no_dollars ?? []).slice(0, 5);
    const maxLen = Math.max(yBids.length, nBids.length);
    const rows: Array<{ yQty: number; yPrice: string; nPrice: string; nQty: number }> = [];
    for (let i = 0; i < maxLen; i++) {
      rows.push({
        yQty: yBids[i]?.[1] ?? 0,
        yPrice: yBids[i]?.[0] ?? "",
        nPrice: nBids[i]?.[0] ?? "",
        nQty: nBids[i]?.[1] ?? 0,
      });
    }
    return rows;
  }, [orderbook]);

  const isTradingPaused = tradingStatus?.trading_active === false;
  const hasAmountInput = amount.length > 0;
  const isAmountInvalid = hasAmountInput && !tradeValidation.valid;

  const buyButtonDisabled = !tradeValidation.valid || createOrder.isPending || isTradingPaused;

  const buyButtonText = useMemo(() => {
    if (isTradingPaused) return "Trading Paused";
    if (!hasAmountInput || tradeValidation.error === "INVALID_NUMBER") {
      return `Enter $${MINIMUM_TRADE_USD}+ to bet`;
    }
    if (tradeValidation.error === "BELOW_MINIMUM") {
      return `Enter $${MINIMUM_TRADE_USD}+ to bet`;
    }
    return `Buy ${selectedSide.toUpperCase()} \u00B7 ${selectedSide === "yes" ? yesPercent : noPercent}\u00A2`;
  }, [isTradingPaused, hasAmountInput, tradeValidation, selectedSide, yesPercent, noPercent]);

  if (marketLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  const marketTitle = market?.metadata.title ?? question ?? "Market";
  const marketStatus = market?.status ?? "open";
  const statusColor = STATUS_COLORS[marketStatus] ?? STATUS_COLORS.open;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      edges={["top", "bottom"]}
    >
      {/* Header — close button only */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Close market sheet"
          style={styles.headerButton}
        >
          <Ionicons name="close" size={24} color={themeColors.text} />
        </Pressable>
        <View style={{ flex: 1 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Large headline + status badge */}
        <View style={styles.titleSection}>
          <Text style={[styles.marketTitle, { color: themeColors.text }]}>
            {marketTitle}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + "20" }]}>
            <Text style={[styles.statusBadgeText, { color: statusColor }]}>
              {marketStatus.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Rules section */}
        {market?.metadata.rulesPrimary ? (
          <Text style={[styles.rulesText, { color: themeColors.textSecondary }]}>
            {market.metadata.rulesPrimary}
          </Text>
        ) : null}

        {/* YES / NO probabilities */}
        <View style={styles.probRow}>
          <Pressable
            style={[
              styles.probCard,
              { backgroundColor: themeColors.card, borderColor: themeColors.cardBorder },
              selectedSide === "yes" && { borderColor: themeColors.positive, borderWidth: 2 },
            ]}
            onPress={() => setSelectedSide("yes")}
            accessibilityRole="button"
            accessibilityState={{ selected: selectedSide === "yes" }}
            accessibilityLabel={`Yes at ${yesPercent} percent`}
          >
            <Text style={[styles.probLabel, { color: themeColors.positive }]}>YES</Text>
            <Text style={[styles.probValue, { color: themeColors.positive }]} maxFontSizeMultiplier={1.3}>{yesPercent}%</Text>
          </Pressable>
          <Pressable
            style={[
              styles.probCard,
              { backgroundColor: themeColors.card, borderColor: themeColors.cardBorder },
              selectedSide === "no" && { borderColor: themeColors.negative, borderWidth: 2 },
            ]}
            onPress={() => setSelectedSide("no")}
            accessibilityRole="button"
            accessibilityState={{ selected: selectedSide === "no" }}
            accessibilityLabel={`No at ${noPercent} percent`}
          >
            <Text style={[styles.probLabel, { color: themeColors.negative }]}>NO</Text>
            <Text style={[styles.probValue, { color: themeColors.negative }]} maxFontSizeMultiplier={1.3}>{noPercent}%</Text>
          </Pressable>
        </View>

        {/* Probability bar */}
        <View style={styles.fullBar}>
          <View style={[styles.fullBarYes, { flex: yesPercent || 1, backgroundColor: themeColors.positive }]} />
          <View style={[styles.fullBarNo, { flex: noPercent || 1, backgroundColor: themeColors.negative }]} />
        </View>

        {/* Resolution countdown + Volume */}
        {market && (
          <View style={styles.metaSection}>
            {market.closeTime > 0 && (
              <View style={styles.metaCard}>
                <Ionicons name="time-outline" size={14} color={themeColors.textMuted} />
                <Text style={[styles.metaCountdown, { color: themeColors.text }]}>
                  {formatResolutionCountdown(market.closeTime)}
                </Text>
                <Text style={[styles.metaDate, { color: themeColors.textMuted }]}>
                  {new Date(market.closeTime * 1000).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
              </View>
            )}
            {market.pricing.volume > 0 && (
              <View style={styles.metaCard}>
                <Ionicons name="bar-chart-outline" size={14} color={themeColors.textMuted} />
                <Text style={[styles.metaVolume, { color: themeColors.text }]}>
                  ${microToUsd(market.pricing.volume).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                </Text>
                <Text style={[styles.metaDate, { color: themeColors.textMuted }]}>
                  VOLUME
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Orderbook */}
        {orderbookRows.length > 0 && (
          <View style={[styles.orderbookSection, { backgroundColor: themeColors.card }]}>
            <Text style={[styles.sectionTitle, { color: themeColors.textMuted }]}>ORDERBOOK</Text>
            <View style={styles.orderbookHeader}>
              <Text style={[styles.obHeaderText, { color: themeColors.positive }]}>YES BIDS</Text>
              <Text style={[styles.obHeaderText, { color: themeColors.negative, textAlign: "right" }]}>
                NO BIDS
              </Text>
            </View>
            {orderbookRows.map((row, i) => (
              <View key={i} style={styles.orderbookRow}>
                <Text style={[styles.obQty, { color: themeColors.text }]}>{row.yQty || ""}</Text>
                <Text style={[styles.obPrice, { color: themeColors.positive }]}>{row.yPrice || ""}</Text>
                <Text style={[styles.obPrice, { color: themeColors.negative }]}>{row.nPrice || ""}</Text>
                <Text style={[styles.obQty, { color: themeColors.text, textAlign: "right" }]}>
                  {row.nQty || ""}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* User's previous orders */}
        <View style={[styles.ordersSection, { backgroundColor: themeColors.card }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.textMuted }]}>YOUR TRADES</Text>
          {userOrders.length > 0 ? (
            <View style={styles.ordersList}>
              {userOrders.map((order) => (
                <OrderRow key={order.pubkey} order={order} />
              ))}
            </View>
          ) : (
            <Text style={[styles.emptyText, { color: themeColors.textFaint }]}>
              No previous trades
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Trade section — pinned to bottom */}
      <View style={[styles.tradeSection, { borderTopColor: themeColors.border }]}>
        {walletAddress ? (
          <>
            {/* Trading paused banner */}
            {isTradingPaused && (
              <View style={[styles.pausedBanner, { backgroundColor: themeColors.negative + "18" }]}>
                <Ionicons name="pause-circle" size={14} color={themeColors.negative} />
                <Text style={[styles.pausedText, { color: themeColors.negative }]}>
                  Trading is currently paused
                </Text>
              </View>
            )}

            <View style={styles.tradeRow}>
              <View
                style={[
                  styles.amountInput,
                  { borderColor: themeColors.border, backgroundColor: themeColors.card },
                  isAmountInvalid && { borderColor: themeColors.negative },
                ]}
              >
                <Text style={[styles.dollarSign, { color: themeColors.textMuted }]}>$</Text>
                <TextInput
                  style={[styles.amountField, { color: themeColors.text }]}
                  placeholder="0.00"
                  placeholderTextColor={themeColors.textMuted}
                  keyboardType="decimal-pad"
                  value={amount}
                  onChangeText={setAmount}
                />
                <Text style={[styles.usdcLabel, { color: themeColors.textMuted }]}>USDC</Text>
              </View>
            </View>

            {/* Validation error */}
            {isAmountInvalid && tradeValidation.error === "BELOW_MINIMUM" && (
              <Text style={[styles.errorText, { color: themeColors.negative }]}>
                Minimum bet: ${MINIMUM_TRADE_USD.toFixed(2)}
              </Text>
            )}

            {/* Persistent hint */}
            <Text style={[styles.hintText, { color: themeColors.textMuted }]}>
              Min. bet: ${MINIMUM_TRADE_USD.toFixed(2)} USDC
            </Text>

            {estimatedShares > 0 && (
              <Text style={[styles.estimate, { color: themeColors.textMuted }]}>
                ~{estimatedShares} shares · Payout if correct: ${estimatedShares.toFixed(2)}
              </Text>
            )}

            <Pressable
              style={[
                styles.betButton,
                {
                  backgroundColor: selectedSide === "yes" ? themeColors.positive : themeColors.negative,
                  opacity: buyButtonDisabled ? 0.5 : 1,
                },
              ]}
              onPress={handlePlaceBet}
              disabled={buyButtonDisabled}
              accessibilityRole="button"
              accessibilityLabel={`Buy ${selectedSide} at ${selectedSide === "yes" ? yesPercent : noPercent} cents`}
            >
              {createOrder.isPending ? (
                <ActivityIndicator size="small" color={themeColors.background} />
              ) : (
                <Text style={[styles.betButtonText, { color: themeColors.background }]}>
                  {buyButtonText}
                </Text>
              )}
            </Pressable>
          </>
        ) : (
          <Pressable
            style={[styles.connectButton, { borderColor: themeColors.accentMint }]}
            onPress={handleConnectWallet}
            accessibilityRole="button"
            accessibilityLabel="Connect wallet to place bets"
          >
            <Ionicons name="wallet-outline" size={18} color={themeColors.accentMint} />
            <Text style={[styles.connectText, { color: themeColors.accentMint }]}>Connect Wallet to Bet</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },

  // Title + status
  titleSection: {
    marginBottom: 16,
    gap: 10,
  },
  marketTitle: {
    fontFamily: fonts.display.regular,
    fontSize: fontSize.xl,
    lineHeight: 30,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderCurve: "continuous",
  },
  statusBadgeText: {
    fontFamily: fonts.mono.bold,
    fontSize: 9,
    letterSpacing: letterSpacing.wide,
  },

  // Rules
  rulesText: {
    fontFamily: fonts.body.regular,
    fontSize: fontSize.base,
    lineHeight: 20,
    marginBottom: 20,
  },

  // Probability cards
  probRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  probCard: {
    flex: 1,
    borderRadius: 12,
    borderCurve: "continuous",
    borderWidth: 1,
    alignItems: "center",
    paddingVertical: 20,
    gap: 4,
  },
  probLabel: {
    fontFamily: fonts.mono.regular,
    fontSize: fontSize.xs,
    letterSpacing: letterSpacing.wide,
  },
  probValue: {
    fontFamily: fonts.display.regular,
    fontSize: 40,
  },

  // Full-width bar
  fullBar: {
    flexDirection: "row",
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 24,
  },
  fullBarYes: {},
  fullBarNo: {},

  // Meta section (resolution + volume)
  metaSection: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  metaCard: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  metaCountdown: {
    fontFamily: fonts.mono.bold,
    fontSize: fontSize.sm,
    letterSpacing: letterSpacing.wide,
  },
  metaVolume: {
    fontFamily: fonts.mono.bold,
    fontSize: fontSize.base,
    letterSpacing: letterSpacing.wide,
  },
  metaDate: {
    fontFamily: fonts.mono.regular,
    fontSize: fontSize.xxs,
    letterSpacing: letterSpacing.wide,
  },

  // Orderbook
  orderbookSection: {
    borderRadius: 12,
    borderCurve: "continuous",
    padding: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: fonts.mono.regular,
    fontSize: fontSize.xxs,
    letterSpacing: letterSpacing.wide,
    marginBottom: 8,
  },
  orderbookHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  obHeaderText: {
    fontFamily: fonts.mono.bold,
    fontSize: 10,
    letterSpacing: letterSpacing.wide,
  },
  orderbookRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  obQty: {
    fontFamily: fonts.mono.regular,
    fontSize: 11,
    width: 60,
  },
  obPrice: {
    fontFamily: fonts.mono.regular,
    fontSize: 11,
    width: 50,
    textAlign: "center",
  },

  // User orders section
  ordersSection: {
    borderRadius: 12,
    borderCurve: "continuous",
    padding: 12,
    marginBottom: 16,
  },
  ordersList: {
    gap: 8,
  },
  emptyText: {
    fontFamily: fonts.mono.regular,
    fontSize: fontSize.xs,
    textAlign: "center",
    paddingVertical: 12,
  },

  // Trade section
  tradeSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  pausedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderCurve: "continuous",
  },
  pausedText: {
    fontFamily: fonts.mono.regular,
    fontSize: fontSize.xs,
    letterSpacing: letterSpacing.wide,
  },
  tradeRow: {
    flexDirection: "row",
    gap: 8,
  },
  amountInput: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    borderCurve: "continuous",
    paddingHorizontal: 12,
    height: 44,
    gap: 4,
  },
  dollarSign: {
    fontFamily: fonts.mono.regular,
    fontSize: fontSize.base,
  },
  amountField: {
    flex: 1,
    fontFamily: fonts.mono.regular,
    fontSize: fontSize.base,
    paddingVertical: 0,
  },
  usdcLabel: {
    fontFamily: fonts.mono.regular,
    fontSize: fontSize.xxs,
    letterSpacing: letterSpacing.wide,
  },
  errorText: {
    fontFamily: fonts.mono.regular,
    fontSize: fontSize.xs,
  },
  hintText: {
    fontFamily: fonts.mono.regular,
    fontSize: fontSize.xxs,
  },
  estimate: {
    fontFamily: fonts.mono.regular,
    fontSize: 11,
    textAlign: "center",
  },
  betButton: {
    height: 48,
    borderRadius: 12,
    borderCurve: "continuous",
    alignItems: "center",
    justifyContent: "center",
  },
  betButtonText: {
    fontFamily: fonts.mono.bold,
    fontSize: fontSize.sm,
    letterSpacing: letterSpacing.wide,
  },
  connectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderRadius: 12,
    borderCurve: "continuous",
    borderWidth: 1.5,
    gap: 8,
  },
  connectText: {
    fontFamily: fonts.mono.regular,
    fontSize: fontSize.sm,
    letterSpacing: letterSpacing.wide,
  },
});

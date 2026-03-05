import { memo, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Modal,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";
import { fonts, fontSize, letterSpacing } from "@/constants/typography";
import { useAppStore } from "@/lib/store";
import { microToUsd, MICRO_USD } from "@mintfeed/shared";

const PRESET_AMOUNTS = [1, 5, 10, 25] as const;
const MIN_ORDER_AMOUNT = 0.01;

function formatPrice(microUsd: number): string {
  return `$${(microUsd / MICRO_USD).toFixed(2)}`;
}

interface OrderSheetProps {
  marketId: string;
  marketTitle: string;
  currentYesPrice: number;
  currentNoPrice: number;
  onClose: () => void;
  visible: boolean;
  onSubmitOrder: (order: {
    marketId: string;
    isYes: boolean;
    isBuy: boolean;
    depositAmount: string;
  }) => void;
}

export const OrderSheet = memo(function OrderSheet({
  marketId,
  marketTitle,
  currentYesPrice,
  currentNoPrice,
  onClose,
  visible,
  onSubmitOrder,
}: OrderSheetProps) {
  const theme = useAppStore((s) => s.theme);
  const walletAddress = useAppStore((s) => s.walletAddress);
  const themeColors = colors[theme];

  const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy");
  const [selectedSide, setSelectedSide] = useState<"yes" | "no">("yes");
  const [amountText, setAmountText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const amount = parseFloat(amountText) || 0;
  const pricePerContract =
    selectedSide === "yes"
      ? microToUsd(currentYesPrice)
      : microToUsd(currentNoPrice);

  const estimatedContracts = useMemo(() => {
    if (pricePerContract <= 0 || amount <= 0) return 0;
    return amount / pricePerContract;
  }, [amount, pricePerContract]);

  const maxProfit = useMemo(() => {
    if (activeTab === "buy") {
      return estimatedContracts - amount;
    }
    return amount - estimatedContracts * (1 - pricePerContract);
  }, [activeTab, estimatedContracts, amount, pricePerContract]);

  const handlePresetPress = useCallback((preset: number) => {
    setAmountText(preset.toString());
  }, []);

  const handleSubmit = useCallback(async () => {
    if (amount < MIN_ORDER_AMOUNT || isSubmitting) return;

    setIsSubmitting(true);
    try {
      onSubmitOrder({
        marketId,
        isYes: selectedSide === "yes",
        isBuy: activeTab === "buy",
        depositAmount: Math.round(amount * MICRO_USD).toString(),
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [amount, isSubmitting, marketId, selectedSide, activeTab, onSubmitOrder]);

  const isWalletConnected = walletAddress !== null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: themeColors.overlay }]}>
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: themeColors.background,
              borderColor: themeColors.border,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text
              style={[styles.headerTitle, { color: themeColors.text }]}
              numberOfLines={1}
            >
              {marketTitle}
            </Text>
            <Pressable
              onPress={onClose}
              hitSlop={12}
              style={({ pressed }) => [pressed && { opacity: 0.7 }]}
            >
              <Ionicons name="close" size={22} color={themeColors.textMuted} />
            </Pressable>
          </View>

          {!isWalletConnected ? (
            /* Wallet not connected state */
            <View style={styles.walletPrompt}>
              <Ionicons
                name="wallet-outline"
                size={40}
                color={themeColors.textMuted}
              />
              <Text
                style={[
                  styles.walletPromptTitle,
                  { color: themeColors.text },
                ]}
              >
                Connect Wallet
              </Text>
              <Text
                style={[
                  styles.walletPromptSubtitle,
                  { color: themeColors.textMuted },
                ]}
              >
                Connect your Solana wallet to place orders on prediction markets.
              </Text>
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* Buy / Sell tabs */}
              <View
                style={[
                  styles.tabRow,
                  { backgroundColor: themeColors.card },
                ]}
              >
                <Pressable
                  style={[
                    styles.tab,
                    activeTab === "buy" && {
                      backgroundColor: themeColors.positive,
                    },
                  ]}
                  onPress={() => setActiveTab("buy")}
                >
                  <Text
                    style={[
                      styles.tabText,
                      {
                        color:
                          activeTab === "buy"
                            ? themeColors.background
                            : themeColors.textMuted,
                      },
                    ]}
                  >
                    BUY
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.tab,
                    activeTab === "sell" && {
                      backgroundColor: themeColors.negative,
                    },
                  ]}
                  onPress={() => setActiveTab("sell")}
                >
                  <Text
                    style={[
                      styles.tabText,
                      {
                        color:
                          activeTab === "sell"
                            ? "#ffffff"
                            : themeColors.textMuted,
                      },
                    ]}
                  >
                    SELL
                  </Text>
                </Pressable>
              </View>

              {/* Side toggle: YES / NO */}
              <View style={styles.sideSection}>
                <Text
                  style={[
                    styles.sectionLabel,
                    { color: themeColors.textSecondary },
                  ]}
                >
                  OUTCOME
                </Text>
                <View
                  style={[
                    styles.sideToggle,
                    { backgroundColor: themeColors.card },
                  ]}
                >
                  <Pressable
                    style={[
                      styles.sidePill,
                      selectedSide === "yes" && styles.sidePillYesActive,
                    ]}
                    onPress={() => setSelectedSide("yes")}
                  >
                    <Text
                      style={[
                        styles.sidePillText,
                        {
                          color:
                            selectedSide === "yes"
                              ? themeColors.background
                              : themeColors.textMuted,
                        },
                      ]}
                    >
                      YES
                    </Text>
                    <Text
                      style={[
                        styles.sidePillPrice,
                        {
                          color:
                            selectedSide === "yes"
                              ? themeColors.background
                              : themeColors.textMuted,
                        },
                      ]}
                    >
                      {formatPrice(currentYesPrice)}
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.sidePill,
                      selectedSide === "no" && styles.sidePillNoActive,
                    ]}
                    onPress={() => setSelectedSide("no")}
                  >
                    <Text
                      style={[
                        styles.sidePillText,
                        {
                          color:
                            selectedSide === "no"
                              ? "#ffffff"
                              : themeColors.textMuted,
                        },
                      ]}
                    >
                      NO
                    </Text>
                    <Text
                      style={[
                        styles.sidePillPrice,
                        {
                          color:
                            selectedSide === "no"
                              ? "#ffffff"
                              : themeColors.textMuted,
                        },
                      ]}
                    >
                      {formatPrice(currentNoPrice)}
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* Amount input */}
              <View style={styles.amountSection}>
                <Text
                  style={[
                    styles.sectionLabel,
                    { color: themeColors.textSecondary },
                  ]}
                >
                  AMOUNT (USD)
                </Text>
                <View
                  style={[
                    styles.amountInputWrapper,
                    { borderColor: themeColors.border },
                  ]}
                >
                  <Text
                    style={[
                      styles.dollarSign,
                      { color: themeColors.textMuted },
                    ]}
                  >
                    $
                  </Text>
                  <TextInput
                    style={[
                      styles.amountInput,
                      { color: themeColors.text },
                    ]}
                    value={amountText}
                    onChangeText={setAmountText}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor={themeColors.textMuted}
                  />
                </View>

                {/* Preset buttons */}
                <View style={styles.presetRow}>
                  {PRESET_AMOUNTS.map((preset) => (
                    <Pressable
                      key={preset}
                      style={({ pressed }) => [
                        styles.presetButton,
                        { borderColor: themeColors.border },
                        pressed && { opacity: 0.7 },
                      ]}
                      onPress={() => handlePresetPress(preset)}
                    >
                      <Text
                        style={[
                          styles.presetText,
                          { color: themeColors.textSecondary },
                        ]}
                      >
                        ${preset}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Order summary */}
              <View
                style={[
                  styles.summaryCard,
                  { backgroundColor: themeColors.card },
                ]}
              >
                <View style={styles.summaryRow}>
                  <Text
                    style={[
                      styles.summaryLabel,
                      { color: themeColors.textMuted },
                    ]}
                  >
                    Est. Contracts
                  </Text>
                  <Text
                    style={[
                      styles.summaryValue,
                      { color: themeColors.text },
                    ]}
                  >
                    {estimatedContracts.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text
                    style={[
                      styles.summaryLabel,
                      { color: themeColors.textMuted },
                    ]}
                  >
                    Total Cost
                  </Text>
                  <Text
                    style={[
                      styles.summaryValue,
                      { color: themeColors.text },
                    ]}
                  >
                    ${amount.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text
                    style={[
                      styles.summaryLabel,
                      { color: themeColors.textMuted },
                    ]}
                  >
                    Max Potential Profit
                  </Text>
                  <Text
                    style={[
                      styles.summaryValue,
                      { color: maxProfit > 0 ? themeColors.positive : themeColors.textMuted },
                    ]}
                  >
                    {maxProfit > 0 ? "+" : ""}${maxProfit.toFixed(2)}
                  </Text>
                </View>
              </View>

              {/* Confirm button */}
              <Pressable
                style={({ pressed }) => [
                  styles.confirmButton,
                  { backgroundColor: themeColors.accent },
                  (amount < MIN_ORDER_AMOUNT || isSubmitting) && styles.confirmDisabled,
                  pressed && { opacity: 0.7 },
                ]}
                onPress={handleSubmit}
                disabled={amount < MIN_ORDER_AMOUNT || isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.confirmText}>
                    {activeTab === "buy" ? "Buy" : "Sell"}{" "}
                    {selectedSide === "yes" ? "YES" : "NO"}
                  </Text>
                )}
              </Pressable>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderCurve: "continuous",
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    paddingTop: 16,
    paddingBottom: 40,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  headerTitle: {
    flex: 1,
    fontFamily: fonts.body.bold,
    fontSize: fontSize.lg,
    lineHeight: 24,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 16,
    paddingBottom: 20,
  },

  /* Wallet prompt */
  walletPrompt: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 32,
    gap: 12,
  },
  walletPromptTitle: {
    fontFamily: fonts.body.bold,
    fontSize: fontSize.lg,
  },
  walletPromptSubtitle: {
    fontFamily: fonts.body.regular,
    fontSize: fontSize.base,
    textAlign: "center",
    lineHeight: 20,
  },

  /* Tabs */
  tabRow: {
    flexDirection: "row",
    borderRadius: 8,
    borderCurve: "continuous",
    padding: 3,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 6,
    borderCurve: "continuous",
  },
  tabText: {
    fontFamily: fonts.mono.bold,
    fontSize: fontSize.sm,
    letterSpacing: letterSpacing.wider,
  },

  /* Side toggle */
  sideSection: {
    gap: 8,
  },
  sectionLabel: {
    fontFamily: fonts.mono.regular,
    fontSize: fontSize.xxs,
    letterSpacing: letterSpacing.wider,
    textTransform: "uppercase",
  },
  sideToggle: {
    flexDirection: "row",
    borderRadius: 8,
    borderCurve: "continuous",
    padding: 3,
  },
  sidePill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 6,
    borderCurve: "continuous",
  },
  sidePillYesActive: {
    backgroundColor: "#00ff66",
  },
  sidePillNoActive: {
    backgroundColor: "#E60000",
  },
  sidePillText: {
    fontFamily: fonts.mono.bold,
    fontSize: fontSize.sm,
    letterSpacing: letterSpacing.wider,
  },
  sidePillPrice: {
    fontFamily: fonts.mono.regular,
    fontSize: fontSize.xs,
  },

  /* Amount */
  amountSection: {
    gap: 8,
  },
  amountInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    borderCurve: "continuous",
    paddingHorizontal: 12,
  },
  dollarSign: {
    fontFamily: fonts.mono.bold,
    fontSize: fontSize.xl,
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    fontFamily: fonts.mono.bold,
    fontSize: fontSize.xl,
    paddingVertical: 12,
  },
  presetRow: {
    flexDirection: "row",
    gap: 8,
  },
  presetButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 6,
    borderCurve: "continuous",
  },
  presetText: {
    fontFamily: fonts.mono.regular,
    fontSize: fontSize.sm,
  },

  /* Summary */
  summaryCard: {
    borderRadius: 10,
    borderCurve: "continuous",
    padding: 12,
    gap: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontFamily: fonts.body.regular,
    fontSize: fontSize.sm,
  },
  summaryValue: {
    fontFamily: fonts.mono.bold,
    fontSize: fontSize.sm,
  },

  /* Confirm */
  confirmButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 10,
    borderCurve: "continuous",
    marginTop: 4,
  },
  confirmDisabled: {
    opacity: 0.4,
  },
  confirmText: {
    fontFamily: fonts.body.bold,
    fontSize: fontSize.base,
    color: "#ffffff",
    letterSpacing: letterSpacing.wide,
  },
});

import { memo } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useMarket } from "@/hooks/useMarket";
import { useAppStore } from "@/lib/store";
import { colors, type ThemeColors } from "@/constants/theme";
import { fonts, fontSize } from "@/constants/typography";
import type { MarketCoin } from "@mintfeed/shared";

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const smallPriceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 4,
  maximumFractionDigits: 6,
});

function formatPrice(price: number): string {
  return price < 1
    ? smallPriceFormatter.format(price)
    : priceFormatter.format(price);
}

function formatMarketCap(cap: number): string {
  if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`;
  if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`;
  if (cap >= 1e6) return `$${(cap / 1e6).toFixed(2)}M`;
  return `$${cap.toFixed(0)}`;
}

interface CoinRowProps {
  item: MarketCoin;
  index: number;
  themeColors: ThemeColors;
}

const CoinRow = memo(function CoinRow({ item, index, themeColors }: CoinRowProps) {
  const isPositive = item.priceChange24h >= 0;

  return (
    <View style={[styles.row, { borderBottomColor: themeColors.border }]}>
      <Text style={[styles.rank, { color: themeColors.textMuted }]}>
        {index + 1}
      </Text>
      {item.imageUrl && (
        <Image source={{ uri: item.imageUrl }} style={styles.coinIcon} />
      )}
      <View style={styles.coinInfo}>
        <Text style={[styles.coinName, { color: themeColors.text }]}>
          {item.name}
        </Text>
        <Text style={[styles.coinSymbol, { color: themeColors.textMuted }]}>
          {item.symbol.toUpperCase()} · {formatMarketCap(item.marketCap)}
        </Text>
      </View>
      <View style={styles.priceInfo}>
        <Text style={[styles.price, { color: themeColors.text }]}>
          {formatPrice(item.currentPrice)}
        </Text>
        <Text
          style={[
            styles.change,
            { color: isPositive ? themeColors.positive : themeColors.negative },
          ]}
        >
          {isPositive ? "+" : ""}
          {item.priceChange24h.toFixed(2)}%
        </Text>
      </View>
    </View>
  );
});

export default function MarketScreen() {
  const theme = useAppStore((s) => s.theme);
  const themeColors = colors[theme];
  const { data, isLoading, refetch } = useMarket();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      edges={["top"]}
    >
      <Text style={[styles.title, { color: themeColors.text }]}>Market</Text>
      <FlatList
        data={data?.data ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <CoinRow item={item} index={index} themeColors={themeColors} />
        )}
        onRefresh={refetch}
        refreshing={isLoading}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.serif.bold,
    fontSize: fontSize.xxl,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  list: {
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    gap: 12,
  },
  rank: {
    fontFamily: fonts.sans.medium,
    fontSize: fontSize.sm,
    width: 24,
    textAlign: "center",
  },
  coinIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  coinInfo: {
    flex: 1,
  },
  coinName: {
    fontFamily: fonts.sans.bold,
    fontSize: fontSize.base,
  },
  coinSymbol: {
    fontFamily: fonts.sans.regular,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  priceInfo: {
    alignItems: "flex-end",
  },
  price: {
    fontFamily: fonts.sans.bold,
    fontSize: fontSize.base,
  },
  change: {
    fontFamily: fonts.sans.medium,
    fontSize: fontSize.sm,
    marginTop: 2,
  },
});

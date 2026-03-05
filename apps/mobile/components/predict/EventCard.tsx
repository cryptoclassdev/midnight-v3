import { memo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";
import { fonts, fontSize, letterSpacing } from "@/constants/typography";
import { useAppStore } from "@/lib/store";
import type { PredictionEvent } from "@mintfeed/shared";
import { microToUsd } from "@mintfeed/shared";

const IMAGE_HEIGHT = 80;
const MICRO_USD_THOUSAND = 1_000;
const MICRO_USD_MILLION = 1_000_000;

function formatVolume(microUsdString: string): string {
  const usd = microToUsd(microUsdString);
  if (usd >= MICRO_USD_MILLION) {
    return `$${(usd / MICRO_USD_MILLION).toFixed(1)}M`;
  }
  if (usd >= MICRO_USD_THOUSAND) {
    return `$${(usd / MICRO_USD_THOUSAND).toFixed(1)}K`;
  }
  return `$${usd.toFixed(0)}`;
}

interface EventCardProps {
  event: PredictionEvent;
  onPress: (event: PredictionEvent) => void;
}

export const EventCard = memo(function EventCard({
  event,
  onPress,
}: EventCardProps) {
  const theme = useAppStore((s) => s.theme);
  const themeColors = colors[theme];

  const topMarket = event.markets?.[0];
  const yesPercentage = topMarket
    ? Math.round(microToUsd(topMarket.pricing.buyYesPriceUsd) * 100)
    : null;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: themeColors.card, borderColor: themeColors.border },
        pressed && { opacity: 0.7 },
      ]}
      onPress={() => onPress(event)}
    >
      {/* Event image */}
      {event.metadata.imageUrl && (
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: event.metadata.imageUrl }}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        {/* Top row: badges */}
        <View style={styles.badgeRow}>
          {event.category && (
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: themeColors.border },
              ]}
            >
              <Text
                style={[styles.categoryText, { color: themeColors.textMuted }]}
              >
                {event.category}
              </Text>
            </View>
          )}

          {event.isLive && (
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}

          <View style={styles.volumeBadge}>
            <Text style={[styles.volumeText, { color: themeColors.accent }]}>
              {formatVolume(event.volumeUsd)}
            </Text>
          </View>
        </View>

        {/* Title */}
        <Text
          style={[styles.title, { color: themeColors.text }]}
          numberOfLines={2}
        >
          {event.metadata.title}
        </Text>

        {/* Probability bar for top market */}
        {yesPercentage !== null && yesPercentage > 0 && (
          <View style={styles.probabilityRow}>
            <View
              style={[
                styles.barTrack,
                { backgroundColor: themeColors.border },
              ]}
            >
              <View
                style={[
                  styles.barFill,
                  {
                    width: `${yesPercentage}%`,
                    backgroundColor: themeColors.positive,
                  },
                ]}
              />
            </View>
            <Text
              style={[styles.probabilityText, { color: themeColors.positive }]}
            >
              {yesPercentage}%
            </Text>
          </View>
        )}
      </View>

      {/* Chevron */}
      <View style={styles.chevron}>
        <Ionicons
          name="chevron-forward"
          size={16}
          color={themeColors.textMuted}
        />
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: 12,
    borderCurve: "continuous",
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 8,
  },
  imageWrapper: {
    width: IMAGE_HEIGHT,
    height: IMAGE_HEIGHT,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  content: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  categoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderCurve: "continuous",
  },
  categoryText: {
    fontFamily: fonts.mono.regular,
    fontSize: fontSize.xxs,
    textTransform: "uppercase",
    letterSpacing: letterSpacing.wide,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderCurve: "continuous",
    backgroundColor: "rgba(0, 255, 102, 0.15)",
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#00ff66",
  },
  liveText: {
    fontFamily: fonts.mono.bold,
    fontSize: fontSize.xxs,
    color: "#00ff66",
    letterSpacing: letterSpacing.wide,
  },
  volumeBadge: {
    marginLeft: "auto",
  },
  volumeText: {
    fontFamily: fonts.mono.regular,
    fontSize: fontSize.xxs,
    letterSpacing: letterSpacing.wide,
  },
  title: {
    fontFamily: fonts.body.bold,
    fontSize: fontSize.base,
    lineHeight: 18,
  },
  probabilityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  barTrack: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 2,
  },
  probabilityText: {
    fontFamily: fonts.mono.regular,
    fontSize: fontSize.xs,
    letterSpacing: letterSpacing.wide,
  },
  chevron: {
    justifyContent: "center",
    paddingRight: 8,
  },
});

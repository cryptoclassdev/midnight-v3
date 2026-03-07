import { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { useAppStore } from "@/lib/store";
import { colors } from "@/constants/theme";
import { fonts, fontSize, letterSpacing } from "@/constants/typography";
import { useFearGreed } from "@/hooks/useFearGreed";

const RING_SIZE = 100;
const STROKE_WIDTH = 8;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function getRingColor(value: number): string {
  if (value <= 25) return "#E60000";
  if (value <= 45) return "#F5A623";
  if (value <= 55) return "#CCCC00";
  if (value <= 75) return "#00D4AA";
  return "#00ff66";
}

function formatClassification(classification: string): string {
  return classification.replace(/\b\w/g, (c) => c.toUpperCase()) + ".";
}

export const FearGreedCard = memo(function FearGreedCard() {
  const theme = useAppStore((s) => s.theme);
  const themeColors = colors[theme];
  const { data, isLoading } = useFearGreed();

  if (isLoading || !data) return null;

  const progress = data.value / 100;
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);
  const ringColor = getRingColor(data.value);

  return (
    <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.cardBorder }]}>
      <View style={styles.content}>
        <View style={styles.textColumn}>
          <Text style={[styles.label, { color: themeColors.positive }]}>SENTIMENT INDEX</Text>
          <Text style={[styles.classification, { color: themeColors.text }]}>
            {formatClassification(data.classification)}
          </Text>
          <Text style={[styles.description, { color: themeColors.textMuted }]}>
            The index tracks market volatility and volume. Current reading:{" "}
            <Text style={{ color: themeColors.text, fontFamily: fonts.mono.bold }}>{data.value}/100</Text>.
          </Text>
        </View>
        <View style={styles.ringContainer}>
          <Svg width={RING_SIZE} height={RING_SIZE}>
            {/* Background ring */}
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              stroke={themeColors.trackBg}
              strokeWidth={STROKE_WIDTH}
              fill="none"
            />
            {/* Progress ring */}
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              stroke={ringColor}
              strokeWidth={STROKE_WIDTH}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              rotation={-90}
              origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
            />
          </Svg>
          <View style={styles.ringValueContainer}>
            <Text style={[styles.ringValue, { color: themeColors.text }]}>{data.value}</Text>
          </View>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderCurve: "continuous",
    borderWidth: 0.5,
    padding: 20,
    marginBottom: 16,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  textColumn: {
    flex: 1,
    gap: 4,
  },
  label: {
    fontFamily: fonts.mono.bold,
    fontSize: fontSize.xs,
    letterSpacing: letterSpacing.wider,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  classification: {
    fontFamily: fonts.display.regular,
    fontSize: 32,
    lineHeight: 38,
    marginBottom: 6,
  },
  description: {
    fontFamily: fonts.body.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  ringContainer: {
    width: RING_SIZE,
    height: RING_SIZE,
    justifyContent: "center",
    alignItems: "center",
  },
  ringValueContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  ringValue: {
    fontFamily: fonts.mono.bold,
    fontSize: 28,
  },
});

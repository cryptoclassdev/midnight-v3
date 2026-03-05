import { memo, useCallback } from "react";
import { ScrollView, Text, StyleSheet, Pressable } from "react-native";
import { colors } from "@/constants/theme";
import { fonts, fontSize, letterSpacing } from "@/constants/typography";
import { useAppStore } from "@/lib/store";

interface CategoryFilterProps {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
}

export const CategoryFilter = memo(function CategoryFilter({
  categories,
  selected,
  onSelect,
}: CategoryFilterProps) {
  const theme = useAppStore((s) => s.theme);
  const themeColors = colors[theme];

  const renderPill = useCallback(
    (category: string) => {
      const isSelected = category === selected;

      return (
        <Pressable
          key={category}
          style={({ pressed }) => [
            styles.pill,
            {
              backgroundColor: isSelected
                ? themeColors.accent
                : themeColors.card,
              borderColor: isSelected
                ? themeColors.accent
                : themeColors.border,
            },
            pressed && { opacity: 0.7 },
          ]}
          onPress={() => onSelect(category)}
        >
          <Text
            style={[
              styles.pillText,
              {
                color: isSelected ? "#ffffff" : themeColors.textSecondary,
              },
            ]}
          >
            {category}
          </Text>
        </Pressable>
      );
    },
    [selected, onSelect, themeColors],
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {categories.map(renderPill)}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
    paddingVertical: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderCurve: "continuous",
    borderWidth: 1,
  },
  pillText: {
    fontFamily: fonts.mono.regular,
    fontSize: fontSize.xs,
    textTransform: "uppercase",
    letterSpacing: letterSpacing.wide,
  },
});

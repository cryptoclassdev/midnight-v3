import { View, StyleSheet, Pressable, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SwipeFeed } from "@/components/feed/SwipeFeed";
import { useAppStore } from "@/lib/store";
import { colors } from "@/constants/theme";
import { fonts, fontSize } from "@/constants/typography";

const CATEGORIES = ["all", "crypto", "ai"] as const;
const CATEGORY_LABELS: Record<string, string> = {
  all: "All",
  crypto: "Crypto",
  ai: "AI",
};

export default function FeedScreen() {
  const theme = useAppStore((s) => s.theme);
  const selectedCategory = useAppStore((s) => s.selectedCategory);
  const setCategory = useAppStore((s) => s.setCategory);
  const themeColors = colors[theme];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      edges={["top"]}
    >
      <View style={styles.header}>
        <Text style={[styles.logo, { color: themeColors.accent }]}>
          MintFeed
        </Text>
        <View style={styles.categories}>
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat}
              onPress={() => setCategory(cat)}
              style={[
                styles.chip,
                {
                  backgroundColor:
                    selectedCategory === cat
                      ? themeColors.accent
                      : themeColors.card,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  {
                    color:
                      selectedCategory === cat
                        ? themeColors.background
                        : themeColors.textMuted,
                  },
                ]}
              >
                {CATEGORY_LABELS[cat]}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
      <SwipeFeed />
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
    paddingVertical: 10,
  },
  logo: {
    fontFamily: fonts.serif.bold,
    fontSize: fontSize.xl,
  },
  categories: {
    flexDirection: "row",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  chipText: {
    fontFamily: fonts.sans.medium,
    fontSize: fontSize.sm,
  },
});

import { View, Text, Switch, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppStore } from "@/lib/store";
import { colors } from "@/constants/theme";
import { fonts, fontSize } from "@/constants/typography";

export default function SettingsScreen() {
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const themeColors = colors[theme];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      edges={["top"]}
    >
      <Text style={[styles.title, { color: themeColors.text }]}>Settings</Text>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: themeColors.textMuted }]}>
          APPEARANCE
        </Text>
        <View
          style={[styles.row, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
        >
          <Text style={[styles.rowLabel, { color: themeColors.text }]}>
            Dark Mode
          </Text>
          <Switch
            value={theme === "dark"}
            onValueChange={toggleTheme}
            trackColor={{ false: themeColors.border, true: themeColors.accent }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: themeColors.textMuted }]}>
          ABOUT
        </Text>
        <View
          style={[styles.row, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
        >
          <Text style={[styles.rowLabel, { color: themeColors.text }]}>
            Version
          </Text>
          <Text style={[styles.rowValue, { color: themeColors.textMuted }]}>
            1.0.0
          </Text>
        </View>
      </View>
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
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontFamily: fonts.sans.bold,
    fontSize: fontSize.xs,
    letterSpacing: 1,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    borderWidth: 0.5,
  },
  rowLabel: {
    fontFamily: fonts.sans.medium,
    fontSize: fontSize.base,
  },
  rowValue: {
    fontFamily: fonts.sans.regular,
    fontSize: fontSize.base,
  },
});

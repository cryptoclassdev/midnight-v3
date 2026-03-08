import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";
import { fonts, fontSize } from "@/constants/typography";
import { useAppStore } from "@/lib/store";
import { WalletPicker } from "@/components/wallet/WalletPicker";

export default function LoginScreen() {
  const theme = useAppStore((s) => s.theme);
  const themeColors = colors[theme];
  const [pickerVisible, setPickerVisible] = useState(false);

  const isAndroid = Platform.OS === "android";

  return (
    <View style={styles.container}>
      <Text
        style={[styles.heading, { color: themeColors.text }]}
        accessibilityRole="header"
      >
        Connect your wallet
      </Text>
      <Text style={[styles.subheading, { color: themeColors.textMuted }]}>
        Sign in with any Solana wallet app installed on your device.
      </Text>

      {isAndroid ? (
        <>
          <Pressable
            style={[styles.button, { backgroundColor: themeColors.accent }]}
            onPress={() => setPickerVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Connect Solana wallet"
          >
            <Ionicons name="wallet-outline" size={18} color="#FFFFFF" />
            <Text style={styles.buttonText}>Connect Wallet</Text>
          </Pressable>

          <WalletPicker
            visible={pickerVisible}
            onClose={() => setPickerVisible(false)}
          />
        </>
      ) : (
        <Text
          style={[styles.unavailableText, { color: themeColors.textMuted }]}
        >
          Wallet connection is available on Android.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  heading: {
    fontFamily: fonts.display.regular,
    fontSize: fontSize.xxl,
    marginBottom: 4,
  },
  subheading: {
    fontFamily: fonts.body.regular,
    fontSize: fontSize.base,
    marginBottom: 24,
  },
  button: {
    flexDirection: "row",
    padding: 14,
    borderRadius: 12,
    borderCurve: "continuous",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 48,
  },
  buttonText: {
    fontFamily: fonts.body.semiBold,
    fontSize: fontSize.base,
    color: "#FFFFFF",
  },
  unavailableText: {
    fontFamily: fonts.body.regular,
    fontSize: fontSize.sm,
    textAlign: "center",
    paddingVertical: 14,
  },
});

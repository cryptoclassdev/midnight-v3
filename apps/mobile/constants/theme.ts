export const colors = {
  dark: {
    background: "#0A0A0A",
    card: "#1A1A1A",
    text: "#FAFAFA",
    textSecondary: "rgba(250, 250, 250, 0.7)",
    textMuted: "#6B7280",
    accent: "#00D4AA",
    border: "#2A2A2A",
    overlay: "rgba(0, 0, 0, 0.6)",
    positive: "#22C55E",
    negative: "#EF4444",
  },
  light: {
    background: "#FAFAFA",
    card: "#FFFFFF",
    text: "#1A1A1A",
    textSecondary: "rgba(26, 26, 26, 0.7)",
    textMuted: "#9CA3AF",
    accent: "#00B894",
    border: "#E5E7EB",
    overlay: "rgba(0, 0, 0, 0.4)",
    positive: "#16A34A",
    negative: "#DC2626",
  },
} as const;

export type ThemeMode = "dark" | "light";
export type ThemeColors = (typeof colors)["dark"] | (typeof colors)["light"];

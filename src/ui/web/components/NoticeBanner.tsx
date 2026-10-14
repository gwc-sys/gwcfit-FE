import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../../../theme/AppThemeProvider";
import { radius, spacing, typography } from "../theme/theme";
import type { ThemeColors } from "../theme/theme";

type NoticeBannerProps = {
  message: string | null;
  tone?: "success" | "error" | "info";
};

export function NoticeBanner({ message, tone = "success" }: NoticeBannerProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (!message) {
    return null;
  }

  const icon = tone === "error" ? "alert-circle-outline" : tone === "info" ? "information-circle-outline" : "checkmark-circle-outline";
  const iconColor = tone === "error" ? colors.danger : tone === "info" ? colors.info : colors.success;

  return (
    <View accessibilityRole={tone === "error" ? "alert" : undefined} accessibilityLiveRegion="polite" style={[styles.banner, styles[tone]]}>
      <Ionicons name={icon} size={20} color={iconColor} />
      <Text style={[styles.text, styles[`${tone}Text` as const]]}>
        {message}
      </Text>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  banner: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  success: {
    backgroundColor: colors.successSoft
  },
  info: {
    backgroundColor: colors.infoSoft
  },
  error: {
    backgroundColor: colors.dangerSoft
  },
  text: {
    ...typography.small,
    flex: 1
  },
  successText: {
    color: colors.success
  },
  infoText: {
    color: colors.info
  },
  errorText: {
    color: colors.danger
  }
  });

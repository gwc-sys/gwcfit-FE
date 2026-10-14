import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../../../theme/AppThemeProvider";
import { radius, spacing, typography } from "../theme/theme";
import type { ThemeColors } from "../theme/theme";

type BadgeTone = "success" | "warning" | "danger" | "info" | "neutral";

type StatusBadgeProps = {
  label: string;
  tone?: BadgeTone;
};

export function StatusBadge({ label, tone = "neutral" }: StatusBadgeProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={[styles.badge, styles[tone]]}>
      <Text maxFontSizeMultiplier={1.1} numberOfLines={1} style={[styles.text, styles[`${tone}Text` as const]]}>
        {label}
      </Text>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  badge: {
    maxWidth: "100%",
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4
  },
  text: {
    flexShrink: 1,
    ...typography.small
  },
  success: {
    backgroundColor: colors.successSoft
  },
  successText: {
    color: colors.success
  },
  warning: {
    backgroundColor: colors.warningSoft
  },
  warningText: {
    color: colors.warning
  },
  danger: {
    backgroundColor: colors.dangerSoft
  },
  dangerText: {
    color: colors.danger
  },
  info: {
    backgroundColor: colors.infoSoft
  },
  infoText: {
    color: colors.info
  },
  neutral: {
    backgroundColor: colors.surfaceMuted
  },
  neutralText: {
    color: colors.muted
  }
  });

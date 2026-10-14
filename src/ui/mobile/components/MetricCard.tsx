import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useAppTheme } from "../../../theme/AppThemeProvider";
import { radius, shadows, spacing, typography } from "../theme/theme";
import type { ThemeColors } from "../theme/theme";

type MetricCardProps = {
  label: string;
  value: string;
  suffix?: string;
  icon: keyof typeof Ionicons.glyphMap;
  footer?: string;
  trend?: string;
  tone?: "primary" | "success" | "info" | "warning" | "danger" | "accent";
};

function getTone(colors: ThemeColors, tone: NonNullable<MetricCardProps["tone"]>) {
  const tones = {
    primary: { foreground: colors.primary },
    success: { foreground: colors.success },
    info: { foreground: colors.info },
    warning: { foreground: colors.warning },
    danger: { foreground: colors.danger },
    accent: { foreground: colors.accent }
  };

  return tones[tone];
}

export function MetricCard({ label, value, suffix, icon, footer, trend, tone = "primary" }: MetricCardProps) {
  const { colors } = useAppTheme();
  const { width } = useWindowDimensions();
  const styles = useMemo(() => createStyles(colors, width), [colors, width]);
  const toneColor = getTone(colors, tone);

  return (
    <View style={styles.card}>
      <View style={styles.iconRow}>
        <View style={[styles.iconWrap, { backgroundColor: colors.surfaceMuted }]}>
          <Ionicons name={icon} size={22} color={toneColor.foreground} />
        </View>
      </View>
      <View style={styles.valueRow}>
        <Text adjustsFontSizeToFit  numberOfLines={1} style={styles.value}>
          {value}
        </Text>
        {suffix ? (
          <Text  numberOfLines={1} style={styles.suffix}>
            {suffix}
          </Text>
        ) : null}
      </View>
      <Text style={styles.label}>
        {label}
      </Text>
      {trend ?? footer ? (
        <View style={styles.footerRow}>
          {trend ? <Ionicons name="arrow-up" size={15} color={colors.success} /> : null}
          <Text style={[styles.footer, trend && styles.trend]}>
            {trend ?? footer}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const createStyles = (colors: ThemeColors, width: number) => {
  const compact = width < 420;
  const tablet = width >= 768 && width < 1180;
  const desktop = width >= 1180;

  return StyleSheet.create({
    card: {
      flexGrow: 1,
      flexBasis: tablet || desktop ? "30%" : "45%",
      minWidth: 130,
      minHeight: 158,
      justifyContent: "space-between",
      borderRadius: radius.card,
      borderWidth: 0,
      borderColor: colors.border,
      backgroundColor: colors.card,
      padding: compact ? spacing.md : spacing.lg,
      ...shadows.none
    },
    iconRow: {
      minHeight: 22,
      alignItems: "flex-start",
      justifyContent: "center"
    },
    iconWrap: {
      width: 36,
      height: 36,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: radius.md,
      borderWidth: 0,
      borderColor: "rgba(255,255,255,0.08)"
    },
    label: {
      ...typography.small,
      color: colors.textSecondary,
      minHeight: 22
    },
    valueRow: {
      minHeight: 40,
      flexDirection: "row",
      alignItems: "flex-end",
      gap: spacing.xs,
      marginTop: spacing.sm
    },
    value: {
      flexShrink: 1,
      ...typography.h1,
      color: colors.ink,
      fontWeight: "700"
    },
    suffix: {
      ...typography.body,
      color: colors.muted,
      marginBottom: 4
    },
    footerRow: {
      minHeight: 22,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
      marginTop: spacing.md
    },
    footer: {
      ...typography.small,
      color: colors.muted,
      flexShrink: 1
    },
    trend: {
      color: colors.success,
      fontWeight: "700"
    }
  });
};

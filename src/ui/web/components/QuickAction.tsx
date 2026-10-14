import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useAppTheme } from "../../../theme/AppThemeProvider";
import { radius, shadows, spacing, typography } from "../theme/theme";
import type { ThemeColors } from "../theme/theme";

type QuickActionProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  tone?: "primary" | "accent" | "info" | "warning";
};

function getTone(colors: ThemeColors, tone: NonNullable<QuickActionProps["tone"]>) {
  const tones = {
    primary: { foreground: "#FFFFFF", gradient: ["#0A84FF", "#007AFF"] as const },
    accent: { foreground: colors.white, gradient: ["#F59E0B", "#F97316"] as const },
    info: { foreground: colors.white, gradient: ["#10B981", "#14B8A6"] as const },
    warning: { foreground: colors.white, gradient: ["#FB7185", "#F97316"] as const }
  };

  return tones[tone];
}

export function QuickAction({ icon, title, subtitle, onPress, tone = "primary" }: QuickActionProps) {
  const { colors } = useAppTheme();
  const { width } = useWindowDimensions();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const toneColor = getTone(colors, tone);
  const compact = width < 400;
  const tablet = width >= 768 && width < 1180;
  const desktop = width >= 1180;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.wrap,
        compact && styles.wrapCompact,
        tablet && styles.wrapTablet,
        desktop && styles.wrapDesktop,
        pressed && styles.pressed
      ]}
    >
      <LinearGradient colors={toneColor.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.iconWrap}>
        <Ionicons name={icon} size={compact ? 20 : 23} color={toneColor.foreground} />
      </LinearGradient>
      <View style={styles.copy}>
        <Text adjustsFontSizeToFit maxFontSizeMultiplier={1.15} style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        {subtitle ? (
          <Text maxFontSizeMultiplier={1.15} style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={styles.arrow}>
        <Ionicons name="chevron-forward" size={19} color={colors.textSecondary} />
      </View>
    </Pressable>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  wrap: {
    flexGrow: 1,
    flexBasis: "100%",
    minWidth: 0,
    minHeight: 88,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: spacing.md,
    ...shadows.subtle
  },
  wrapCompact: {
    minHeight: 82,
    padding: spacing.sm
  },
  wrapTablet: {
    flexBasis: "31%"
  },
  wrapDesktop: {
    flexBasis: "18%"
  },
  pressed: {
    opacity: 0.82,
    transform: [{ translateY: 1 }]
  },
  iconWrap: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)"
  },
  copy: {
    flex: 1,
    minWidth: 0
  },
  title: {
    ...typography.h3,
    color: colors.ink,
    minWidth: 0
  },
  subtitle: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: 2
  },
  arrow: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center"
  }
  });

import { Pressable } from "./NativePressable";
import { controlMetrics } from "../theme/theme";
import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useAppTheme } from "../../../theme/AppThemeProvider";
import { radius, shadows, spacing, typography } from "../theme/theme";
import type { ThemeColors } from "../theme/theme";

type QuickActionProps = {
  tile?: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  tone?: "primary" | "accent" | "info" | "warning";
};

function getTone(colors: ThemeColors, tone: NonNullable<QuickActionProps["tone"]>) {
  const tones = {
    primary: { foreground: colors.primary, background: colors.primarySoft },
    accent: { foreground: colors.warning, background: colors.warningSoft },
    info: { foreground: colors.success, background: colors.successSoft },
    warning: { foreground: colors.danger, background: colors.dangerSoft }
  };

  return tones[tone];
}

export function QuickAction({ icon, title, subtitle, onPress, tile = false, tone = "primary" }: QuickActionProps) {
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
        tile && styles.tile,
        pressed && styles.pressed
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: toneColor.background }]}>
        <Ionicons name={icon} size={tile ? 34 : compact ? 20 : 23} color={toneColor.foreground} />
      </View>
      <View style={[styles.copy, tile && { flex: undefined, alignItems: "center" }]}>
        <Text adjustsFontSizeToFit  style={[styles.title, tile && { fontSize: 14, lineHeight: 20, textAlign: "center" }]}>
          {title}
        </Text>
        {subtitle && !tile ? (
          <Text  style={styles.subtitle}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {!tile && <View style={styles.arrow}>
        <Ionicons name="chevron-forward" size={19} color={colors.textSecondary} />
      </View>}
    </Pressable>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  tile: { flexBasis: "45%", flexDirection: "column", minHeight: 126, borderRadius: 16, gap: 12, justifyContent: "center", borderWidth: StyleSheet.hairlineWidth },
  wrap: { flexGrow: 1, flexBasis: "100%", minWidth: controlMetrics.minimumTouchSize, minHeight: 76, flexDirection: "row", alignItems: "center", gap: spacing.md, borderRadius: radius.lg, borderWidth: 0, borderColor: colors.border, backgroundColor: colors.card, padding: spacing.md, ...shadows.none },
  wrapCompact: {
    minHeight: 76,
    padding: spacing.sm
  },
  wrapTablet: {
    flexBasis: "100%"
  },
  wrapDesktop: {
    flexBasis: "100%"
  },
  pressed: {
    opacity: 0.82,
    // Opacity feedback stays comfortable with Reduce Motion enabled.
  },
  iconWrap: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 0,
    borderColor: "rgba(255,255,255,0.18)"
  },
  copy: {
    flex: 1,
    minWidth: 0
  },
  title: {
    ...typography.body,
    fontWeight: "600",
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

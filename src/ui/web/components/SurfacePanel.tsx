import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { useMemo } from "react";
import { Pressable, StyleProp, StyleSheet, Text, useWindowDimensions, View, ViewStyle } from "react-native";
import Animated, { FadeInUp, useReducedMotion } from "react-native-reanimated";
import { useAppTheme } from "../../../theme/AppThemeProvider";
import { radius, shadows, spacing, typography } from "../theme/theme";
import type { ThemeColors } from "../theme/theme";

type SurfacePanelProps = {
  title: string;
  kicker?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  actionLabel?: string;
  onAction?: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function SurfacePanel({
  title,
  kicker,
  icon,
  actionLabel,
  onAction,
  children,
  style
}: SurfacePanelProps) {
  const { colors } = useAppTheme();
  const { width } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const styles = useMemo(() => createStyles(colors, width), [colors, width]);

  return (
    <Animated.View entering={reduceMotion ? undefined : FadeInUp.duration(240)} style={[styles.panel, style]}>
      <View style={styles.header}>
        <View style={styles.titleWrap}>
          {kicker ? (
            <Text maxFontSizeMultiplier={1.15} numberOfLines={1} style={styles.kicker}>
              {kicker}
            </Text>
          ) : null}
          <Text maxFontSizeMultiplier={1.15} numberOfLines={2} style={styles.title}>
            {title}
          </Text>
        </View>
        {onAction && actionLabel ? (
          <Pressable accessibilityRole="button" onPress={onAction} style={styles.action}>
            <Text adjustsFontSizeToFit maxFontSizeMultiplier={1.15} numberOfLines={1} style={styles.actionText}>
              {actionLabel}
            </Text>
          </Pressable>
        ) : icon ? (
          <View style={styles.iconWrap}>
            <Ionicons name={icon} size={21} color={colors.primary} />
          </View>
        ) : null}
      </View>
      {children}
    </Animated.View>
  );
}

const createStyles = (colors: ThemeColors, width: number) => {
  const compact = width < 420;

  return StyleSheet.create({
    panel: {
      gap: compact ? spacing.sm : spacing.md,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      padding: compact ? 20 : 28,
      ...shadows.subtle
    },
    header: {
      minHeight: 44,
      flexDirection: compact ? "column" : "row",
      alignItems: compact ? "stretch" : "center",
      justifyContent: "space-between",
      gap: compact ? spacing.sm : spacing.md
    },
    titleWrap: {
      flex: 1,
      minWidth: 0
    },
    kicker: {
      ...typography.small,
      color: colors.textSecondary,
      marginBottom: 2
    },
    title: {
      ...typography.h2,
      color: colors.ink,
      fontSize: compact ? 18 : 20
    },
    iconWrap: {
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: radius.sm,
      backgroundColor: colors.primarySoft
    },
    action: {
      minHeight: 44,
      alignItems: "center",
      justifyContent: "center",
      alignSelf: compact ? "flex-start" : "auto",
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceElevated,
      paddingHorizontal: spacing.md
    },
    actionText: {
      ...typography.small,
      color: colors.primary
    }
  });
};

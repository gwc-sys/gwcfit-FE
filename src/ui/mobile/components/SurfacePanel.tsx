import { Pressable } from "./NativePressable";
import { controlMetrics } from "../theme/theme";
import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { useMemo } from "react";
import { StyleProp, StyleSheet, Text, useWindowDimensions, View, ViewStyle } from "react-native";
import { useAppTheme } from "../../../theme/AppThemeProvider";
import { radius, shadows, spacing, typography } from "../theme/theme";
import type { ThemeColors } from "../theme/theme";

type SurfacePanelProps = {
  title: string;
  hideHeader?: boolean;
  kicker?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  actionLabel?: string;
  onAction?: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function SurfacePanel({
  title,
  hideHeader = false,
  kicker,
  icon,
  actionLabel,
  onAction,
  children,
  style
}: SurfacePanelProps) {
  const { colors } = useAppTheme();
  const { width } = useWindowDimensions();
  const styles = useMemo(() => createStyles(colors, width), [colors, width]);

  return (
    <View style={[styles.panel, style]}>
      {!hideHeader ? <View style={styles.header}>
        <View style={styles.titleWrap}>
          {kicker ? (
            <Text  numberOfLines={1} style={styles.kicker}>
              {kicker}
            </Text>
          ) : null}
          <Text accessibilityRole="header" style={styles.title}>
            {title}
          </Text>
        </View>
        {onAction && actionLabel ? (
          <Pressable accessibilityRole="button" onPress={onAction} style={styles.action}>
            <Text style={styles.actionText}>
              {actionLabel}
            </Text>
          </Pressable>
        ) : icon ? (
          <View style={styles.iconWrap}>
            <Ionicons name={icon} size={21} color={colors.primary} />
          </View>
        ) : null}
      </View> : null}
      {children}
    </View>
  );
}

const createStyles = (colors: ThemeColors, width: number) => {
  const compact = width < 420;

  return StyleSheet.create({
    panel: {
      gap: compact ? spacing.sm : spacing.md,
      borderRadius: radius.card,
      borderWidth: 0,
      borderColor: colors.border,
      backgroundColor: colors.card,
      padding: compact ? spacing.md : spacing.xl,
      ...shadows.none
    },
    header: {
      minHeight: 44,
      flexDirection: "row",
      alignItems: "center",
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
      fontSize: 20
    },
    iconWrap: {
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: radius.sm,
      backgroundColor: colors.primarySoft
    },
    action: { minHeight: controlMetrics.minimumTouchSize, flexShrink: 1, maxWidth: "48%", alignItems: "center", justifyContent: "center", alignSelf: "center", borderRadius: radius.sm, borderWidth: 0, borderColor: colors.border, backgroundColor: "transparent", paddingHorizontal: spacing.md },
    actionText: {
      ...typography.body,
      color: colors.primary
    }
  });
};

import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { useMemo } from "react";
import { useReducedMotion } from "react-native-reanimated";
import { ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, useWindowDimensions, View, ViewStyle } from "react-native";
import { useAppTheme } from "../../../theme/AppThemeProvider";
import { controlMetrics, radius, shadows, spacing, typography } from "../theme/theme";
import type { ThemeColors } from "../theme/theme";

type IconName = keyof typeof Ionicons.glyphMap;

type PrimaryButtonProps = {
  label?: string;
  title?: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary" | "ghost" | "dark" | "danger";
  icon?: ReactNode | IconName;
  style?: StyleProp<ViewStyle>;
  foregroundColor?: string;
};

export function PrimaryButton({
  label,
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = "primary",
  icon,
  style,
  foregroundColor
}: PrimaryButtonProps) {
  const { colors } = useAppTheme();
  const reduceMotion = useReducedMotion();
  const { width } = useWindowDimensions();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const text = label ?? title ?? "";
  const compact = width < 390;
  const buttonHeight = compact ? 50 : 54;
  const buttonPadding = compact ? 16 : 20;
  const labelSize = 17;
  const iconColor = disabled ? colors.muted : foregroundColor ?? (variant === "ghost" ? colors.primary : variant === "secondary" ? colors.ink : colors.white);
  const iconNode =
    typeof icon === "string" ? (
      <Ionicons
        name={icon as IconName}
        size={20}
        color={iconColor}
      />
    ) : (
      icon
    );

  return (
    <Pressable
      accessibilityLabel={text}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      disabled={disabled || loading}
      hitSlop={4}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        { minHeight: buttonHeight, paddingHorizontal: buttonPadding },
        variant === "primary" && styles.primary,
        variant === "secondary" && styles.secondary,
        variant === "ghost" && styles.ghost,
        variant === "dark" && styles.dark,
        variant === "danger" && styles.danger,
        disabled && styles.disabled,
        loading && { opacity: 0.75 },
        pressed && !disabled && (reduceMotion ? styles.pressedReducedMotion : styles.pressed),
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator color={iconColor} />
      ) : (
        <View style={styles.content}>
          {iconNode}
          <Text
            style={[
              styles.label,
              { fontSize: labelSize },
              variant === "primary" && styles.primaryLabel,
              variant === "secondary" && styles.secondaryLabel,
              variant === "ghost" && styles.ghostLabel,
              variant === "dark" && styles.darkLabel,
              foregroundColor ? { color: foregroundColor } : null,
              disabled && styles.disabledLabel
            ]}
          >
            {text}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  base: {
    minHeight: 54,
    minWidth: controlMetrics.minimumTouchSize,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: spacing.sm,
    overflow: "hidden"
  },
  primary: {
    backgroundColor: colors.primaryButton,
    borderColor: colors.primaryButton,
    ...shadows.none
  },
  secondary: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border
  },
  ghost: {
    backgroundColor: colors.surface,
    borderColor: colors.border
  },
  dark: {
    backgroundColor: colors.dark,
    borderColor: colors.dark
  },
  danger: {
    backgroundColor: colors.dangerButton,
    borderColor: colors.dangerButton
  },
  content: {
    maxWidth: "100%",
    flexShrink: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md
  },
  label: {
    flexShrink: 1,
    textAlign: "center",
    color: colors.white,
    ...typography.body,
    fontWeight: "600"
  },
  primaryLabel: {
    color: colors.white
  },
  secondaryLabel: {
    color: colors.ink
  },
  ghostLabel: {
    color: colors.primary
  },
  darkLabel: {
    color: colors.white
  },
  disabled: {
    backgroundColor: colors.surfaceStrong,
    borderColor: colors.border,
    ...shadows.none
  },
  disabledLabel: {
    color: colors.muted
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.88
  },
  pressedReducedMotion: {
    opacity: 0.88
  }
  });

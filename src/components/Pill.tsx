import { Pressable, StyleSheet, Text } from "react-native";
import { useMemo } from "react";

import { useAppTheme } from "../theme/AppThemeProvider";
import { radius, spacing, typography } from "../theme/theme";
import type { ThemeColors } from "../theme/theme";

type PillProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

export function Pill({ label, selected, onPress }: PillProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: Boolean(selected) }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        selected && styles.selected,
        pressed && styles.pressed
      ]}
    >
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        style={[styles.text, selected && styles.selectedText]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  pill: {
    minHeight: 44,
    minWidth: 92,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface
  },
  selected: {
    borderColor: colors.primaryButton,
    backgroundColor: colors.primaryButton
  },
  pressed: {
    opacity: 0.7
  },
  text: {
    ...typography.body,
    color: colors.muted,
    fontWeight: "700"
  },
  selectedText: {
    color: colors.white
  }
  });

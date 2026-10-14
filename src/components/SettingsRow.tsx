import type { ReactNode } from "react";
import { useMemo } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { ChevronRight } from "./icons";

import { useAppTheme } from "../theme/AppThemeProvider";
import { spacing, typography } from "../theme/theme";
import type { ThemeColors } from "../theme/theme";

type SettingsRowProps = {
  icon: ReactNode;
  label: string;
  value?: string;
  onPress?: () => void;
  switchValue?: boolean;
  onToggle?: () => void;
};

export function SettingsRow({
  icon,
  label,
  value,
  onPress,
  switchValue,
  onToggle
}: SettingsRowProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const hasSwitch = typeof switchValue === "boolean";

  return (
    <Pressable
      accessible={hasSwitch ? false : undefined}
      accessibilityRole={!hasSwitch && onPress ? "button" : undefined}
      accessibilityLabel={!hasSwitch ? [label, value].filter(Boolean).join(": ") : undefined}
      onPress={hasSwitch ? undefined : onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.left}>
        <View style={styles.icon}>{icon}</View>
        <Text style={styles.label}>{label}</Text>
      </View>
      {hasSwitch ? (
        <Switch
          accessibilityLabel={label}
          disabled={!onToggle}
          value={switchValue}
          onValueChange={onToggle}
          trackColor={{ false: colors.surfaceStrong, true: colors.success }}
          thumbColor={colors.white}
        />
      ) : value ? (
        <Text style={styles.value}>{value}</Text>
      ) : (
        <ChevronRight size={26} color={colors.muted} />
      )}
    </Pressable>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  row: {
    minHeight: 66,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    flex: 1
  },
  icon: {
    width: 36,
    alignItems: "center"
  },
  label: {
    flexShrink: 1,
    color: colors.ink,
    ...typography.h3,
    fontWeight: "700"
  },
  value: {
    flexShrink: 1,
    color: colors.muted,
    ...typography.body,
    fontWeight: "700"
  },
  pressed: {
    opacity: 0.72
  }
  });

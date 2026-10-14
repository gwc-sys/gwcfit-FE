import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../theme/AppThemeProvider";
import { radius, spacing, typography } from "../theme/theme";
import type { ThemeColors } from "../theme/theme";

type InfoRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
};

export function InfoRow({ icon, label, value, onPress }: InfoRowProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Pressable
      accessibilityRole={onPress ? "button" : undefined}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.icon}>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <Text maxFontSizeMultiplier={1.15} numberOfLines={2} style={styles.label}>
        {label}
      </Text>
      {value ? (
        <Text maxFontSizeMultiplier={1.15} numberOfLines={2} style={styles.value}>
          {value}
        </Text>
      ) : null}
      {onPress ? <Ionicons name="chevron-forward" size={20} color={colors.subtle} /> : null}
    </Pressable>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  row: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  pressed: {
    opacity: 0.7
  },
  icon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft
  },
  label: {
    ...typography.body,
    flex: 1,
    minWidth: 0,
    color: colors.ink,
    fontWeight: "700"
  },
  value: {
    ...typography.small,
    flexShrink: 1,
    color: colors.muted,
    maxWidth: "46%",
    textAlign: "right"
  }
  });

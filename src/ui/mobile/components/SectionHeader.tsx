import { Pressable } from "./NativePressable";
import { controlMetrics } from "../theme/theme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { useMemo } from "react";
import { useAppTheme } from "../../../theme/AppThemeProvider";
import { radius, spacing, typography } from "../theme/theme";
import type { ThemeColors } from "../theme/theme";

type SectionHeaderProps = {
  title: string;
  action?: string;
  onAction?: () => void;
};

export function SectionHeader({ title, action, onAction }: SectionHeaderProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.row}>
      <Text  numberOfLines={2} style={styles.title}>{title}</Text>
      {action ? (
        <Pressable onPress={onAction} accessibilityRole="button" style={styles.actionButton}>
          <Text adjustsFontSizeToFit  numberOfLines={1} style={styles.action}>{action}</Text>
          <Ionicons name="arrow-forward" size={17} color={colors.primary} />
        </Pressable>
      ) : null}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    marginTop: spacing.xl,
    marginBottom: spacing.md
  },
  title: {
    flex: 1,
    minWidth: 0,
    ...typography.h3,
    color: colors.ink
  },
  actionButton: { minHeight: controlMetrics.minimumTouchSize, maxWidth: "45%", flexDirection: "row", gap: spacing.sm, alignItems: "center", justifyContent: "center", borderRadius: radius.sm, borderWidth: 0, borderColor: colors.border, backgroundColor: "transparent", paddingHorizontal: spacing.md },
  action: {
    ...typography.body,
    color: colors.primary,
    fontWeight: "500"
  }
  });

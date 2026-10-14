import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../../../theme/AppThemeProvider";
import { radius, spacing, typography } from "../theme/theme";
import type { ThemeColors } from "../theme/theme";
import { PrimaryButton } from "./PrimaryButton";

type EmptyStateProps = {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ icon = "file-tray-outline", title, message, actionLabel, onAction }: EmptyStateProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.wrap}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={24} color={colors.muted} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {actionLabel && onAction ? (
        <PrimaryButton title={actionLabel} onPress={onAction} variant="secondary" style={styles.action} />
      ) : null}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
    padding: spacing.lg
  },
  iconWrap: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted
  },
  title: {
    ...typography.h3,
    color: colors.ink,
    textAlign: "center"
  },
  message: {
    ...typography.small,
    color: colors.muted,
    textAlign: "center"
  },
  action: {
    minWidth: 160,
    marginTop: spacing.xs
  }
  });

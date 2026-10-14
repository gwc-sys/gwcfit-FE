import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../../../theme/AppThemeProvider";
import { radius, spacing, typography } from "../theme/theme";
import type { ThemeColors } from "../theme/theme";
import { EmptyState } from "./EmptyState";

type DataStateProps = {
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  emptyTitle?: string;
  emptyMessage?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
};

export function DataState({
  loading,
  error,
  empty,
  emptyTitle = "Nothing here yet",
  emptyMessage = "Records will appear here once they are available.",
  emptyActionLabel,
  onEmptyAction
}: DataStateProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (loading) {
    return <SkeletonList />;
  }

  if (error) {
    return (
      <View accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.errorBox}>
        <Ionicons name="alert-circle-outline" size={22} color={colors.danger} />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (empty) {
    return (
      <EmptyState
        icon="file-tray-outline"
        title={emptyTitle}
        message={emptyMessage}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
      />
    );
  }

  return null;
}

export function SkeletonList({ rows = 3 }: { rows?: number }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View accessible accessibilityLabel="Loading records" accessibilityState={{ busy: true }} style={styles.skeletonList}>
      {Array.from({ length: rows }).map((_, index) => (
        <View key={index} style={styles.skeletonRow}>
          <View style={styles.skeletonIcon} />
          <View style={styles.skeletonBody}>
            <View style={styles.skeletonLineWide} />
            <View style={styles.skeletonLine} />
          </View>
        </View>
      ))}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  errorBox: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderRadius: radius.sm,
    padding: spacing.md,
    backgroundColor: colors.dangerSoft
  },
  errorText: {
    ...typography.small,
    color: colors.danger,
    flex: 1
  },
  skeletonList: {
    gap: spacing.sm
  },
  skeletonRow: {
    minHeight: 82,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md
  },
  skeletonIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceStrong
  },
  skeletonBody: {
    flex: 1,
    gap: spacing.sm
  },
  skeletonLineWide: {
    width: "70%",
    height: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceStrong
  },
  skeletonLine: {
    width: "42%",
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceStrong
  }
  });

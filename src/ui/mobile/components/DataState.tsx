import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../../../theme/AppThemeProvider";
import { radius, spacing, typography } from "../theme/theme";
import type { ThemeColors } from "../theme/theme";
import { EmptyState } from "./EmptyState";
import { Pressable } from "./NativePressable";

type DataStateProps = {
  compact?: boolean;
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  emptyTitle?: string;
  emptyMessage?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
};

export function DataState({
  compact = false,
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
        {/network error|failed to fetch|network request failed|timed? ?out/i.test(error) ? (
          <Text style={styles.connectionHint}>Check your connection and try again.</Text>
        ) : null}
      </View>
    );
  }

  if (empty) {
    if (compact) return <View style={{ gap: 6, paddingVertical: 12 }}>
      <Text style={{ color: colors.ink, fontSize: 17, fontWeight: "600" }}>{emptyTitle}</Text>
      <Text style={{ color: colors.muted, fontSize: 14, lineHeight: 20 }}>{emptyMessage}</Text>
      {emptyActionLabel && onEmptyAction ? <Pressable accessibilityRole="button" onPress={onEmptyAction} style={({ pressed }) => ({ minHeight: 44, alignSelf: "flex-start", justifyContent: "center", opacity: pressed ? 0.6 : 1 })}><Text style={{ color: colors.primary, fontSize: 15, fontWeight: "600" }}>{emptyActionLabel}</Text></Pressable> : null}
    </View>;
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
    flexWrap: "wrap",
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
  connectionHint: {
    ...typography.small,
    color: colors.ink,
    flexBasis: "100%"
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

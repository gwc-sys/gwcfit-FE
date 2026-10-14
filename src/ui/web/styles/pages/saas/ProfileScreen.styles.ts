import { StyleSheet } from "react-native";
import { radius, spacing, typography } from "../../../theme/theme";
import type { ThemeColors } from "../../../theme/theme";

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    screen: {
      gap: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: 112,
    },
    hero: {
      minHeight: 142,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      borderRadius: radius.md,
      padding: spacing.lg,
      backgroundColor: colors.ink,
    },
    avatar: {
      width: 72,
      height: 72,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: radius.pill,
      backgroundColor: "rgba(255,255,255,0.16)",
    },
    avatarText: {
      ...typography.h2,
      color: colors.white,
    },
    heroBody: {
      flex: 1,
      gap: spacing.xs,
    },
    name: {
      ...typography.h1,
      color: colors.ink,
    },
    email: {
      ...typography.body,
      color: "rgba(255,255,255,0.72)",
    },
    quickRow: {
      flexDirection: "row",
      gap: spacing.sm,
    },
    quickButton: {
      flex: 1,
    },
    infoRow: {
      minHeight: 56,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.md,
      borderRadius: radius.sm,
      paddingHorizontal: spacing.md,
      backgroundColor: colors.surface,
    },
    infoLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      flex: 1,
    },
    infoLabel: {
      ...typography.small,
      color: colors.muted,
    },
    infoValue: {
      ...typography.body,
      color: colors.ink,
      flex: 1,
      textAlign: "right",
    },
    permissions: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
    },
  });

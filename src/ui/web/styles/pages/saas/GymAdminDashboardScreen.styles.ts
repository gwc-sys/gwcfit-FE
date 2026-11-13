import { StyleSheet } from "react-native";
import { radius, spacing, typography } from "../../../theme/theme";
import type { ThemeColors } from "../../../theme/theme";

export {
  ownerProfileStyles,
  ownerCalendarStyles,
  createOwnerDashboardStyles,
} from "./GymOwnerDashboardScreen.styles";

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    screen: {
      gap: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: 112,
    },
    hero: {
      minHeight: 154,
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.md,
      borderRadius: radius.md,
      padding: spacing.lg,
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1,
      borderColor: colors.surfaceMuted,
    },
    heroCopy: {
      flex: 1,
      minWidth: 0,
    },
    kicker: {
      ...typography.small,
      color: colors.primary,
      marginBottom: spacing.xs,
    },
    heroTitle: {
      ...typography.h1,
      color: colors.ink,
    },
    heroText: {
      ...typography.body,
      color: colors.muted,
      marginTop: spacing.xs,
    },
    heroBadges: {
      maxWidth: 320,
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
    },
    heroBadge: {
      minHeight: 32,
      justifyContent: "center",
      borderRadius: radius.pill,
      backgroundColor: colors.surfaceMuted,
      paddingHorizontal: spacing.md,
    },
    heroBadgeText: {
      ...typography.small,
      color: colors.ink,
    },
    quickGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.md,
      alignItems: "stretch",
    },
    metrics: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.md,
      alignItems: "stretch",
    },
    memberList: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.md,
    },
    memberRow: {
      flexGrow: 1,
      flexBasis: 300,
      minHeight: 124,
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      gap: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
      backgroundColor: colors.surfaceElevated,
    },
    avatar: {
      width: 42,
      height: 42,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: radius.pill,
      backgroundColor: colors.primarySoft,
    },
    avatarText: {
      ...typography.h3,
      color: colors.primary,
    },
    memberBody: {
      flex: 1,
    },
    memberName: {
      ...typography.h3,
      color: colors.ink,
    },
    memberMeta: {
      ...typography.small,
      color: colors.muted,
    },
  });




import { adaptPageStyles } from "../../adaptPageStyles";
import { StyleSheet } from "react-native";
import { radius, spacing, typography } from "../../../theme/theme";
import type { ThemeColors } from "../../../theme/theme";

export const createStyles = (colors: ThemeColors) =>
  adaptPageStyles(StyleSheet.create({
    screen: {
      gap: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: 32
    },
    hero: {
      minHeight: 142,
      flexDirection: "column",
      alignItems: "center",
      gap: 14,
      borderRadius: 24,
      padding: 24,
      backgroundColor: colors.surface
    },
    avatar: {
      width: 76,
      height: 76,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 38,
      backgroundColor: colors.primarySoft
    },
    avatarText: {
      ...typography.h2,
      color: colors.primary
    },
    heroBody: {
      flex: undefined,
      gap: 8,
      alignItems: "center",
      width: "100%"
    },
    name: {
      ...typography.h1,
      color: colors.ink,
      fontSize: 24,
      lineHeight: 31,
      textAlign: "center"
    },
    email: {
      ...typography.body,
      color: colors.muted,
      fontSize: 15,
      lineHeight: 22,
      textAlign: "center"
    },
    quickRow: {
      flexDirection: "row",
      gap: spacing.sm,
      flexWrap: "wrap"
    },
    quickButton: {
      flex: undefined,
      flexGrow: 1,
      minHeight: 48
    },
    infoRow: {
      minHeight: 64,
      flexDirection: "column",
      alignItems: "stretch",
      justifyContent: "space-between",
      gap: 6,
      borderRadius: radius.sm,
      paddingHorizontal: spacing.md,
      backgroundColor: colors.surface,
      paddingVertical: 12
    },
    infoLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      flex: undefined
    },
    infoLabel: {
      ...typography.small,
      color: colors.muted,
    },
    infoValue: {
      ...typography.body,
      color: colors.ink,
      flex: undefined,
      textAlign: "left",
      fontSize: 16,
      lineHeight: 23
    },
    permissions: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
    },
  }));

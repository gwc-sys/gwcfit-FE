import { StyleSheet } from "react-native";
import { radius, spacing, typography } from "../../../theme/theme";
import type { ThemeColors } from "../../../theme/theme";

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  screen: {
    gap: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 112
  },
  hero: {
    minHeight: 164,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    borderRadius: radius.md,
    padding: spacing.lg,
    backgroundColor: colors.surfaceElevated
  },
  heroCopy: {
    flex: 1
  },
  kicker: {
    ...typography.small,
    color: colors.primary,
    marginBottom: spacing.xs
  },
  heroTitle: {
    ...typography.h1,
    color: colors.ink
  },
  heroText: {
    ...typography.body,
    color: colors.muted,
    marginTop: spacing.xs
  },
  heroIcon: {
    width: 70,
    height: 70,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    backgroundColor: colors.primary
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md
  },
  lowerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginTop: spacing.md
  },
  recentPanel: {
    flexGrow: 1,
    flexBasis: 520
  },
  healthPanel: {
    flexGrow: 1,
    flexBasis: 320
  },
  metrics: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md
  },
  gymList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md
  },
  gymRow: {
    flexGrow: 1,
    flexBasis: 300,
    minHeight: 106,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    backgroundColor: colors.surfaceElevated
  },
  gymIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft
  },
  gymBody: {
    flex: 1
  },
  gymName: {
    ...typography.h3,
    color: colors.ink
  },
  gymMeta: {
    ...typography.small,
    color: colors.muted
  },
  healthList: {
    gap: spacing.sm
  },
  healthRow: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderMuted,
    paddingVertical: spacing.sm
  },
  healthDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  healthLabel: {
    flex: 1,
    ...typography.body,
    color: colors.inkSoft
  },
  healthValue: {
    ...typography.small,
    fontWeight: "800"
  },
  healthLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.md,
    paddingTop: spacing.md
  },
  healthLinkText: {
    ...typography.small,
    color: colors.primary,
    fontWeight: "800"
  }
  });

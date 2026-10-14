import type { ThemeColors } from "../../../theme/theme";
import { StyleSheet } from "react-native";
import { radius, spacing, typography } from "../../../theme/theme";

export const createFeatureStyles = (colors: ThemeColors) => StyleSheet.create({
  screen: {
    gap: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 112
  },
  flex: {
    flex: 1
  },
  panel: {
    gap: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.darkCard,
    padding: spacing.md
  },
  panelHeader: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md
  },
  kicker: {
    ...typography.small,
    color: colors.muted
  },
  largeTitle: {
    ...typography.h2,
    color: colors.ink,
    marginTop: spacing.xs
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.ink
  },
  separator: {
    height: spacing.sm
  },
  buttonRow: {
    flexDirection: "row",
    gap: spacing.sm
  },
  buttonFlex: {
    flex: 1
  },
  inputRow: {
    gap: spacing.md
  },
  settingRow: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    padding: spacing.md
  },
  rowTitle: {
    ...typography.body,
    color: colors.ink,
    fontWeight: "800"
  },
  rowText: {
    ...typography.small,
    color: colors.muted
  }
});

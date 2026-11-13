import type { ThemeColors } from "../../../theme/theme";
import { adaptPageStyles } from "../../adaptPageStyles";
import { StyleSheet } from "react-native";
import { radius, spacing, typography } from "../../../theme/theme";

export const createFeatureStyles = (colors: ThemeColors): any => adaptPageStyles(StyleSheet.create({
  screen: {
      gap: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: 32
    },
  flex: {
    flex: 1
  },
  panel: {
    gap: spacing.md,
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: spacing.md
  },
  feedbackPanel: { gap: spacing.lg, borderRadius: radius.sm, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border, backgroundColor: colors.card, padding: spacing.md },
  trainerDetails: { gap: 0, borderTopWidth: 1, borderTopColor: colors.border },
  trainerDetailRow: { minHeight: 64, flexDirection: "row", alignItems: "center", gap: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: spacing.sm },
  trainerDetailIcon: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 20, backgroundColor: colors.primarySoft },
  trainerDetailCopy: { flex: 1, minWidth: 0 },
  trainerDetailLabel: { ...typography.body, color: colors.ink, fontWeight: "700" },
  trainerDetailValue: { ...typography.small, color: colors.muted, marginTop: 2 },
  feedbackHeader: { gap: 4 },
  feedbackTitle: { ...typography.h2, color: colors.ink },
  feedbackScoreRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  feedbackScoreText: { ...typography.small, color: colors.muted, fontWeight: "700" },
  feedbackStars: { flexDirection: "row", gap: 8 },
  feedbackStarButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center", borderRadius: 22, backgroundColor: colors.surfaceMuted },
  feedbackStarButtonActive: { backgroundColor: colors.primarySoft },
  feedbackStar: { fontSize: 23, lineHeight: 28 },
  feedbackOptions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  feedbackOption: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: colors.surface },
  feedbackOptionActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  feedbackOptionText: { ...typography.small, color: colors.ink },
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
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    padding: spacing.md
  },
  rowTitle: {
    ...typography.body,
    color: colors.ink,
    fontWeight: "600"
  },
  rowText: {
    ...typography.small,
    color: colors.muted
  }
}));

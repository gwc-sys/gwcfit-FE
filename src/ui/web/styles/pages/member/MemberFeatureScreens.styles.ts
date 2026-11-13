import type { ThemeColors } from "../../../theme/theme";
import { StyleSheet } from "react-native";
import { radius, spacing, typography } from "../../../theme/theme";

export const createFeatureStyles = (colors: ThemeColors) => StyleSheet.create({
  screen: {
    gap: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl
  },
  flex: {
    flex: 1
  },
  mealPlanHeader: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  mealPlanHeaderAction: {
    alignItems: "flex-end",
    gap: spacing.xs
  },
  mealPlanHeaderLabel: {
    ...typography.small,
    color: colors.muted
  },
  mealComposer: {
    gap: spacing.lg
  },
  mealComposerHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md
  },
  mealComposerSubtitle: {
    ...typography.small,
    color: colors.muted,
    marginTop: spacing.xs
  },
  mealComposerAction: {
    alignSelf: "flex-start"
  },
  mealPlanGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    alignItems: "flex-start"
  },
  mealPlanCard: {
    flexGrow: 0,
    flexShrink: 1,
    flexBasis: 360,
    minWidth: 280,
    maxWidth: 420,
    alignSelf: "flex-start",
    overflow: "hidden",
    borderRadius: radius.md,
    borderWidth: 0,
    borderColor: "transparent",
    backgroundColor: colors.surface
  },
  mealPlanImageWrap: {
    height: 112,
    overflow: "hidden",
    backgroundColor: colors.surfaceStrong
  },
  mealPlanImage: {
    width: "100%",
    height: "100%"
  },
  mealPlanStatus: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.sm,
    borderRadius: 999,
    backgroundColor: colors.successSoft,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  mealPlanStatusComplete: {
    backgroundColor: colors.primarySoft
  },
  mealPlanStatusText: {
    ...typography.small,
    color: colors.success,
    fontWeight: "700"
  },
  mealPlanStatusTextComplete: {
    color: colors.primary
  },
  mealPlanCardBody: {
    gap: 6,
    padding: spacing.md
  },
  mealPlanCardPressed: {
    opacity: 0.86
  },
  mealPlanTitle: {
    ...typography.h3,
    color: colors.ink
  },
  mealPlanType: {
    ...typography.small,
    color: colors.muted
  },
  mealPlanDescription: {
    ...typography.small,
    color: colors.inkSoft,
    lineHeight: 17
  },
  mealPlanMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
    borderTopWidth: 0,
    borderTopColor: "transparent",
    paddingTop: spacing.sm
  },
  mealPlanMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  mealPlanMetaText: {
    ...typography.small,
    color: colors.inkSoft,
    fontWeight: "700",
    fontVariant: ["tabular-nums"]
  },
  mealPlanOwner: {
    minHeight: 28,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  mealPlanAvatar: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: colors.primary
  },
  mealPlanAvatarText: {
    ...typography.small,
    color: colors.white,
    fontWeight: "700"
  },
  mealPlanOwnerText: {
    flex: 1,
    minWidth: 0,
    ...typography.small,
    color: colors.muted
  },
  mealPlanDisclosure: {
    minHeight: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    borderTopWidth: 0,
    borderTopColor: "transparent",
    paddingTop: 4
  },
  mealPlanDisclosureText: {
    ...typography.small,
    color: colors.primary,
    fontWeight: "700"
  },
  mealPlanDetail: {
    gap: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: spacing.xl
  },
  mealPlanDetailHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  mealPlanDetailSubtitle: {
    ...typography.small,
    color: colors.muted,
    marginTop: 4
  },
  mealPlanDetailClose: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: spacing.sm
  },
  mealPlanDetailCloseText: {
    ...typography.small,
    color: colors.primary,
    fontWeight: "700"
  },
  mealPlanFoodsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  mealPlanFoodsTitle: {
    ...typography.small,
    color: colors.ink,
    fontWeight: "700"
  },
  mealPlanFoodRow: {
    flexGrow: 1,
    flexBasis: 220,
    minWidth: 220,
    maxWidth: 360,
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  mealPlanFoodText: {
    flex: 1,
    minWidth: 0,
    ...typography.small,
    color: colors.inkSoft
  },
  mealPlanEmptyFoods: {
    ...typography.small,
    color: colors.muted
  },
  mealPlanCompleteButton: {
    alignSelf: "stretch",
    marginHorizontal: spacing.md,
    marginBottom: spacing.md
  },
  panel: {
    gap: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: spacing.xl
  },
  trainerDetails: { gap: 0, borderTopWidth: 1, borderTopColor: colors.border },
  trainerDetailRow: { minHeight: 64, flexDirection: "row", alignItems: "center", gap: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: spacing.sm },
  trainerDetailIcon: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 20, backgroundColor: colors.primarySoft },
  trainerDetailCopy: { flex: 1, minWidth: 0 },
  trainerDetailLabel: { ...typography.body, color: colors.ink, fontWeight: "700" },
  trainerDetailValue: { ...typography.small, color: colors.muted, marginTop: 2 },
  feedbackPanel: {
    gap: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: spacing.xl
  },
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
});

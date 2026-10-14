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
    minHeight: 138,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    backgroundColor: colors.surface
  },
  avatar: {
    width: 72,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft
  },
  avatarText: {
    ...typography.h2,
    color: colors.primaryDark
  },
  heroBody: {
    flex: 1,
    gap: spacing.xs
  },
  name: {
    ...typography.h1,
    color: colors.ink
  },
  meta: {
    ...typography.body,
    color: colors.muted
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  actionButton: {
    flexGrow: 1,
    flexBasis: 150
  },
  modalBackdrop: { flex: 1, justifyContent: "center", alignItems: "center", padding: spacing.lg, backgroundColor: "rgba(0,0,0,0.72)" },
  modalCard: { width: "100%", maxWidth: 620, maxHeight: "82%", gap: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, backgroundColor: colors.surface },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing.md },
  modalTitle: { ...typography.h2, color: colors.ink },
  modalSubtitle: { ...typography.small, color: colors.muted, marginTop: spacing.xs },
  closeButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: radius.pill, backgroundColor: colors.surfaceMuted },
  trainerList: { flexGrow: 0 },
  trainerListContent: { gap: spacing.sm },
  trainerOption: { minHeight: 78, flexDirection: "row", alignItems: "center", gap: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, padding: spacing.md, backgroundColor: colors.surfaceMuted },
  trainerOptionSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  trainerAvatar: { width: 46, height: 46, alignItems: "center", justifyContent: "center", borderRadius: radius.pill, backgroundColor: colors.primarySoft },
  trainerAvatarText: { ...typography.body, color: colors.primary, fontWeight: "700" },
  trainerInfo: { flex: 1, gap: 4 },
  trainerName: { ...typography.body, color: colors.ink, fontWeight: "700" },
  trainerMastery: { ...typography.small, color: colors.muted },
  modalActions: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  errorText: { ...typography.small, color: colors.danger },
  emptyText: { ...typography.body, color: colors.muted, textAlign: "center", padding: spacing.lg },
  detailList: {
    gap: spacing.sm
  },
  detail: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface
  },
  detailLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1
  },
  detailLabel: {
    ...typography.small,
    color: colors.muted
  },
  detailValue: {
    ...typography.body,
    color: colors.ink,
    flexShrink: 1,
    textAlign: "right"
  }
  });

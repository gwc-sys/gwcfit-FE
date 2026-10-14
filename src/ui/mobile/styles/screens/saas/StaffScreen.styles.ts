import { controlMetrics } from "../../../theme/theme";
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
  screenCompact: {
    gap: spacing.md
  },
  pageHeader: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: spacing.lg },
  pageHeaderCompact: { flexDirection: "column" },
  pageTitle: { ...typography.h1, color: colors.ink },
  pageSubtitle: { ...typography.body, color: colors.muted, marginTop: 4 },
  headerActions: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  headerButton: { minHeight: controlMetrics.minimumTouchSize, flexDirection: "row", alignItems: "center", gap: spacing.xs, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: spacing.md, backgroundColor: colors.surface },
  headerButtonText: { ...typography.small, color: colors.ink },
  addButton: { minHeight: 44 },
  metrics: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md
  },
  countCard: {
    minWidth: 142,
    flex: 1,
    minHeight: 122,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.xs
  },
  tableCard: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, overflow: "hidden", backgroundColor: colors.surface },
  tableHeader: { minHeight: 48, flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingHorizontal: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  columnHeader: { flex: 1, ...typography.small, color: colors.muted },
  userColumn: { flex: 1.5 },
  actionColumn: { flex: 1.1, textAlign: "center" },
  countIcon: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft
  },
  countValue: {
    ...typography.h2,
    color: colors.ink
  },
  countLabel: {
    ...typography.small,
    color: colors.muted
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  filterPill: { minHeight: controlMetrics.minimumTouchSize, flexDirection: "row", alignItems: "center", gap: spacing.xs, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, paddingHorizontal: spacing.md },
  filterPillSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary
  },
  filterText: {
    ...typography.small,
    color: colors.muted
  },
  filterTextSelected: {
    color: colors.white
  },
  searchWrap: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface
  },
  searchInput: {
    flex: 1,
    color: colors.ink,
    ...typography.body
  },
  formGrid: {
    gap: spacing.md
  },
  fieldGroup: {
    gap: spacing.xs
  },
  fieldLabel: {
    ...typography.small,
    color: colors.ink
  },
  optionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  optionButton: { minHeight: controlMetrics.minimumTouchSize, minWidth: 132, flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.xs, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, paddingHorizontal: spacing.sm },
  optionButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary
  },
  optionText: {
    ...typography.small,
    color: colors.muted
  },
  optionTextSelected: {
    color: colors.white
  },
  readOnlyRole: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surfaceElevated
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  actionButton: {
    flex: 1,
    minWidth: 142
  },
  detailGrid: {
    gap: spacing.sm
  },
  detailRow: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md
  },
  detailLabel: {
    ...typography.small,
    color: colors.muted
  },
  detailValue: {
    ...typography.small,
    color: colors.ink,
    flex: 1,
    minWidth: 160,
    textAlign: "right"
  },
  notice: {
    ...typography.small,
    color: colors.primaryDark
  },
  protectedNotice: {
    ...typography.small,
    color: colors.muted,
    borderRadius: radius.sm,
    padding: spacing.sm,
    backgroundColor: colors.surfaceElevated
  },
  error: {
    ...typography.small,
    color: colors.danger
  },
  separator: {
    height: spacing.sm
  },
  userRow: {
    minHeight: 82,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface
  },
  userRowCompact: {
    flexDirection: "column",
    alignItems: "stretch"
  },
  avatar: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft
  },
  avatarText: {
    ...typography.h3,
    color: colors.primaryDark
  },
  userBody: {
    flex: 1,
    minWidth: 0,
    gap: 4
  },
  userCell: { flex: 1.5, minWidth: 0, flexDirection: "row", alignItems: "center", gap: spacing.sm },
  roleCell: { flex: 1, minWidth: 0 },
  gymCell: { flex: 1, minWidth: 0 },
  statusCell: { flex: 0.9, minWidth: 0 },
  joinCell: { flex: 1, minWidth: 0 },
  cellText: { ...typography.small, color: colors.ink },
  topLine: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  userName: {
    ...typography.h3,
    color: colors.ink,
    flex: 1
  },
  userMeta: {
    ...typography.small,
    color: colors.muted
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs
  },
  rowActions: {
    flex: 1.1,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.xs
  },
  rowActionsCompact: {
    flexDirection: "row",
    justifyContent: "flex-end"
  },
  iconButton: { width: controlMetrics.minimumTouchSize, height: controlMetrics.minimumTouchSize, alignItems: "center", justifyContent: "center", borderRadius: radius.sm, backgroundColor: colors.surface },
  disabledIcon: {
    opacity: 0.42
  },
  pressed: {
    opacity: 0.75
  }
  }));

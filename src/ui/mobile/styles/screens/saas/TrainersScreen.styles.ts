import { controlMetrics } from "../../../theme/theme";
import { adaptPageStyles } from "../../adaptPageStyles";
import { StyleSheet } from "react-native";
import { radius, spacing, typography } from "../../../theme/theme";
import type { ThemeColors } from "../../../theme/theme";

export const createStyles = (colors: ThemeColors) => adaptPageStyles(StyleSheet.create({ screen: {
      gap: spacing.md,
      paddingTop: spacing.md,
      paddingBottom: 32
    }, pageHeader: {
      flexDirection: "column",
      justifyContent: "space-between",
      gap: spacing.lg
    }, title: { ...typography.h1, color: colors.ink }, subtitle: { ...typography.body, color: colors.muted, marginTop: 4 }, headerActions: {
      flex: undefined,
      flexDirection: "row",
      justifyContent: "flex-start",
      alignItems: "center",
      gap: spacing.sm,
      width: "100%",
      flexWrap: "wrap"
    }, searchBox: {
      width: "100%",
      minHeight: 44,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      borderWidth: 0,
      borderColor: colors.border,
      borderRadius: radius.sm,
      paddingHorizontal: spacing.sm,
      backgroundColor: colors.surfaceMuted
    }, searchInput: { flex: 1, color: colors.ink, ...typography.body }, outlineButton: { minHeight: controlMetrics.minimumTouchSize, flexDirection: "row", alignItems: "center", gap: spacing.xs, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: spacing.md, backgroundColor: colors.surface }, buttonText: { ...typography.small, color: colors.ink }, addButton: { minHeight: 44 }, statsGrid: {
      flexDirection: "row",
      gap: spacing.md,
      flexWrap: "wrap"
    }, statCard: {
      flex: undefined,
      minWidth: 0,
      minHeight: 112,
      flexDirection: "column",
      alignItems: "flex-start",
      gap: spacing.md,
      borderWidth: 0,
      borderColor: colors.border,
      borderRadius: 20,
      padding: spacing.md,
      backgroundColor: colors.surface,
      flexGrow: 1,
      flexBasis: "44%"
    }, statIcon: {
      width: 34,
      height: 34,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: radius.sm
    }, statLabel: { ...typography.small, color: colors.muted }, statValue: { ...typography.h2, color: colors.ink }, statTrend: { ...typography.small, color: colors.success }, tableCard: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, overflow: "hidden", backgroundColor: colors.surface }, filterBar: {
      minHeight: 64,
      flexDirection: "column",
      alignItems: "stretch",
      justifyContent: "space-between",
      gap: spacing.md,
      padding: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border
    }, tabs: { flexDirection: "row", flexWrap: "wrap", gap: 2 }, tab: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.sm, minHeight: controlMetrics.minimumTouchSize, justifyContent: "center" }, tabActive: { backgroundColor: colors.primarySoft }, tabText: { ...typography.small, color: colors.muted }, tabTextActive: { color: colors.primary, fontWeight: "800" }, sortBox: { minHeight: 40, flexDirection: "row", alignItems: "center", gap: spacing.xs, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: spacing.sm }, tableHeader: {
      minHeight: 48,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      display: "none"
    }, columnHeader: { flex: 1, ...typography.small, color: colors.muted }, trainerCol: {
      flex: undefined
    }, row: {
      minHeight: 82,
      flexDirection: "column",
      alignItems: "stretch",
      gap: 12,
      paddingHorizontal: spacing.md,
      paddingVertical: 18
    }, separator: { height: 1, backgroundColor: colors.border }, trainerCell: { flexDirection: "row", alignItems: "center", gap: spacing.sm, minWidth: 0 }, avatar: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderRadius: 21, backgroundColor: colors.primarySoft }, avatarText: { color: colors.primary, fontWeight: "800" }, identity: { flex: 1, minWidth: 0 }, name: { ...typography.body, color: colors.ink, fontWeight: "800" }, meta: { ...typography.small, color: colors.muted, marginTop: 2 }, contactCell: {
      flex: undefined,
      minWidth: 0
    }, specialtyCell: {
      flex: undefined,
      minWidth: 0,
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 4
    }, specialtyTag: { ...typography.small, color: colors.primary, backgroundColor: colors.primarySoft, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 4 }, ratingCell: {
      flex: undefined
    }, stars: { color: "#FBBF24", fontSize: 12 }, assignedCell: {
      flex: undefined
    }, progress: { height: 5, width: 65, marginTop: 5, borderRadius: 5, backgroundColor: colors.surfaceMuted }, progressFill: { width: "70%", height: 5, borderRadius: 5, backgroundColor: colors.primary }, statusCell: {
      flex: undefined
    }, dateCell: {
      flex: undefined,
      ...typography.small,
      color: colors.ink
    }, actions: {
      flex: undefined,
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 4
    }, iconButton: { width: controlMetrics.minimumTouchSize, height: controlMetrics.minimumTouchSize, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm }, cellText: { ...typography.small, color: colors.ink }, pagination: {
      minHeight: 58,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.md,
      flexWrap: "wrap",
      gap: 12,
      paddingVertical: 12
    }, paginationText: { ...typography.small, color: colors.muted }, paginationActions: { flexDirection: "row", alignItems: "center", gap: spacing.sm }, pageButton: { width: controlMetrics.minimumTouchSize, height: controlMetrics.minimumTouchSize, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm }, pageNumber: { color: colors.primary, fontWeight: "800" }, modalBackdrop: { flex: 1, justifyContent: "center", alignItems: "center", padding: spacing.lg, backgroundColor: "rgba(2,6,23,0.7)" }, formCard: { width: "100%", maxWidth: 480, gap: spacing.sm, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface }, formTitle: { ...typography.h2, color: colors.ink }, input: { minHeight: 46, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: spacing.md, color: colors.ink, backgroundColor: colors.surfaceMuted }, formActions: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm } }));

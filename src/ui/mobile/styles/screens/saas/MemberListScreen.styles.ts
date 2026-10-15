import { controlMetrics } from "../../../theme/theme";
import { adaptPageStyles } from "../../adaptPageStyles";
import { StyleSheet } from "react-native";
import { radius, spacing, typography } from "../../../theme/theme";
import type { ThemeColors } from "../../../theme/theme";

export const createPlatformDirectoryStyles = (colors: ThemeColors) => adaptPageStyles(StyleSheet.create({
  screen: {
      gap: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: 32
    },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md }, headerActions: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      justifyContent: "flex-start",
      gap: 8,
      flex: undefined,
      width: "100%"
    },
  title: { ...typography.h1, color: colors.ink }, subtitle: { ...typography.body, color: colors.muted, marginTop: spacing.xs },
  platformBadge: { flexDirection: "row", alignItems: "center", gap: spacing.xs, borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: spacing.sm, backgroundColor: colors.primarySoft }, platformBadgeText: { ...typography.small, color: colors.primaryDark, fontWeight: "700" },
  search: { minHeight: 50, minWidth: 250, flexDirection: "row", alignItems: "center", gap: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: spacing.md, backgroundColor: colors.surface }, searchInput: { flex: 1, color: colors.ink, ...typography.body }, headerButton: { minHeight: controlMetrics.minimumTouchSize, flexDirection: "row", alignItems: "center", gap: spacing.xs, borderWidth: 0, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: spacing.md, backgroundColor: colors.surface, flexGrow: 1, justifyContent: "center" }, headerButtonText: { ...typography.body, color: colors.ink }, addButton: { minHeight: 50 },
  stats: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }, stat: { flex: 1, minWidth: 190, minHeight: 125, flexDirection: "row", alignItems: "center", gap: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, backgroundColor: colors.surface }, statIcon: {
      width: 32,
      height: 32,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 10
    }, statValue: {
      ...typography.h2,
      color: colors.ink,
      marginTop: 3,
      fontSize: 28,
      lineHeight: 34
    }, statLabel: {
      ...typography.small,
      color: colors.muted,
      fontSize: 13,
      lineHeight: 18
    }, liveText: { ...typography.small, color: colors.success, marginTop: 3 },
  tableCard: {
      gap: 0,
      borderWidth: 0,
      borderColor: colors.border,
      borderRadius: 24,
      overflow: "hidden",
      backgroundColor: colors.surface
    }, filterBar: {
      minHeight: 74,
      flexDirection: "column",
      alignItems: "stretch",
      justifyContent: "space-between",
      gap: 10,
      padding: 12
    }, filterTabs: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 4
    }, filterTab: { borderRadius: radius.sm, paddingHorizontal: 10, paddingVertical: spacing.sm, minHeight: controlMetrics.minimumTouchSize, justifyContent: "center" }, filterTabActive: { backgroundColor: colors.primaryButton }, filterTabText: {
      ...typography.small,
      color: colors.muted,
      fontSize: 13
    }, filterTabTextActive: { color: colors.primaryDark, fontWeight: "800" }, loadedLabel: { ...typography.small, color: colors.muted }, tableHeader: {
      minHeight: 52,
      flexDirection: "row",
      alignItems: "center",
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: spacing.md,
      gap: spacing.sm,
      display: "none"
    }, columnHeader: { flex: 1, ...typography.small, color: colors.muted, fontWeight: "700" }, memberColumn: { flex: 1.35 },
  userRow: {
      minHeight: 70,
      flexDirection: "column",
      alignItems: "stretch",
      gap: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingHorizontal: spacing.md,
      paddingVertical: 18
    }, rowPressed: { backgroundColor: colors.primarySoft }, userCell: {
      flex: undefined,
      minWidth: 0,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm
    }, avatar: { width: 34, height: 34, alignItems: "center", justifyContent: "center", borderRadius: 17, backgroundColor: colors.primarySoft }, avatarText: { ...typography.body, color: colors.primaryDark, fontWeight: "800" }, userName: { flex: 1, ...typography.body, color: colors.ink, fontWeight: "700" }, tableCell: {
      flex: undefined,
      minWidth: 0,
      ...typography.small,
      color: colors.ink
    }, actionCell: { flex: undefined, alignItems: "center", alignSelf: "flex-end", minHeight: controlMetrics.minimumTouchSize }, empty: { minHeight: 190, alignItems: "center", justifyContent: "center", gap: spacing.xs }, emptyIcon: { width: 58, height: 58, alignItems: "center", justifyContent: "center", borderRadius: 29, backgroundColor: colors.primarySoft }, emptyTitle: { ...typography.h3, color: colors.ink }, muted: { ...typography.body, color: colors.muted, paddingVertical: spacing.md }, pagination: {
      minHeight: 70,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.sm,
      padding: 12
    }, pageButton: {
      flex: 1,
      minHeight: 44,
      paddingHorizontal: 8
    }, pageLabel: { ...typography.small, color: colors.muted, minWidth: 80, textAlign: "center" }, error: { ...typography.small, color: colors.danger }, modalBackdrop: { flex: 1, justifyContent: "center", alignItems: "center", padding: spacing.lg, backgroundColor: "rgba(0,0,0,0.72)" }, modal: { width: "100%", maxWidth: 680, maxHeight: "92%", gap: spacing.md, borderRadius: radius.lg, padding: spacing.lg, backgroundColor: colors.surface }, modalHeader: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: spacing.md }, modalTitle: { ...typography.h2, color: colors.ink }, modalSubtitle: { ...typography.small, color: colors.muted, marginTop: 3 }, modalField: { gap: spacing.xs }, modalLabel: { ...typography.small, color: colors.ink, fontWeight: "700" }, modalInput: { minHeight: 46, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: spacing.sm, color: colors.ink, ...typography.body, backgroundColor: colors.surfaceElevated }, modalOptions: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs }, modalOption: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, minHeight: controlMetrics.minimumTouchSize }, modalOptionActive: { borderColor: colors.primary, backgroundColor: colors.primary }, modalOptionText: { ...typography.small, color: colors.ink }, modalOptionTextActive: { color: colors.background, fontWeight: "700" }, modalActions: { flexDirection: "row", gap: spacing.sm }, modalButton: { flex: 1 }, detailList: { borderTopWidth: 1, borderTopColor: colors.border }, detailRow: { minHeight: 42, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border }, detailLabel: { ...typography.small, color: colors.muted }, detailValue: { flex: 1, textAlign: "right", ...typography.small, color: colors.ink, fontWeight: "700" }
}));

export const createStyles = (colors: ThemeColors) =>
  adaptPageStyles(StyleSheet.create({
    screen: {
      gap: spacing.md,
      paddingTop: spacing.md,
      paddingBottom: 32
    },
    screenCompact: {
      gap: spacing.md,
    },
    pageHeader: {
      flexDirection: "column",
      alignItems: "stretch",
      justifyContent: "space-between",
      gap: 18
    },
    pageTitle: { ...typography.h1, color: colors.ink },
    pageSubtitle: { ...typography.body, color: colors.muted, marginTop: 4 },
    headerActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      flex: undefined,
      justifyContent: "flex-start",
      width: "100%",
      flexWrap: "wrap"
    },
    headerActionsCompact: { flexWrap: "wrap", justifyContent: "flex-start" },
    toolbarSearch: {
      width: "100%",
      minHeight: 50,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      borderRadius: 14,
      borderWidth: 0,
      borderColor: colors.border,
      paddingHorizontal: spacing.sm,
      backgroundColor: colors.surfaceMuted
    },
    headerButton: { minHeight: controlMetrics.minimumTouchSize, flexDirection: "row", alignItems: "center", gap: spacing.xs, borderRadius: radius.sm, borderWidth: 0, borderColor: colors.border, paddingHorizontal: spacing.md, backgroundColor: colors.surface, flexGrow: 1, justifyContent: "center" },
    headerButtonText: { ...typography.small, color: colors.ink },
    addMemberButton: {
      minHeight: 44,
      paddingHorizontal: spacing.md,
      flexGrow: 1
    },
    statsGrid: {
      flexDirection: "row",
      gap: 12,
      flexWrap: "wrap"
    },
    statsGridCompact: { flexWrap: "wrap" },
    statCard: {
      flex: undefined,
      minHeight: 144,
      minWidth: 0,
      flexDirection: "column",
      alignItems: "flex-start",
      gap: 8,
      borderRadius: 20,
      borderWidth: 0,
      borderColor: colors.border,
      padding: 16,
      backgroundColor: colors.surface,
      flexGrow: 1,
      flexBasis: "44%"
    },
    statIcon: {
      width: 32,
      height: 32,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 10
    },
    statLabel: {
      ...typography.small,
      color: colors.muted,
      fontSize: 13,
      lineHeight: 18
    },
    statValue: {
      ...typography.h2,
      color: colors.ink,
      marginTop: 2,
      fontSize: 28,
      lineHeight: 34
    },
    statTrend: {
      ...typography.small,
      color: colors.success,
      marginTop: 3,
      fontSize: 11
    },
    tableCard: {
      borderRadius: 24,
      borderWidth: 0,
      borderColor: colors.border,
      overflow: "hidden",
      backgroundColor: colors.surface
    },
    filterBar: {
      minHeight: 64,
      flexDirection: "column",
      alignItems: "stretch",
      justifyContent: "space-between",
      gap: 10,
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border
    },
    filterTabs: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 4
    },
    filterTab: { paddingHorizontal: 10, paddingVertical: spacing.sm, borderRadius: radius.sm, minHeight: controlMetrics.minimumTouchSize, justifyContent: "center" },
    filterTabActive: { backgroundColor: colors.primaryButton },
    filterTabText: {
      ...typography.small,
      color: colors.muted,
      fontSize: 13
    },
    filterTabTextActive: { color: colors.white, fontWeight: "800" },
    tableHeader: {
      minHeight: 48,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      display: "none"
    },
    columnHeader: { flex: 1, ...typography.small, color: colors.muted },
    memberColumn: { flex: 1.35 },
    actionColumn: { flex: 1.2, textAlign: "center" },
    memberInfo: { flex: undefined, minWidth: controlMetrics.minimumTouchSize, flexDirection: "row", alignItems: "center", gap: spacing.sm, width: "100%", minHeight: 52 },
    memberIdentity: {
      flex: 1,
      minWidth: 0,
      gap: 3
    },
    contactColumn: { flex: 1.2, minWidth: 0 },
    planColumn: { flex: 1, minWidth: 0 },
    trainerColumn: { flex: 1, minWidth: 0 },
    statusColumn: { flex: 0.9, minWidth: 0, alignItems: "flex-start" },
    dateColumn: { flex: 1, minWidth: 0 },
    expiryColumn: { flex: 1, minWidth: 0 },
    cellText: { ...typography.small, color: colors.ink },
    planTag: { alignSelf: "flex-start", maxWidth: "100%", borderRadius: 5, paddingHorizontal: 7, paddingVertical: 4, color: colors.primary, backgroundColor: colors.primarySoft, ...typography.small },
    expiredText: { color: colors.danger },
    toolbar: {
      flexDirection: "row",
      gap: spacing.sm,
    },
    toolbarCompact: {
      flexDirection: "column",
    },
    searchWrap: {
      flex: 1,
      minHeight: 50,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: spacing.md,
      backgroundColor: colors.surface,
    },
    searchInput: {
      flex: 1,
      color: colors.ink,
      ...typography.body,
    },
    sortButton: { minWidth: 74, minHeight: controlMetrics.minimumTouchSize, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.xs, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignSelf: "flex-end" },
    sortText: {
      ...typography.small,
      color: colors.ink,
    },
    separator: {
      height: spacing.sm,
    },
    memberRow: {
      minHeight: 82,
      flexDirection: "column",
      alignItems: "stretch",
      gap: 16,
      borderBottomWidth: 0,
      borderColor: colors.border,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      backgroundColor: colors.surface,
      padding: 18
    },
    memberRowCompact: {
      flexDirection: "column",
      alignItems: "stretch",
    },
    pressed: {
      opacity: 0.78,
    },
    avatar: {
      width: 50,
      height: 50,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: radius.pill,
      backgroundColor: colors.primarySoft,
    },
    avatarText: {
      ...typography.h3,
      color: colors.primaryDark,
    },
    memberBody: {
      flex: 1,
      minWidth: 0,
      gap: 4,
    },
    topLine: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: spacing.sm,
    },
    memberName: {
      ...typography.h3,
      color: colors.ink,
      flex: undefined,
      fontSize: 17,
      lineHeight: 23,
      fontWeight: "600"
    },
    memberMeta: {
      ...typography.small,
      color: colors.muted,
      fontSize: 13,
      lineHeight: 19
    },
    actions: {
      flexDirection: "row",
      gap: 8,
      flex: undefined,
      justifyContent: "flex-end"
    },
    actionsCompact: {
      flexDirection: "row",
      justifyContent: "flex-end",
    },
    iconButton: { width: controlMetrics.minimumTouchSize, height: controlMetrics.minimumTouchSize, alignItems: "center", justifyContent: "center", borderRadius: 14, backgroundColor: colors.surfaceMuted },
    pagination: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.sm,
      padding: 12
    },
    paginationCompact: {
      flexDirection: "row",
      alignItems: "center"
    },
    pageButton: {
      flex: 1,
      minHeight: 44,
      paddingHorizontal: 8
    },
    pageLabel: {
      ...typography.small,
      color: colors.muted,
      minWidth: 64,
      textAlign: "center",
    },
  }));

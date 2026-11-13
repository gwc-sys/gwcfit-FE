import { controlMetrics } from "../../../theme/theme";
import { adaptPageStyles } from "../../adaptPageStyles";
import { StyleSheet } from "react-native";
import { darkThemeColors, radius, spacing, typography } from "../../../theme/theme";
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


export const createReferenceStaffStyles = (colors: ThemeColors) => adaptPageStyles(
  StyleSheet.create({
    screen: {
      backgroundColor: colors.background,
      minHeight: "100%",
      paddingBottom: 110,
    },
    dynamicIslandRow: {
      alignItems: "center",
      paddingTop: 8,
      paddingBottom: 10,
    },
    dynamicIsland: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.separator,
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 5,
      gap: 6,
    },
    dynamicIslandGreenDot: {
      width: 7,
      height: 7,
      borderRadius: 3.5,
      backgroundColor: colors.success,
    },
    dynamicIslandText: {
      color: colors.textPrimary,
      fontSize: 12,
      fontWeight: "600",
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      marginTop: 8,
      marginBottom: 16,
    },
    headerTitleContainer: {
      flex: 1,
      minWidth: 0,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: "800",
      color: colors.textPrimary,
      letterSpacing: -0.5,
    },
    headerSubtitle: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 3,
    },
    inviteButton: {
      backgroundColor: colors.primary,
      borderRadius: 20,
      height: 38,
      paddingHorizontal: 16,
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    inviteButtonText: {
      fontSize: 14,
      fontWeight: "800",
      color: colors.textPrimary,
    },
    filterTabsContainer: {
      marginHorizontal: 16,
      marginBottom: 14,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.separator,
      borderRadius: 24,
      padding: 4,
      flexDirection: "row",
      alignItems: "center",
    },
    filterTab: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 8,
      borderRadius: 20,
    },
    filterTabActive: {
      backgroundColor: colors.surface,
      borderColor: colors.separator,
      borderWidth: 1,
    },
    filterTabText: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.textSecondary,
    },
    filterTabTextActive: {
      color: colors.textPrimary,
      fontWeight: "800",
    },
    searchContainer: {
      marginHorizontal: 16,
      marginBottom: 16,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.separator,
      borderRadius: 23,
      height: 46,
      paddingHorizontal: 16,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    searchInput: {
      flex: 1,
      color: colors.textPrimary,
      fontSize: 14,
      paddingVertical: 0,
    },
    staffCard: {
      marginHorizontal: 16,
      marginBottom: 12,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.separator,
      borderRadius: 18,
      padding: 16,
      gap: 12,
    },
    cardTopRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.surface,
      borderColor: colors.separator,
      borderWidth: 1,
    },
    avatarText: {
      fontSize: 16,
      fontWeight: "800",
      color: colors.textPrimary,
    },
    staffInfo: {
      flex: 1,
      marginLeft: 12,
      marginRight: 8,
    },
    staffName: {
      fontSize: 16,
      fontWeight: "800",
      color: colors.textPrimary,
    },
    staffEmail: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 2,
    },
    roleBadgeSubAdmin: {
      backgroundColor: colors.successSoft,
      borderWidth: 1,
      borderColor: colors.separator,
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    roleBadgeReception: {
      backgroundColor: colors.primarySoft,
      borderWidth: 1,
      borderColor: colors.separator,
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    roleBadgeTrainer: {
      backgroundColor: colors.primarySoft,
      borderWidth: 1,
      borderColor: colors.separator,
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    roleBadgeDefault: {
      backgroundColor: colors.linkSoft,
      borderWidth: 1,
      borderColor: colors.separator,
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    roleTextSubAdmin: {
      color: colors.success,
      fontSize: 11,
      fontWeight: "700",
    },
    roleTextReception: {
      color: colors.textPrimary,
      fontSize: 11,
      fontWeight: "700",
    },
    roleTextTrainer: {
      color: colors.primary,
      fontSize: 11,
      fontWeight: "700",
    },
    roleTextDefault: {
      color: colors.link,
      fontSize: 11,
      fontWeight: "700",
    },
    cardBottomRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: 4,
    },
    joinedRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    joinedLabel: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    joinedDate: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.textPrimary,
    },
    statusRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.success,
    },
    statusText: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.success,
    },
    statusDotInactive: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.separator,
    },
    statusTextInactive: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.textSecondary,
    },
  })
);

export const referenceStaffStyles = createReferenceStaffStyles(darkThemeColors);

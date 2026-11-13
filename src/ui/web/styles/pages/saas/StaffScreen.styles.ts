import { StyleSheet } from "react-native";
import { radius, spacing, typography } from "../../../theme/theme";
import type { ThemeColors } from "../../../theme/theme";

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    screen: {
      gap: 18,
      paddingTop: 16,
      paddingBottom: 112,
    },
    screenCompact: {
      gap: 14,
    },
    pageHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 16,
      marginBottom: 2,
    },
    pageHeaderCompact: {
      flexDirection: "column",
    },
    pageTitle: {
      fontSize: 30,
      fontWeight: "800",
      color: colors.textPrimary,
      letterSpacing: -0.5,
    },
    pageSubtitle: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 4,
      fontWeight: "400",
    },
    headerActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    headerButton: {
      height: 40,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      borderWidth: 1,
      borderColor: colors.separator,
      borderRadius: 9999,
      paddingHorizontal: 16,
      backgroundColor: colors.background,
    },
    headerButtonText: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.textPrimary,
    },
    addButton: {
      height: 40,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 9999,
      paddingHorizontal: 20,
      backgroundColor: colors.primary,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
    },
    addButtonText: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.textOnPrimary,
    },

    /* 4 Stat Cards Row */
    metrics: {
      flexDirection: "row",
      gap: 14,
      width: "100%",
    },
    countCard: {
      flex: 1,
      minHeight: 124,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: 18,
      justifyContent: "space-between",
    },
    countIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primarySoft,
    },
    countValue: {
      fontSize: 32,
      fontWeight: "800",
      color: colors.textPrimary,
      marginTop: 12,
      marginBottom: 2,
    },
    countLabel: {
      fontSize: 13,
      fontWeight: "500",
      color: colors.textSecondary,
    },

    /* Filter Row Tabs */
    filterRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginTop: 4,
      marginBottom: 2,
    },
    filterPill: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 9999,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: "transparent",
    },
    filterPillSelected: {
      backgroundColor: colors.primary,
    },
    filterText: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.textSecondary,
    },
    filterTextSelected: {
      color: colors.textOnPrimary,
      fontWeight: "700",
    },
    filterCountBadge: {
      paddingHorizontal: 7,
      paddingVertical: 1,
      borderRadius: 999,
      backgroundColor: colors.link,
    },
    filterCountText: {
      fontSize: 11,
      fontWeight: "700",
      color: colors.white,
    },

    /* Full Width Search Bar */
    searchWrap: {
      height: 44,
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.separator,
      paddingHorizontal: 16,
      backgroundColor: colors.inputBackground,
      marginVertical: 4,
    },
    searchInput: {
      flex: 1,
      color: colors.textPrimary,
      fontSize: 13.5,
    },

    /* Table Container Card */
    tableCard: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      overflow: "hidden",
      backgroundColor: colors.surface,
      marginTop: 4,
    },
    tableHeader: {
      minHeight: 46,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 24,
      borderBottomWidth: 1,
      borderBottomColor: colors.separator,
    },
    columnHeader: {
      fontSize: 11,
      fontWeight: "700",
      color: colors.textSecondary,
      letterSpacing: 0.6,
      textTransform: "uppercase",
    },
    userColumn: {
      flex: 2.5,
    },
    roleColumn: {
      flex: 1.5,
    },
    gymColumn: {
      flex: 1.6,
    },
    statusColumn: {
      flex: 1.2,
    },
    joinColumn: {
      flex: 1.5,
    },
    actionColumn: {
      flex: 1.2,
      textAlign: "right",
    },

    /* Row Item */
    userRow: {
      minHeight: 74,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 24,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.separator,
      backgroundColor: colors.surface,
    },
    userRowCompact: {
      flexDirection: "column",
      alignItems: "stretch",
    },
    separator: {
      height: 1,
      backgroundColor: colors.separator,
    },
    userCell: {
      flex: 2.5,
      minWidth: 0,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    avatar: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.success,
    },
    avatarSubAdmin: {
      backgroundColor: colors.success,
    },
    avatarReception: {
      backgroundColor: colors.surfaceStrong,
    },
    avatarTrainer: {
      backgroundColor: colors.primary,
    },
    avatarDefault: {
      backgroundColor: colors.link,
    },
    avatarText: {
      color: colors.textOnPrimary,
      fontWeight: "800",
      fontSize: 14,
    },
    avatarReceptionText: {
      color: colors.ink,
      fontWeight: "800",
      fontSize: 14,
    },
    userBody: {
      flex: 1,
      minWidth: 0,
    },
    userName: {
      fontSize: 14.5,
      fontWeight: "700",
      color: colors.textPrimary,
    },
    userMeta: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    userPhone: {
      fontSize: 11.5,
      color: colors.textSecondary,
      marginTop: 1,
    },
    roleCell: {
      flex: 1.5,
      minWidth: 0,
    },
    roleBadge: {
      alignSelf: "flex-start",
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 9999,
      borderWidth: 1,
    },
    roleBadgeSubAdmin: {
      backgroundColor: colors.successSoft,
      borderColor: colors.success,
    },
    roleTextSubAdmin: {
      color: colors.success,
      fontSize: 12,
      fontWeight: "600",
    },
    roleBadgeReception: {
      backgroundColor: colors.primarySoft,
      borderColor: colors.primary,
    },
    roleTextReception: {
      color: colors.textPrimary,
      fontSize: 12,
      fontWeight: "600",
    },
    roleBadgeTrainer: {
      backgroundColor: colors.primarySoft,
      borderColor: colors.primary,
    },
    roleTextTrainer: {
      color: colors.primary,
      fontSize: 12,
      fontWeight: "600",
    },
    roleBadgeGymOwner: {
      backgroundColor: colors.linkSoft,
      borderColor: colors.link,
    },
    roleTextGymOwner: {
      color: colors.link,
      fontSize: 12,
      fontWeight: "600",
    },
    roleBadgeDefault: {
      backgroundColor: colors.linkSoft,
      borderColor: colors.link,
    },
    roleTextDefault: {
      color: colors.link,
      fontSize: 12,
      fontWeight: "600",
    },
    gymCell: {
      flex: 1.6,
      minWidth: 0,
    },
    cellText: {
      fontSize: 13.5,
      fontWeight: "600",
      color: colors.textPrimary,
    },
    gymSubtitle: {
      fontSize: 11.5,
      color: colors.textSecondary,
      marginTop: 2,
    },
    statusCell: {
      flex: 1.2,
      minWidth: 0,
    },
    statusBadgeActive: {
      alignSelf: "flex-start",
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 9999,
      backgroundColor: colors.successSoft,
      borderWidth: 1,
      borderColor: colors.success,
    },
    statusTextActive: {
      color: colors.success,
      fontSize: 12,
      fontWeight: "600",
    },
    statusBadgeInactive: {
      alignSelf: "flex-start",
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 9999,
      backgroundColor: colors.primarySoft,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    statusTextInactive: {
      color: colors.textPrimary,
      fontSize: 12,
      fontWeight: "600",
    },
    joinCell: {
      flex: 1.5,
      minWidth: 0,
    },
    joinText: {
      fontSize: 13,
      fontWeight: "500",
      color: colors.textPrimary,
    },
    rowActions: {
      flex: 1.2,
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "center",
      gap: 8,
    },
    rowActionsCompact: {
      flexDirection: "row",
      justifyContent: "flex-end",
    },
    actionCircleButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.separator,
      alignItems: "center",
      justifyContent: "center",
    },
    iconButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.separator,
      alignItems: "center",
      justifyContent: "center",
    },
    disabledIcon: {
      opacity: 0.35,
    },
    pressed: {
      opacity: 0.75,
    },

    /* Form & Details Panels */
    formGrid: {
      gap: 16,
    },
    fieldGroup: {
      gap: 8,
    },
    fieldLabel: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.textSecondary,
    },
    optionGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    optionButton: {
      minHeight: 42,
      minWidth: 130,
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.separator,
      backgroundColor: colors.surface,
      paddingHorizontal: 12,
    },
    optionButtonSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primary,
    },
    optionText: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.textSecondary,
    },
    optionTextSelected: {
      color: colors.textPrimary,
      fontWeight: "700",
    },
    readOnlyRole: {
      minHeight: 44,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      borderWidth: 1,
      borderColor: colors.separator,
      borderRadius: 10,
      paddingHorizontal: 12,
      backgroundColor: colors.surface,
    },
    actionRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      marginTop: 8,
    },
    actionButton: {
      flex: 1,
      minWidth: 140,
    },
    detailGrid: {
      gap: 10,
    },
    detailRow: {
      minHeight: 44,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 12,
      borderRadius: 10,
      backgroundColor: colors.surface,
      paddingHorizontal: 16,
    },
    detailLabel: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    detailValue: {
      fontSize: 13.5,
      color: colors.textPrimary,
      fontWeight: "600",
      flex: 1,
      minWidth: 160,
      textAlign: "right",
    },
    notice: {
      fontSize: 13,
      color: colors.primary,
      fontWeight: "600",
    },
    protectedNotice: {
      fontSize: 13,
      color: colors.textSecondary,
      borderRadius: 10,
      padding: 12,
      backgroundColor: colors.surface,
    },
    error: {
      fontSize: 12.5,
      color: colors.danger,
      fontWeight: "600",
    },
  });

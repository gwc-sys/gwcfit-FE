import { StyleSheet } from "react-native";
import type { ThemeColors } from "../../../theme/theme";

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    screen: {
      backgroundColor: colors.background,
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 140,
    },

    // Header
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 16,
    },
    headerCopy: {
      flex: 1,
      marginRight: 10,
    },
    title: {
      color: colors.ink,
      fontSize: 32,
      fontWeight: "800",
      letterSpacing: -0.5,
    },
    subtitle: {
      color: colors.textSecondary,
      fontSize: 13,
      marginTop: 4,
      lineHeight: 18,
    },
    createButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#E91E63",
      height: 40,
      borderRadius: 20,
      paddingHorizontal: 16,
      gap: 6,
      shadowColor: "#E91E63",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 10,
      elevation: 6,
    },
    createButtonText: {
      color: colors.white,
      fontSize: 13,
      fontWeight: "700",
    },

    // 3 KPI Cards Row
    statsRow: {
      flexDirection: "row",
      gap: 10,
      marginBottom: 16,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 12,
      minHeight: 110,
      justifyContent: "space-between",
    },
    statTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    statIconWrap: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
    },
    statBadge: {
      borderRadius: 10,
      borderWidth: 1,
      paddingHorizontal: 7,
      paddingVertical: 2,
    },
    statBadgeText: {
      fontSize: 10.5,
      fontWeight: "700",
    },
    statLabel: {
      color: colors.textSecondary,
      fontSize: 11,
      fontWeight: "600",
      marginTop: 8,
    },
    statValue: {
      color: colors.ink,
      fontSize: 26,
      fontWeight: "800",
    },

    // Saved Plans Container Card
    savedPlansContainer: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 20,
      padding: 16,
      marginBottom: 20,
    },
    savedPlansKicker: {
      color: colors.textSecondary,
      fontSize: 11,
      fontWeight: "800",
      letterSpacing: 0.8,
      textTransform: "uppercase",
      marginBottom: 4,
    },
    savedPlansTitle: {
      color: colors.ink,
      fontSize: 20,
      fontWeight: "800",
      marginBottom: 14,
    },
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      height: 44,
      paddingHorizontal: 12,
      gap: 8,
      marginBottom: 14,
    },
    searchInput: {
      flex: 1,
      color: colors.ink,
      fontSize: 13,
      paddingVertical: 6,
    },

    // Plan Item Card
    planCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 14,
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
    },
    planIconWrap: {
      width: 46,
      height: 46,
      borderRadius: 14,
      backgroundColor: "#E91E63",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
      shadowColor: "#E91E63",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 4,
    },
    planInfo: {
      flex: 1,
    },
    planTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    planTitle: {
      color: colors.ink,
      fontSize: 16,
      fontWeight: "700",
    },
    planActiveBadge: {
      backgroundColor: "#34C759",
      borderWidth: 1,
      borderColor: "#34C759",
      borderRadius: 8,
      paddingHorizontal: 7,
      paddingVertical: 2,
    },
    planActiveBadgeText: {
      color: "#34C759",
      fontSize: 10,
      fontWeight: "700",
    },
    planDescription: {
      color: colors.textSecondary,
      fontSize: 12.5,
      marginTop: 3,
    },
    planMetaRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      marginTop: 4,
    },
    planMetaLabel: {
      color: colors.textSecondary,
      fontSize: 11.5,
    },
    planMetaValue: {
      color: colors.ink,
      fontSize: 11.5,
      fontWeight: "700",
    },
    planMetaDot: {
      color: colors.textSecondary,
      fontSize: 11.5,
      marginHorizontal: 3,
    },
    planActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginLeft: 8,
    },
    editButton: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: "center",
      alignItems: "center",
    },
    deleteButton: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: "#E91E63",
      borderWidth: 1,
      borderColor: "#E91E63",
      justifyContent: "center",
      alignItems: "center",
    },

    // Empty state
    emptyContainer: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 24,
      alignItems: "center",
      marginVertical: 10,
    },
    emptyText: {
      color: colors.textSecondary,
      fontSize: 13,
      textAlign: "center",
    },

    // Modal Sheet
    modalOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.85)",
      justifyContent: "flex-end",
      zIndex: 1000,
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 20,
      maxHeight: "85%",
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    modalTitle: {
      color: colors.ink,
      fontSize: 18,
      fontWeight: "800",
    },
    modalCloseBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.surfaceElevated,
      justifyContent: "center",
      alignItems: "center",
    },
    formGroup: {
      marginBottom: 12,
    },
    formLabel: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: "600",
      marginBottom: 6,
    },
    formInput: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 12,
      height: 44,
      color: colors.ink,
      fontSize: 13,
    },
    formSubmitBtn: {
      backgroundColor: "#E91E63",
      height: 46,
      borderRadius: 23,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 10,
    },
    formSubmitBtnText: {
      color: colors.white,
      fontSize: 14,
      fontWeight: "700",
    },

    // Backward-compatibility properties
    stats: {
      flexDirection: "row",
      gap: 10,
    },
    stat: {
      flex: 1,
      minWidth: 0,
    },
    statIcon: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: "center",
      justifyContent: "center",
    },
    statDetail: {
      fontSize: 11,
      color: colors.textSecondary,
    },
    manageHeader: {
      paddingHorizontal: 16,
      paddingTop: 16,
    },
    kicker: {
      color: "#E91E63",
      fontSize: 11,
      fontWeight: "700",
    },
    manageTitle: {
      color: colors.ink,
      fontSize: 20,
      fontWeight: "700",
    },
  });

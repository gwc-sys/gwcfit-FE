import { StyleSheet } from "react-native";
import { radius, spacing, typography } from "../../../theme/theme";
import type { ThemeColors } from "../../../theme/theme";

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    page: {
      gap: 20,
      paddingTop: 16,
      paddingBottom: 112,
    },

    /* 4 Stat Cards Row */
    stats: {
      flexDirection: "row",
      gap: 14,
      width: "100%",
    },
    stat: {
      flex: 1,
      minHeight: 124,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: 18,
      justifyContent: "space-between",
    },
    statActive: {
      borderColor: colors.border,
    },
    statIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
    },
    statValue: {
      fontSize: 32,
      fontWeight: "800",
      color: colors.ink,
      marginTop: 10,
      marginBottom: 2,
    },
    statLabel: {
      fontSize: 13,
      fontWeight: "500",
      color: colors.textSecondary,
    },

    /* Two-Column Grid */
    grid: {
      flexDirection: "row",
      gap: 20,
      alignItems: "flex-start",
      width: "100%",
    },

    /* Left Column: Create Invitation */
    createCard: {
      flex: 1,
      maxWidth: 440,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: 22,
      gap: 14,
    },
    card: {
      flex: 1,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: 22,
      gap: 14,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: colors.ink,
    },
    helper: {
      fontSize: 12.5,
      color: colors.textSecondary,
      lineHeight: 18,
      marginTop: 2,
    },

    /* Form Fields */
    fieldBlock: {
      gap: 6,
    },
    fieldHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    fieldLabel: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.textSecondary,
    },
    fieldRequired: {
      fontSize: 11,
      fontWeight: "600",
      color: "#E91E63",
    },
    roles: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
      marginTop: 2,
    },
    role: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 9999,
      backgroundColor: "transparent",
    },
    roleActive: {
      backgroundColor: "#E91E63",
    },
    roleText: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.textSecondary,
    },
    roleTextActive: {
      color: colors.ink,
      fontWeight: "700",
    },
    inputBox: {
      height: 44,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 14,
      backgroundColor: colors.background,
      color: colors.ink,
      fontSize: 13.5,
    },
    inputWithIcon: {
      height: 44,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 14,
      backgroundColor: colors.background,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    inputWithIconText: {
      flex: 1,
      color: colors.ink,
      fontSize: 13.5,
    },
    inputHelper: {
      fontSize: 11.5,
      color: colors.textSecondary,
      marginTop: 2,
    },
    submitButton: {
      height: 44,
      borderRadius: 9999,
      backgroundColor: "#E91E63",
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#E91E63",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.45,
      shadowRadius: 14,
      marginTop: 10,
    },
    submitButtonText: {
      fontSize: 13.5,
      fontWeight: "700",
      color: colors.white,
    },

    /* Token Box */
    tokenBox: {
      gap: 8,
      padding: 14,
      borderRadius: 12,
      backgroundColor: "rgba(233, 30, 99, 0.12)",
      borderWidth: 1,
      borderColor: "rgba(233, 30, 99, 0.25)",
      marginTop: 6,
    },
    tokenLabel: {
      fontSize: 11,
      fontWeight: "800",
      color: "#E91E63",
      letterSpacing: 0.5,
    },
    token: {
      fontSize: 14,
      color: colors.ink,
      fontWeight: "700",
    },

    /* Right Column: Invitation History */
    historyCard: {
      flex: 1.6,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: 22,
      gap: 14,
    },
    listHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    historyTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: colors.ink,
    },
    historySubtitle: {
      fontSize: 12.5,
      color: colors.textSecondary,
      marginTop: 2,
    },
    refreshButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },

    /* Filter Tabs */
    historyTabs: {
      flexDirection: "row",
      alignItems: "center",
      gap: 2,
      padding: 3,
      borderRadius: 9999,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      alignSelf: "flex-start",
      marginVertical: 4,
    },
    historyTab: {
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 9999,
      backgroundColor: "transparent",
    },
    historyTabActive: {
      backgroundColor: "#E91E63",
    },
    historyTabText: {
      fontSize: 12.5,
      fontWeight: "600",
      color: colors.textSecondary,
    },
    historyTabTextActive: {
      color: colors.ink,
      fontWeight: "700",
    },

    /* Search Box */
    historySearchBox: {
      height: 42,
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 14,
      backgroundColor: colors.background,
      marginBottom: 6,
    },
    historySearchInput: {
      flex: 1,
      color: colors.ink,
      fontSize: 13,
    },

    /* List Item Row Card */
    row: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    rowCopy: {
      flex: 1,
      minWidth: 0,
      gap: 4,
    },
    rowTitle: {
      fontSize: 13.5,
      fontWeight: "700",
      color: colors.ink,
    },
    rowMeta: {
      fontSize: 11.5,
      color: colors.textSecondary,
      marginTop: 2,
    },
    rowRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },

    /* Status Badges */
    badge: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 9999,
      borderWidth: 1,
    },
    badgeUsed: {
      backgroundColor: "rgba(52, 199, 89, 0.12)",
      borderColor: "rgba(52, 199, 89, 0.25)",
    },
    badgeTextUsed: {
      fontSize: 12,
      fontWeight: "600",
      color: "#34C759",
      textTransform: "capitalize",
    },
    badgeActive: {
      backgroundColor: "rgba(0, 122, 255, 0.12)",
      borderColor: "rgba(0, 122, 255, 0.25)",
    },
    badgeTextActive: {
      fontSize: 12,
      fontWeight: "600",
      color: "#007AFF",
      textTransform: "capitalize",
    },
    badgeRevoked: {
      backgroundColor: "rgba(233, 30, 99, 0.12)",
      borderColor: "rgba(233, 30, 99, 0.25)",
    },
    badgeTextRevoked: {
      fontSize: 12,
      fontWeight: "600",
      color: "#E91E63",
      textTransform: "capitalize",
    },
    badgeInactive: {
      backgroundColor: "rgba(233, 30, 99, 0.12)",
      borderColor: "rgba(233, 30, 99, 0.25)",
    },
    badgeTextInactive: {
      fontSize: 12,
      fontWeight: "600",
      color: "#E91E63",
      textTransform: "capitalize",
    },
    badgeText: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.ink,
      textTransform: "capitalize",
    },

    /* Revoke Action Button */
    revokeButton: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
      backgroundColor: "rgba(233, 30, 99, 0.12)",
      borderWidth: 1,
      borderColor: "rgba(233, 30, 99, 0.25)",
    },
    revoke: {
      fontSize: 12,
      fontWeight: "700",
      color: "#E91E63",
    },

    /* Super Admin Enquiry Styles */
    segments: {
      flexDirection: "row",
      gap: 4,
      padding: 4,
      borderRadius: 14,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      alignSelf: "flex-start",
    },
    segment: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 10,
    },
    segmentSelected: {
      backgroundColor: "#E91E63",
    },
    segmentText: {
      fontSize: 13,
      color: colors.textSecondary,
      fontWeight: "600",
    },
    segmentTextSelected: {
      color: colors.ink,
      fontWeight: "700",
    },
    registrationCard: {
      gap: 16,
      padding: 22,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      backgroundColor: colors.surface,
    },
    reveal: {
      fontSize: 12,
      color: "#E91E63",
      fontWeight: "700",
      marginTop: 4,
    },
    iconButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    detailBackdrop: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
    },
    detailSheet: {
      width: "100%",
      maxWidth: 620,
      maxHeight: "90%",
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 24,
      borderWidth: 1,
      borderColor: colors.border,
    },
    empty: {
      fontSize: 13,
      color: colors.textSecondary,
      textAlign: "center",
      paddingVertical: 24,
    },
  });

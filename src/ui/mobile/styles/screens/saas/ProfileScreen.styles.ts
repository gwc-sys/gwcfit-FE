import { adaptPageStyles } from "../../adaptPageStyles";
import { StyleSheet } from "react-native";
import { radius, spacing, typography } from "../../../theme/theme";
import type { ThemeColors } from "../../../theme/theme";

export const createStyles = (colors: ThemeColors) =>
  adaptPageStyles(StyleSheet.create({
    screen: {
      backgroundColor: "#000000",
      paddingHorizontal: 18,
      paddingTop: 12,
      paddingBottom: 120,
      gap: 16,
    },

    // Header
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    headerTitle: {
      fontSize: 32,
      fontWeight: "800",
      color: "#FFFFFF",
      letterSpacing: -0.5,
    },
    editButton: {
      width: 42,
      height: 42,
      borderRadius: 12,
      backgroundColor: "#000000",
      borderWidth: 1,
      borderColor: "#E91E63",
      alignItems: "center",
      justifyContent: "center",
    },

    // Avatar & Identity Hero
    hero: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 10,
    },
    avatar: {
      width: 96,
      height: 96,
      borderRadius: 48,
      alignItems: "center",
      justifyContent: "center",
    },
    heroBody: {
      alignItems: "center",
      marginTop: 8,
    },
    avatarGradient: {
      width: 96,
      height: 96,
      borderRadius: 48,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: {
      fontSize: 32,
      fontWeight: "800",
      color: "#FFFFFF",
      letterSpacing: 1,
    },
    name: {
      fontSize: 22,
      fontWeight: "800",
      color: "#FFFFFF",
      marginTop: 14,
      textAlign: "center",
    },
    roleText: {
      fontSize: 14,
      fontWeight: "700",
      color: "#E91E63",
      marginTop: 3,
      textAlign: "center",
    },
    email: {
      fontSize: 13.5,
      color: "#F2F2F7",
      fontFamily: "monospace",
      marginTop: 4,
      marginBottom: 10,
      textAlign: "center",
    },

    // Navigation Grouped Cards
    menuGroup: {
      backgroundColor: "#000000",
      borderRadius: 20,
      borderWidth: 1,
      borderColor: "#007AFF",
      overflow: "hidden",
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      height: 56,
    },
    menuItemLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      flex: 1,
    },
    menuIconBox: {
      width: 24,
      alignItems: "center",
      justifyContent: "center",
    },
    menuItemText: {
      fontSize: 15,
      fontWeight: "700",
      color: "#FFFFFF",
    },
    menuSeparator: {
      height: 1,
      backgroundColor: "#007AFF",
      marginLeft: 52,
    },

    // Account details toggle
    detailsToggle: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 10,
    },
    detailsToggleText: {
      fontSize: 13,
      fontWeight: "500",
      color: "#F2F2F7",
      textAlign: "center",
    },

    // Logout Button
    logoutButton: {
      backgroundColor: "#E91E63",
      height: 54,
      borderRadius: 27,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      marginTop: 4,
    },
    logoutButtonText: {
      fontSize: 16,
      fontWeight: "800",
      color: "#FFFFFF",
    },

    // Existing panel & info rows for toggle inspection
    quickRow: {
      flexDirection: "row",
      gap: spacing.sm,
      flexWrap: "wrap",
    },
    quickButton: {
      flexGrow: 1,
      minHeight: 48,
    },
    infoRow: {
      minHeight: 52,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 6,
      borderRadius: radius.sm,
      paddingHorizontal: spacing.md,
      backgroundColor: "#000000",
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: "#007AFF",
    },
    infoLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    infoLabel: {
      ...typography.small,
      color: colors.muted,
    },
    infoValue: {
      ...typography.body,
      color: colors.ink,
      textAlign: "right",
      fontSize: 14,
    },
    permissions: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
    },
  }));

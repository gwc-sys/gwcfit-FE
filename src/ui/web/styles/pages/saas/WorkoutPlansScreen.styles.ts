import { StyleSheet } from "react-native";
import type { ThemeColors } from "../../../theme/theme";

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    screen: {
      gap: 20,
      paddingTop: 16,
      paddingBottom: 112,
    },
    header: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 16,
    },
    title: {
      color: colors.ink,
      fontSize: 30,
      fontWeight: "800",
      letterSpacing: -0.5,
    },
    subtitle: {
      color: colors.textSecondary,
      fontSize: 13,
      marginTop: 4,
    },
    createButton: {
      height: 42,
      paddingHorizontal: 20,
      borderRadius: 9999,
      backgroundColor: "#E91E63",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      shadowColor: "#E91E63",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.45,
      shadowRadius: 14,
    },
    createButtonText: {
      color: colors.white,
      fontSize: 13.5,
      fontWeight: "700",
    },

    /* 3 KPI Cards Row */
    stats: {
      flexDirection: "row",
      gap: 14,
      width: "100%",
    },
    stat: {
      flex: 1,
      minWidth: 170,
      minHeight: 124,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: 18,
      justifyContent: "space-between",
    },
    statTop: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    statIcon: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
    },
    statPill: {
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 9999,
      borderWidth: 1,
    },
    statPillText: {
      fontSize: 11,
      fontWeight: "700",
    },
    statLabel: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: "500",
    },
    statValue: {
      color: colors.ink,
      fontSize: 28,
      fontWeight: "800",
      lineHeight: 34,
      marginTop: 2,
    },
    statDetail: {
      display: "none",
    },
    manageHeader: {
      paddingHorizontal: 16,
      paddingTop: 16,
    },
    kicker: {
      color: colors.textSecondary,
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 0.6,
      textTransform: "uppercase",
    },
    manageTitle: {
      color: colors.ink,
      fontSize: 20,
      fontWeight: "800",
      marginTop: 2,
    },
  });

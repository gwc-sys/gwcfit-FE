import { Platform, StyleSheet } from "react-native";
import { radius, spacing, typography } from "../../../theme/theme";

export const createStyles = (colors: any, compactHeader: boolean) =>
  StyleSheet.create({
    screen: {
      gap: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: 112
    },
    heroCard: {
      minHeight: 154,
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.md,
      borderRadius: radius.md,
      padding: spacing.lg,
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1,
      borderColor: colors.surfaceMuted
    },
    heroCopy: {
      flex: 1,
      minWidth: 0
    },
    kicker: {
      ...typography.small,
      color: colors.primary,
      marginBottom: spacing.xs
    },
    heroTitle: {
      ...typography.h1,
      color: colors.ink
    },
    heroText: {
      ...typography.body,
      color: colors.muted,
      marginTop: spacing.xs
    },
    heroBadges: {
      maxWidth: 320,
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm
    },
    statusBadge: {
      minHeight: 72,
      minWidth: 140,
      padding: spacing.md,
      borderRadius: radius.md,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.surfaceMuted
    },
    statusBadgeText: {
      ...typography.small,
      color: colors.muted,
      marginBottom: spacing.xs
    },
    statusBadgeValue: {
      ...typography.h2,
      color: colors.ink
    },
    trainerHeader: {
      zIndex: 40,
      position: Platform.OS === "web" ? "sticky" as any : "relative",
      top: Platform.OS === "web" ? spacing.md : 0,
      minHeight: 104,
      flexDirection: compactHeader ? "column" : "row",
      alignItems: compactHeader ? "stretch" : "center",
      justifyContent: "space-between",
      gap: 18,
      borderWidth: 1,
      borderColor: "#17243A",
      borderRadius: 14,
      paddingHorizontal: compactHeader ? 16 : 20,
      paddingVertical: 16,
      backgroundColor: "#050D18",
      ...(Platform.OS === "web"
        ? { boxShadow: "0 8px 28px rgba(0,0,0,0.20)" }
        : {
            shadowColor: "#000000",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.2,
            shadowRadius: 14,
            elevation: 10,
          }),
    },
    trainerGreeting: { flex: 1, minWidth: 210 },
    trainerGreetingName: { color: "#FFFFFF", fontSize: 30, lineHeight: 35, fontWeight: "900" },
    trainerGreetingText: { color: "#8CC7FF", fontSize: 14, lineHeight: 20, fontWeight: "700" },
    trainerHeaderActions: { flexDirection: "row", alignItems: "center", justifyContent: compactHeader ? "flex-start" : "flex-end", flexWrap: "wrap", gap: 12 },
    trainerSearch: { width: compactHeader ? "100%" : 298, height: 58, flexDirection: "row", alignItems: "center", gap: 11, borderWidth: 1, borderColor: "#263651", borderRadius: 11, paddingHorizontal: 16, backgroundColor: "#111C31" },
    trainerSearchInput: { flex: 1, height: "100%", color: "#FFFFFF", fontSize: 14, outlineStyle: "none" } as any,
    trainerDate: { height: 58, flexDirection: "row", alignItems: "center", gap: 11, borderWidth: 1, borderColor: "#263651", borderRadius: 11, paddingHorizontal: 16, backgroundColor: "#111C31" },
    trainerDateText: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" },
    trainerHeaderIcon: { width: 58, height: 58, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#263651", borderRadius: 29, backgroundColor: "#111C31" },
    trainerProfileButton: { width: 52, height: 52, alignItems: "center", justifyContent: "center", borderWidth: 4, borderColor: "#0A84FF", borderRadius: 26 },
    trainerProfileInner: { width: 38, height: 38, alignItems: "center", justifyContent: "center", borderRadius: 19, backgroundColor: "#38216E" },
    metricGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.md,
      alignItems: "stretch"
    },
    quickGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.md,
      alignItems: "stretch"
    },
    rowList: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.md
    },
    listItem: {
      flexGrow: 1,
      flexBasis: 244,
      minHeight: 150,
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      gap: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
      backgroundColor: colors.surfaceElevated
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
      color: colors.primary
    },
    memberInfo: {
      flex: 1
    },
    memberName: {
      ...typography.h3,
      color: colors.ink
    },
    memberMeta: {
      ...typography.small,
      color: colors.muted
    },
    statusChip: {
      borderRadius: radius.pill,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.surfaceMuted
    },
    statusChipText: {
      ...typography.small,
      color: colors.ink
    },
    cardRow: {
      minHeight: 84,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.md,
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: colors.surfaceMuted,
      padding: spacing.md,
      backgroundColor: colors.surface
    },
    planInfo: {
      flex: 1,
      minWidth: 0
    },
    planTitle: {
      ...typography.h3,
      color: colors.ink
    },
    planMeta: {
      ...typography.small,
      color: colors.muted
    },
    planDate: {
      ...typography.small,
      color: colors.muted
    }
  });

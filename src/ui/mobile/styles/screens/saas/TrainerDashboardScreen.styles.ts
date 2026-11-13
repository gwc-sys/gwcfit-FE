import { adaptPageStyles } from "../../adaptPageStyles";
import { Platform, StyleSheet } from "react-native";
import { radius, spacing, typography } from "../../../theme/theme";

export const createStyles = (colors: any, compactHeader: boolean) =>
  adaptPageStyles(StyleSheet.create({
    screen: {
      gap: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: 32
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
      borderColor: colors.border,
      borderRadius: 14,
      paddingHorizontal: compactHeader ? 16 : 20,
      paddingVertical: 16,
      backgroundColor: colors.surface,
      ...(Platform.OS === "web"
        ? { boxShadow: "0 8px 28px rgba(0,0,0,0.10)" }
        : {
            shadowColor: colors.shadowColor,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.1,
            shadowRadius: 14,
            elevation: 6,
          }),
    },
    trainerGreeting: { flex: 1, minWidth: 210 },
    trainerGreetingName: {
      color: colors.ink,
      fontSize: 30,
      lineHeight: 35,
      fontWeight: "700"
    },
    trainerGreetingText: { color: colors.primary, fontSize: 14, lineHeight: 20, fontWeight: "700" },
    trainerHeaderActions: { flexDirection: "row", alignItems: "center", justifyContent: compactHeader ? "flex-start" : "flex-end", flexWrap: "wrap", gap: 12 },
    trainerSearch: { width: compactHeader ? "100%" : 298, height: 58, flexDirection: "row", alignItems: "center", gap: 11, borderWidth: 1, borderColor: colors.border, borderRadius: 11, paddingHorizontal: 16, backgroundColor: colors.surfaceElevated },
    trainerSearchInput: { flex: 1, height: "100%", color: colors.ink, fontSize: 14, outlineStyle: "none" } as any,
    trainerDate: { height: 58, flexDirection: "row", alignItems: "center", gap: 11, borderWidth: 1, borderColor: colors.border, borderRadius: 11, paddingHorizontal: 16, backgroundColor: colors.surfaceElevated },
    trainerDateText: {
      color: colors.ink,
      fontSize: 14,
      fontWeight: "700"
    },
    trainerHeaderIcon: { width: 58, height: 58, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border, borderRadius: 29, backgroundColor: colors.surfaceElevated },
    trainerProfileButton: { width: 52, height: 52, alignItems: "center", justifyContent: "center", borderWidth: 4, borderColor: "#E91E63", borderRadius: 26 },
    trainerProfileInner: { width: 38, height: 38, alignItems: "center", justifyContent: "center", borderRadius: 19, backgroundColor: colors.surfaceMuted },
    metricGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      alignItems: "stretch"
    },
    groupTitle: { fontSize: 20, lineHeight: 26, fontWeight: "600", color: colors.ink, marginTop: 8, marginBottom: -8 },
    quickGrid: { borderRadius: 12, overflow: "hidden", backgroundColor: colors.card },
    rowList: { gap: 0 },
    listItem: { width: "100%", minHeight: 88, flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
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
      minWidth: 0,
      gap: 2,
      flex: 1
    },
    memberName: {
      fontSize: 17,
      lineHeight: 23,
      fontWeight: "600",
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
      backgroundColor: colors.successSoft,
      maxWidth: "30%"
    },
    statusChipText: {
      ...typography.small,
      color: colors.success
    },
    cardRow: {
      minHeight: 66,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.md,
      borderRadius: radius.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
      paddingVertical: 12,
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
  }));

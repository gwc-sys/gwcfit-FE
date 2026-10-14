import { controlMetrics } from "../../../theme/theme";
import { adaptPageStyles } from "../../adaptPageStyles";
import { Platform, StyleSheet } from "react-native";
import { radius, spacing, typography } from "../../../theme/theme";
import type { ThemeColors } from "../../../theme/theme";

export const ownerProfileStyles = adaptPageStyles(StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: "flex-end",
    justifyContent: "flex-start",
    paddingTop: 70,
    paddingRight: 24,
    backgroundColor: "rgba(2,6,23,0.2)",
  },
  menu: {
    width: 315,
    borderWidth: 1,
    borderColor: "#26364B",
    borderRadius: 12,
    paddingVertical: 9,
    backgroundColor: "#111D2D",
    ...(Platform.OS === "web"
      ? { boxShadow: "0 8px 30px rgba(0,0,0,0.30)" }
      : {
          shadowColor: "#000",
          shadowOpacity: 0.3,
          shadowRadius: 15,
          shadowOffset: { width: 0, height: 8 },
          elevation: 8,
        }),
  },
  identity: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 25,
    backgroundColor: "#F6B38A",
  },
  avatarText: {
      fontSize: 16,
      color: "#FFFFFF",
      fontWeight: "700"
    },
  identityCopy: { flex: 1, minWidth: 0 },
  name: {
      fontSize: 14,
      color: "#FFFFFF",
      fontWeight: "700"
    },
  email: { fontSize: 13, color: "#A9C9E9", marginTop: 4 },
  divider: { height: 1, backgroundColor: "#26364B", marginVertical: 6 },
  item: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    paddingHorizontal: 18,
  },
  itemText: {
      fontSize: 14,
      color: "#FFFFFF",
      fontWeight: "700"
    },
  danger: { color: "#EF4444" },
  disabled: { opacity: 0.5 },
  pressed: { backgroundColor: "#1B2A3E" },
}));

export const ownerCalendarStyles = adaptPageStyles(StyleSheet.create({
  backdrop: { flex: 1, alignItems: "flex-end", justifyContent: "flex-start", paddingTop: 75, paddingRight: 20, backgroundColor: "rgba(2,6,23,0.2)" },
  menu: {
    width: 320,
    borderWidth: 1,
    borderColor: "#26364B",
    borderRadius: 10,
    padding: 14,
    backgroundColor: "#111D2D",
    ...(Platform.OS === "web"
      ? { boxShadow: "0 7px 28px rgba(0,0,0,0.30)" }
      : { shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 14, shadowOffset: { width: 0, height: 7 }, elevation: 8 }),
  },
  monthHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 9 },
  monthTitle: {
      fontSize: 20,
      color: "#FFFFFF",
      fontWeight: "700"
    },
  arrowButton: { width: controlMetrics.minimumTouchSize, height: controlMetrics.minimumTouchSize, alignItems: "center", justifyContent: "center", borderRadius: 15, backgroundColor: "#334155" },
  weekRow: { flexDirection: "row", marginBottom: 4 },
  weekday: { width: "14.2857%", textAlign: "center", fontSize: 13, color: "#D7E3F0", fontWeight: "700" },
  daysGrid: { flexDirection: "row", flexWrap: "wrap" },
  dayCell: { width: "14.2857%", height: 36, alignItems: "center", justifyContent: "center", borderRadius: 18 },
  dayText: { fontSize: 14, color: "#FFFFFF", fontWeight: "600" },
  selectedDay: { backgroundColor: "#7A8794" },
  selectedDayText: {
      color: "#FFFFFF",
      fontWeight: "700"
    },
  todayButton: { alignItems: "center", paddingTop: 8, minHeight: controlMetrics.minimumTouchSize },
  today: { fontSize: 13, color: "#0A84FF", fontWeight: "800" },
}));

export const createOwnerDashboardStyles = (c: ThemeColors) =>
  adaptPageStyles(StyleSheet.create({
    sharedHeaderReplacement: { display: "none" },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
      marginBottom: spacing.md,
    },
    headerCopy: { flex: 1 },
    welcome: {
      fontSize: 27,
      lineHeight: 33,
      color: c.ink,
      fontWeight: "700"
    },
    headerSubtitle: { fontSize: 13, color: c.textSecondary, marginTop: 5 },
    headerActions: { flexDirection: "row", alignItems: "center", gap: 10 },
    datePill: { height: undefined, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: c.border, borderRadius: 9, backgroundColor: c.card, minHeight: controlMetrics.minimumTouchSize },
    dateText: { fontSize: 13, color: c.ink, fontWeight: "800" },
    headerIcon: { width: controlMetrics.minimumTouchSize, height: undefined, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: c.border, borderRadius: 10, backgroundColor: c.card, minHeight: controlMetrics.minimumTouchSize },
    headerBadge: {
      position: "absolute",
      right: -3,
      top: -3,
      minWidth: 17,
      height: 17,
      borderRadius: 9,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: c.primary,
    },
    headerBadgeText: {
      fontSize: 13,
      color: c.white,
      fontWeight: "700"
    },
    addButton: { height: undefined, flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 17, borderRadius: 9, backgroundColor: c.primary, minHeight: controlMetrics.minimumTouchSize },
    addButtonText: {
      fontSize: 12,
      color: c.white,
      fontWeight: "700"
    },
    metricGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      marginBottom: 0
    },
    metric: {
      flex: undefined,
      minWidth: 0,
      minHeight: 150,
      flexDirection: "column",
      alignItems: "flex-start",
      gap: 8,
      borderWidth: 0,
      borderColor: c.border,
      borderRadius: 22,
      padding: 16,
      backgroundColor: c.card,
      flexGrow: 1,
      flexBasis: "45%"
    },
    metricIcon: {
      width: 36,
      height: 36,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 12
    },
    metricLabel: {
      fontSize: 13,
      color: c.textSecondary,
      lineHeight: 18
    },
    metricValue: {
      fontSize: 30,
      color: c.ink,
      fontWeight: "700",
      marginTop: 4,
      lineHeight: 36
    },
    metricTrend: {
      fontSize: 13,
      color: "#18C77A",
      fontWeight: "800",
      marginTop: 4,
      lineHeight: 16
    },
    dashboardGrid: {
      flexDirection: "column",
      flexWrap: "wrap",
      gap: 16,
      marginBottom: 0
    },
    overviewPanel: {
      flex: undefined,
      minWidth: 0,
      minHeight: 260,
      borderWidth: 0,
      borderColor: c.border,
      borderRadius: 24,
      padding: 18,
      backgroundColor: c.card
    },
    distributionPanel: {
      flex: undefined,
      minWidth: 0,
      minHeight: 230,
      borderWidth: 0,
      borderColor: c.border,
      borderRadius: 24,
      padding: 18,
      backgroundColor: c.card
    },
    activityPanel: {
      flex: undefined,
      minWidth: 0,
      minHeight: 0,
      borderWidth: 0,
      borderColor: c.border,
      borderRadius: 24,
      padding: 18,
      backgroundColor: c.card
    },
    panelHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 8,
    },
    panelTitle: {
      fontSize: 19,
      color: c.ink,
      fontWeight: "700",
      lineHeight: 25
    },
    panelSubtitle: {
      fontSize: 13,
      color: c.textSecondary,
      marginTop: 7,
      lineHeight: 18
    },
    viewAll: {
      fontSize: 14,
      color: "#0A84FF",
      fontWeight: "800",
      lineHeight: 20
    },
    selectPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 7,
      paddingHorizontal: 9,
      paddingVertical: 7,
    },
    smallText: {
      fontSize: 12,
      color: c.textSecondary
    },
    legend: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginTop: 17,
      flexWrap: "wrap"
    },
    legendDot: { width: 8, height: 8, borderRadius: 4, marginLeft: 10 },
    chart: { height: 185, marginTop: 8, position: "relative" },
    chartRangeWrap: { position: "absolute", top: -44, right: 0, zIndex: 4 },
    chartRangeButton: { minWidth: 86, height: undefined, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 6, borderWidth: 1, borderColor: c.border, borderRadius: 7, paddingHorizontal: 9, backgroundColor: c.card, minHeight: controlMetrics.minimumTouchSize },
    chartRangeMenu: { position: "absolute", top: 40, right: 0, width: 100, borderWidth: 1, borderColor: c.border, borderRadius: 7, paddingVertical: 4, backgroundColor: c.card },
    chartRangeOption: { paddingHorizontal: 10, paddingVertical: 8, minHeight: controlMetrics.minimumTouchSize },
    chartRangeSelected: {
      color: c.primary,
      fontWeight: "700"
    },
    chartGrid: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      justifyContent: "space-around",
    },
    chartLine: {
      borderTopWidth: 1,
      borderTopColor: c.border
    },
    chartBars: {
      height: 150,
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-around",
      paddingHorizontal: 10,
    },
    chartBarGroup: {
      height: "100%",
      width: 16,
      alignItems: "center",
      justifyContent: "flex-end",
    },
    chartBar: { width: 5, borderRadius: 4 },
    chartLabels: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginTop: 10,
    },
    chartLabel: { fontSize: 12, color: c.textSecondary },
    distributionBody: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",
      gap: 16,
      flexWrap: "wrap",
    },
    donut: {
      width: 128,
      height: 128,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 64,
      borderWidth: 23,
      borderColor: "#18C77A",
      borderRightColor: "#1685F8",
      borderTopColor: "#0A84FF",
    },
    donutHole: {
      width: 76,
      height: 76,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 38,
      backgroundColor: c.card,
    },
    donutValue: {
      fontSize: 20,
      color: c.ink,
      fontWeight: "700"
    },
    donutLabel: { fontSize: 13, color: c.textSecondary },
    distributionLegend: { gap: 11 },
    distributionRow: {
      minWidth: 105,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    distributionValue: {
      marginLeft: "auto",
      fontSize: 13,
      color: c.ink,
      fontWeight: "800",
    },
    activityRow: {
      minHeight: 38,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      borderBottomWidth: 1,
      borderBottomColor: c.borderMuted,
    },
    activityIcon: {
      width: 27,
      height: 27,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 6,
    },
    activityLabel: { flex: 1, fontSize: 13, color: c.textSecondary },
    activityValue: { fontSize: 13, color: c.ink, fontWeight: "800" },
    smallPanel: {
      flex: undefined,
      minWidth: 0,
      minHeight: 215,
      borderWidth: 0,
      borderColor: c.border,
      borderRadius: 24,
      padding: 17,
      backgroundColor: c.card,
    },
    statusContent: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",
      gap: 16,
      flexWrap: "wrap",
    },
    statusRing: {
      width: 120,
      height: 120,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 60,
      borderWidth: 16,
      borderColor: "#18C77A",
      borderRightColor: "#EF476F",
      borderTopColor: "#F59E0B",
    },
    statusRingValue: {
      fontSize: 20,
      color: c.ink,
      fontWeight: "700"
    },
    statusRingLabel: { fontSize: 13, color: c.textSecondary },
    planRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 17,
    },
    planName: { width: 80, fontSize: 13, color: c.textSecondary },
    planTrack: {
      flex: 1,
      height: 5,
      borderRadius: 3,
      backgroundColor: c.borderMuted,
    },
    planFill: { height: "100%", borderRadius: 3 },
    planCount: { width: 18, fontSize: 13, color: c.ink, textAlign: "right" },
    revenueValue: {
      fontSize: 23,
      color: c.ink,
      fontWeight: "700",
      marginTop: 13
    },
    revenueBars: {
      height: 106,
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-around",
      marginTop: 12,
    },
    revenueBarGroup: {
      height: "100%",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: 5,
    },
    revenueBar: {
      width: 22,
      minHeight: 18,
      borderRadius: 5,
      backgroundColor: "#0A84FF",
    },
    recentRow: {
      minHeight: 42,
      flexDirection: "row",
      alignItems: "center",
      gap: 9,
      marginTop: 11,
    },
    recentAvatar: {
      width: 31,
      height: 31,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 16,
      backgroundColor: "#F6B38A",
    },
    recentAvatarText: { fontSize: 12, color: c.white, fontWeight: "800" },
    recentName: { fontSize: 13, color: c.ink, fontWeight: "800" },
    quickPanel: {
      gap: 14,
      borderWidth: 0,
      borderColor: c.border,
      borderRadius: 24,
      padding: 17,
      backgroundColor: c.card,
    },
    quickActions: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    quickAction: { flexGrow: 1, flexBasis: "100%", minWidth: controlMetrics.minimumTouchSize, minHeight: 66, flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderColor: c.border, borderRadius: 8, padding: 10 },
    quickIcon: {
      width: 39,
      height: 39,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 9,
    },
    quickTitle: { fontSize: 13, color: c.ink, fontWeight: "800" },
    quickSubtitle: { fontSize: 12, color: c.textSecondary, marginTop: 3 },
  }));

export const createStyles = (colors: ThemeColors) =>
  adaptPageStyles(StyleSheet.create({
    screen: {
      gap: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: 32
    },
    hero: {
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
      borderColor: colors.surfaceMuted,
    },
    heroCopy: {
      flex: 1,
      minWidth: 0,
    },
    kicker: {
      ...typography.small,
      color: colors.primary,
      marginBottom: spacing.xs,
    },
    heroTitle: {
      ...typography.h1,
      color: colors.ink,
    },
    heroText: {
      ...typography.body,
      color: colors.muted,
      marginTop: spacing.xs,
    },
    heroBadges: {
      maxWidth: 320,
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
    },
    heroBadge: {
      minHeight: 32,
      justifyContent: "center",
      borderRadius: radius.pill,
      backgroundColor: colors.surfaceMuted,
      paddingHorizontal: spacing.md,
    },
    heroBadgeText: {
      ...typography.small,
      color: colors.ink,
    },
    quickGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.md,
      alignItems: "stretch",
    },
    metrics: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.md,
      alignItems: "stretch",
    },
    memberList: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.md,
    },
    memberRow: {
      flexGrow: 1,
      flexBasis: 300,
      minHeight: 124,
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      gap: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
      backgroundColor: colors.surfaceElevated,
    },
    avatar: {
      width: 42,
      height: 42,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: radius.pill,
      backgroundColor: colors.primarySoft,
    },
    avatarText: {
      ...typography.h3,
      color: colors.primary,
    },
    memberBody: {
      flex: 1,
    },
    memberName: {
      ...typography.h3,
      color: colors.ink,
    },
    memberMeta: {
      ...typography.small,
      color: colors.muted,
    },
  }));

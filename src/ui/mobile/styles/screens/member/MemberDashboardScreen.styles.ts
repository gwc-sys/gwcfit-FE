import { controlMetrics } from "../../../theme/theme";
import { adaptPageStyles } from "../../adaptPageStyles";
import { Platform, StyleSheet } from "react-native";

type DashboardPalette = {
  background: string;
  surface: string;
  panel: string;
  border: string;
  borderStrong: string;
  text: string;
  muted: string;
  subtle: string;
  navLabel: string;
  primary: string;
  primaryDark: string;
  onPrimary: string;
  success: string;
  danger: string;
  warning: string;
  cyan: string;
  blue: string;
  pink: string;
  softPurple: string;
  softGreen: string;
  softBlue: string;
  softPink: string;
  softOrange: string;
  softCyan: string;
  premiumBackground: string;
  premiumTitle: string;
  scheduleTime: string;
  upcomingPill: string;
  upcomingPillText: string;
  ringTrack: string;
  progressTrack: string;
  calorieTrack: string;
  shadowColor: string;
};

const MOBILE_STAT_CARD_WIDTH = 176;

export const LIGHT_UI: DashboardPalette = {
  background: "#F2F2F7",
  surface: "#FFFFFF",
  panel: "#FFFFFF",
  // Low-contrast semantic separators keep cards grouped without drawing boxes
  // around every surface. The alpha also lets them adapt to the surface below.
  border: "transparent",
  borderStrong: "rgba(0, 0, 0, 0.18)",
  text: "#000000",
  muted: "rgba(0, 0, 0, 0.60)",
  subtle: "rgba(0, 0, 0, 0.40)",
  navLabel: "rgba(0, 0, 0, 0.65)",
  primary: "#E91E63",
  primaryDark: "#E91E63",
  onPrimary: "#FFFFFF",
  success: "#34C759",
  danger: "#FF3B30",
  warning: "#E91E63",
  cyan: "#007AFF",
  blue: "#007AFF",
  pink: "#E91E63",
  softPurple: "rgba(233,30,99,0.08)",
  softGreen: "rgba(52,199,89,0.08)",
  softBlue: "rgba(0,122,255,0.08)",
  softPink: "rgba(233,30,99,0.08)",
  softOrange: "rgba(233, 30, 99,0.08)",
  softCyan: "rgba(0, 122, 255,0.08)",
  premiumBackground: "rgba(233,30,99,0.06)",
  premiumTitle: "#E91E63",
  scheduleTime: "#007AFF",
  upcomingPill: "rgba(0,122,255,0.10)",
  upcomingPillText: "#007AFF",
  ringTrack: "rgba(0, 0, 0, 0.08)",
  progressTrack: "rgba(0, 0, 0, 0.08)",
  calorieTrack: "rgba(0, 0, 0, 0.08)",
  shadowColor: "rgba(0, 0, 0, 0.06)"
};

export const DARK_UI: DashboardPalette = {
  background: "#000000",
  surface: "#1C1C1E",
  panel: "#1C1C1E",
  border: "transparent",
  borderStrong: "rgba(255, 255, 255, 0.12)",
  text: "#FFFFFF",
  muted: "rgba(255, 255, 255, 0.65)",
  subtle: "rgba(255, 255, 255, 0.45)",
  navLabel: "rgba(255, 255, 255, 0.65)",
  primary: "#E91E63",
  primaryDark: "#E91E63",
  onPrimary: "#FFFFFF",
  success: "#34C759",
  danger: "#FF3B30",
  warning: "#E91E63",
  cyan: "#007AFF",
  blue: "#007AFF",
  pink: "#E91E63",
  softPurple: "rgba(233,30,99,0.18)",
  softGreen: "rgba(52,199,89,0.16)",
  softBlue: "rgba(0,122,255,0.16)",
  softPink: "rgba(233,30,99,0.16)",
  softOrange: "rgba(233, 30, 99,0.16)",
  softCyan: "rgba(0, 122, 255,0.16)",
  premiumBackground: "rgba(233,30,99,0.12)",
  premiumTitle: "#E91E63",
  scheduleTime: "#007AFF",
  upcomingPill: "rgba(0,122,255,0.20)",
  upcomingPillText: "#007AFF",
  ringTrack: "rgba(233,30,99,0.12)",
  progressTrack: "#1C1C1E",
  calorieTrack: "#1C1C1E",
  shadowColor: "#000000"
};

function createCardShadow(ui: DashboardPalette) {
  return Platform.OS === "web"
    ? { boxShadow: "none" }
    : {
        shadowColor: ui.shadowColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0
      };
}

function createSoftShadow(ui: DashboardPalette) {
  return Platform.OS === "web"
    ? { boxShadow: "none" }
    : {
        shadowColor: ui.shadowColor,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0
      };
}

export function createStyles(ui: DashboardPalette) {
  const cardShadow = createCardShadow(ui);
  const softShadow = createSoftShadow(ui);

  return adaptPageStyles(StyleSheet.create({
    root: {
      backgroundColor: ui.background
    },
    scrollContent: {
      minHeight: "100%",
      backgroundColor: ui.background,
      paddingBottom: 32
    },
    dashboard: {
      width: "100%",
      minHeight: "100%",
      backgroundColor: ui.background
    },
    dashboardDesktop: {
      flexDirection: "row"
    },
    flex: {
      flex: 1,
      minWidth: 0
    },
    brandRow: {
      minHeight: 42,
      flexDirection: "row",
      alignItems: "center",
      gap: 10
    },
    brandText: {
      color: ui.text,
      fontSize: 28,
      lineHeight: 35,
      fontWeight: "700",
      letterSpacing: -0.8,
    },
    mobileBrand: {
      minHeight: 112,
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingTop: 20,
      backgroundColor: ui.background,
      borderBottomWidth: 0,
      borderBottomColor: ui.border,
      paddingBottom: 16,
    },
    mobileSettingsButton: { width: controlMetrics.minimumTouchSize, height: controlMetrics.minimumTouchSize, alignItems: "center", justifyContent: "center", borderRadius: 22, backgroundColor: ui.surface },
    mobileBrandActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6
    },
    mobileNotificationDot: {
      position: "absolute",
      top: 5,
      right: 5,
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: ui.danger
    },
    mobileBrandContent: {
      flex: 1,
      minWidth: 0,
      marginRight: 10
    },
    mobileIdentityCopy: {
      flex: 1,
      minWidth: 0,
      maxWidth: 140,
      paddingLeft: 2
    },
    mobileIdentityName: {
      color: ui.muted,
      fontSize: 17,
      lineHeight: 24,
      fontWeight: "400",
      marginTop: 4,
    },
    mobileIdentityRole: {
      color: ui.muted,
      fontSize: 11,
      lineHeight: 16,
      fontWeight: "600",
      letterSpacing: 1.5,
      marginBottom: 4,
    },
    main: {
      flex: 1,
      minWidth: 0,
      gap: 16,
      padding: 20,
    },
    mainNarrow: {
      paddingHorizontal: 20,
      paddingVertical: 8,
    },
    stateBanner: {
      minHeight: 72,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: ui.border,
      backgroundColor: ui.surface,
      padding: 14,
      ...cardShadow
    },
    stateIcon: {
      width: 42,
      height: 42,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 8,
      backgroundColor: ui.softPurple
    },
    stateTitle: {
      color: ui.text,
      fontSize: 15,
      lineHeight: 20,
      fontWeight: "700"
    },
    stateMessage: {
      marginTop: 2,
      color: ui.muted,
      fontSize: 13,
      lineHeight: 18
    },
    retryButton: { minHeight: controlMetrics.minimumTouchSize, alignItems: "center", justifyContent: "center", borderRadius: 8, backgroundColor: ui.primary, paddingHorizontal: 15 },
    retryText: {
      color: ui.onPrimary,
      fontSize: 13,
      lineHeight: 18,
      fontWeight: "800"
    },
    statsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8
    },
    statsGridWide: {
      gap: 14
    },
    statsScrollContent: {
      gap: 12,
      paddingRight: 4
    },
    mobileStatTileWrapper: {
      width: MOBILE_STAT_CARD_WIDTH
    },
    statTile: {
      flexGrow: 1,
      flexBasis: "20%",
      minWidth: 0,
      minHeight: 112,
      justifyContent: "space-between",
      borderRadius: 14,
      borderWidth: 1,
      borderColor: ui.border,
      backgroundColor: ui.surface,
      padding: 8,
      ...cardShadow,
      alignItems: "center",
    },
    statTopRow: {
      minHeight: 62,
      flexDirection: "column",
      alignItems: "center",
      gap: 8
    },
    statIconBox: {
      width: 28,
      height: 28,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 12,
      backgroundColor: "transparent",
    },
    statValue: {
      flex: 0,
      color: ui.text,
      fontSize: 20,
      lineHeight: 26,
      fontWeight: "700",
      textAlign: "center",
    },
    statLabel: {
      color: ui.text,
      fontSize: 11,
      lineHeight: 16,
      fontWeight: "600",
      textAlign: "center",
    },
    statSubtitle: {
      color: ui.muted,
      fontSize: 12,
      lineHeight: 17,
      fontWeight: "500"
    },
    trendRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5
    },
    trendText: {
      color: ui.success,
      fontSize: 13,
      lineHeight: 18,
      fontWeight: "800"
    },
    trendDown: {
      color: ui.danger
    },
    middleGrid: {
      gap: 16
    },
    middleGridDesktop: {
      flexDirection: "row",
      alignItems: "stretch"
    },
    panel: {
      borderRadius: 12,
      borderWidth: 0,
      borderColor: ui.border,
      backgroundColor: "transparent",
      padding: 0,
      ...cardShadow
    },
    panelHeader: {
      minHeight: 44,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12
    },
    panelTitle: {
      color: ui.text,
      fontSize: 17,
      lineHeight: 24,
      fontWeight: "600",
      flexShrink: 1,
    },
    emptyPanelText: {
      color: ui.muted,
      fontSize: 14,
      lineHeight: 21,
      paddingVertical: 18,
      textAlign: "center"
    },
    panelAction: {
      color: ui.primary,
      fontSize: 13,
      lineHeight: 18,
      fontWeight: "700"
    },
    quickPanel: {
      flex: 1.55,
      minHeight: 0,
    },
    schedulePanel: {
      flex: 1,
      minHeight: 0,
    },
    quickGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 8,
    },
    quickAction: { flexGrow: 1, flexBasis: "20%", minWidth: 0, minHeight: 88, flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, borderWidth: 1, borderColor: ui.border, backgroundColor: ui.surface, padding: 8 },
    quickIconBox: {
      width: 30,
      height: 30,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 12,
    },
    quickTitle: {
      color: ui.text,
      fontSize: 11,
      lineHeight: 16,
      fontWeight: "500",
      textAlign: "center",
    },
    quickSubtitle: {
      marginTop: 3,
      color: ui.muted,
      fontSize: 12,
      lineHeight: 17
    },
    chevronButton: {
      position: "absolute",
      right: 10,
      top: 18,
      width: 28,
      height: 28,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 14,
      borderWidth: 0,
      borderColor: ui.border
    },
    scheduleList: {
      gap: 12,
      marginTop: 8,
      borderWidth: 1,
      borderColor: ui.border,
      borderRadius: 16,
      padding: 12,
      backgroundColor: ui.surface,
    },
    scheduleRow: {
      minHeight: 60,
      flexDirection: "row",
      alignItems: "center",
      gap: 12
    },
    scheduleTime: {
      width: 68,
      color: ui.scheduleTime,
      fontSize: 13,
      lineHeight: 18,
      fontWeight: "600"
    },
    timeline: {
      width: 16,
      height: 56,
      alignItems: "center",
      justifyContent: "center"
    },
    timelineLine: {
      position: "absolute",
      top: 34,
      width: 1,
      height: 48,
      backgroundColor: ui.borderStrong
    },
    timelineDot: {
      width: 11,
      height: 11,
      borderRadius: 6
    },
    scheduleIcon: {
      width: 48,
      height: 48,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 8
    },
    scheduleCopy: {
      flex: 1,
      minWidth: 0
    },
    scheduleTitle: {
      color: ui.text,
      fontSize: 14,
      lineHeight: 19,
      fontWeight: "700"
    },
    scheduleSubtitle: {
      marginTop: 3,
      color: ui.muted,
      fontSize: 12,
      lineHeight: 17
    },
    statusPill: {
      minHeight: 30,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
      borderRadius: 8,
      paddingHorizontal: 10
    },
    statusDone: {
      backgroundColor: ui.softGreen
    },
    statusUpcoming: {
      backgroundColor: ui.upcomingPill
    },
    statusText: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: "800"
    },
    statusDoneText: {
      color: ui.success
    },
    statusUpcomingText: {
      color: ui.upcomingPillText
    },
    lowerGrid: {
      gap: 16
    },
    lowerGridDesktop: {
      flexDirection: "row",
      alignItems: "stretch"
    },
    progressPanel: {
      flex: 1,
      minHeight: 320
    },
    workoutPanel: {
      flex: 1,
      minHeight: 320
    },
    achievementPanel: {
      flex: 1,
      minHeight: 320
    },
    progressCard: {
      gap: 14,
      marginTop: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: ui.border,
      padding: 14
    },
    progressCardTitle: {
      color: ui.text,
      fontSize: 13,
      lineHeight: 18,
      fontWeight: "700"
    },
    progressMainRow: {
      minHeight: 140,
      flexDirection: "row",
      alignItems: "center",
      gap: 22
    },
    progressCircle: {
      width: 128,
      height: 128,
      alignItems: "center",
      justifyContent: "center"
    },
    progressCenter: {
      position: "absolute",
      alignItems: "center",
      justifyContent: "center"
    },
    progressPercent: {
      color: ui.text,
      fontSize: 23,
      lineHeight: 29,
      fontWeight: "700"
    },
    progressLabel: {
      color: ui.muted,
      fontSize: 10,
      lineHeight: 14
    },
    workoutProgressCopy: {
      flex: 1,
      minWidth: 0,
      gap: 14
    },
    progressMuted: {
      color: ui.muted,
      fontSize: 13,
      lineHeight: 18,
      fontWeight: "600"
    },
    completedText: {
      color: ui.text,
      fontSize: 20,
      lineHeight: 26,
      fontWeight: "700"
    },
    progressTrack: {
      height: 8,
      borderRadius: 8,
      backgroundColor: ui.progressTrack,
      overflow: "hidden"
    },
    progressFill: {
      height: "100%",
      borderRadius: 8,
      backgroundColor: ui.primary
    },
    calorieCard: {
      minHeight: 78,
      flexDirection: "row",
      alignItems: "center",
      gap: 13,
      marginTop: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: ui.border,
      padding: 12
    },
    calorieTitle: {
      color: ui.text,
      fontSize: 14,
      lineHeight: 19,
      fontWeight: "700"
    },
    calorieSubtitle: {
      marginTop: 3,
      color: ui.muted,
      fontSize: 13,
      lineHeight: 18
    },
    calorieTrack: {
      height: 8,
      marginTop: 9,
      borderRadius: 8,
      backgroundColor: ui.calorieTrack,
      overflow: "hidden"
    },
    calorieFill: {
      height: "100%",
      borderRadius: 8,
      backgroundColor: ui.warning
    },
    caloriePercent: {
      color: ui.navLabel,
      fontSize: 14,
      lineHeight: 19,
      fontWeight: "800"
    },
    workoutList: {
      marginTop: 16
    },
    workoutRow: {
      minHeight: 76,
      flexDirection: "row",
      alignItems: "center",
      gap: 13,
      borderBottomWidth: 1,
      borderBottomColor: ui.border,
      paddingVertical: 11,
      backgroundColor: ui.surface,
      padding: 12,
      borderWidth: 1,
      borderColor: ui.border,
      borderRadius: 16,
    },
    workoutImage: {
      width: 64,
      height: 64,
      borderRadius: 8,
      backgroundColor: ui.softPurple
    },
    workoutTitle: {
      color: ui.text,
      fontSize: 14,
      lineHeight: 19,
      fontWeight: "700"
    },
    workoutSubtitle: {
      marginTop: 3,
      color: ui.muted,
      fontSize: 13,
      lineHeight: 18,
      fontWeight: "600"
    },
    workoutDateRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      marginTop: 5
    },
    workoutDate: {
      flex: 1,
      minWidth: 0,
      color: ui.muted,
      fontSize: 12,
      lineHeight: 17
    },
    roundChevron: {
      width: 34,
      height: 34,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 17,
      borderWidth: 1,
      borderColor: ui.border
    },
    achievementList: {
      gap: 13,
      marginTop: 18
    },
    achievementRow: {
      minHeight: 74,
      flexDirection: "row",
      alignItems: "center",
      gap: 13
    },
    achievementIcon: {
      width: 58,
      height: 58,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 8
    },
    achievementTitle: {
      color: ui.text,
      fontSize: 14,
      lineHeight: 19,
      fontWeight: "700"
    },
    achievementSubtitle: {
      marginTop: 3,
      color: ui.muted,
      fontSize: 13,
      lineHeight: 18
    },
    achievementDate: {
      marginTop: 2,
      color: ui.muted,
      fontSize: 12,
      lineHeight: 16
    },
    achievementStatusPill: {
      borderRadius: 10,
      paddingHorizontal: 8,
      paddingVertical: 3,
      backgroundColor: "rgba(255, 255, 255, 0.06)"
    },
    achievementStatusText: {
      color: ui.muted,
      fontSize: 11,
      lineHeight: 14,
      fontWeight: "500",
      textTransform: "capitalize"
    },
    workoutDiscoveryCard: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "rgba(0, 122, 255, 0.18)",
      backgroundColor: "rgba(0, 122, 255, 0.06)",
      marginTop: 2
    },
    workoutDiscoveryText: {
      flex: 1,
      color: ui.primary,
      fontSize: 12,
      lineHeight: 16,
      fontWeight: "600",
      marginLeft: 8
    },
    awardsFooter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: ui.border,
      backgroundColor: "rgba(255, 255, 255, 0.02)",
      marginTop: 2
    },
    awardsFooterText: {
      flex: 1,
      color: ui.muted,
      fontSize: 12,
      lineHeight: 16,
      fontWeight: "500",
      marginLeft: 8
    },
    pressed: {
      opacity: 0.78,
      transform: [{ translateY: 1 }]
    },
    pressedLift: {
      opacity: 0.86,
      transform: [{ translateY: -2 }]
    },
    disabled: {
      opacity: 0.58
    }
  }));
}

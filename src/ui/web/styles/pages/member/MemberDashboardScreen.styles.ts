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
  border: "transparent",
  borderStrong: "rgba(0, 0, 0, 0.10)",
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
  borderStrong: "rgba(255,255,255,0.12)",
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
  softPurple: "rgba(233,30,99,0.12)",
  softGreen: "rgba(52,199,89,0.12)",
  softBlue: "rgba(0,122,255,0.12)",
  softPink: "rgba(233,30,99,0.12)",
  softOrange: "rgba(233, 30, 99,0.12)",
  softCyan: "rgba(0, 122, 255,0.12)",
  premiumBackground: "rgba(233,30,99,0.08)",
  premiumTitle: "#007AFF",
  scheduleTime: "#007AFF",
  upcomingPill: "rgba(0,122,255,0.12)",
  upcomingPillText: "#007AFF",
  ringTrack: "rgba(255,255,255,0.06)",
  progressTrack: "rgba(255,255,255,0.06)",
  calorieTrack: "rgba(255,255,255,0.06)",
  shadowColor: "#000000"
};

function createCardShadow(ui: DashboardPalette) {
  return Platform.OS === "web"
    ? { boxShadow: "none" }
    : {
        shadowColor: ui.shadowColor,
        shadowOffset: { width: 0, height: 12 },
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

  return StyleSheet.create({
    root: {
      backgroundColor: ui.background
    },
    scrollContent: {
      minHeight: "100%",
      backgroundColor: ui.background,
      paddingBottom: 126
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
      fontWeight: "900"
    },
    mobileBrand: {
      minHeight: 112,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 18,
      paddingTop: 20,
      backgroundColor: ui.surface,
      borderBottomWidth: 1,
      borderBottomColor: ui.border
    },
    mobileSettingsButton: {
      width: 34,
      height: 34,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 8,
      backgroundColor: ui.softPurple
    },
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
      color: ui.text,
      fontSize: 12,
      lineHeight: 16,
      fontWeight: "800"
    },
    mobileIdentityRole: {
      color: ui.muted,
      fontSize: 10,
      lineHeight: 14,
      fontWeight: "600"
    },
    main: {
      flex: 1,
      minWidth: 0,
      gap: 16,
      padding: 24
    },
    mainNarrow: {
      paddingHorizontal: 16,
      paddingVertical: 16
    },
    stateBanner: {
      minHeight: 64,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: ui.border,
      backgroundColor: ui.surface,
      padding: 12,
      ...cardShadow
    },
    stateIcon: {
      width: 36,
      height: 36,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 8,
      backgroundColor: ui.softPurple
    },
    stateTitle: {
      color: ui.text,
      fontSize: 14,
      lineHeight: 19,
      fontWeight: "700"
    },
    stateMessage: {
      marginTop: 2,
      color: ui.muted,
      fontSize: 12,
      lineHeight: 16
    },
    retryButton: {
      minHeight: 34,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 6,
      backgroundColor: ui.primary,
      paddingHorizontal: 12
    },
    retryText: {
      color: ui.onPrimary,
      fontSize: 12,
      lineHeight: 16,
      fontWeight: "700"
    },
    statsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12
    },
    statsGridWide: {
      gap: 12
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
      flexBasis: 176,
      minWidth: 156,
      minHeight: 92,
      justifyContent: "space-between",
      borderRadius: 16,
      borderWidth: 1,
      borderColor: ui.border,
      backgroundColor: ui.surface,
      padding: 16,
      ...cardShadow
    },
    statTopRow: {
      minHeight: 38,
      flexDirection: "row",
      alignItems: "center",
      gap: 12
    },
    statIconBox: {
      width: 38,
      height: 38,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 10
    },
    statValue: {
      flex: 1,
      color: ui.text,
      fontSize: 28,
      lineHeight: 32,
      fontWeight: "700",
      fontVariant: ["tabular-nums"]
    },
    statLabel: {
      color: ui.text,
      fontSize: 13.5,
      lineHeight: 18,
      fontWeight: "600",
      marginTop: 3
    },
    statSubtitle: {
      color: ui.muted,
      fontSize: 11.5,
      lineHeight: 15,
      fontWeight: "400"
    },
    trendRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4
    },
    trendText: {
      color: ui.success,
      fontSize: 12,
      lineHeight: 16,
      fontWeight: "600"
    },
    trendDown: {
      color: ui.danger
    },
    middleGrid: {
      gap: 16
    },
    middleGridDesktop: {
      flexDirection: "row",
      alignItems: "flex-start"
    },
    panel: {
      borderRadius: 18,
      borderWidth: 1,
      borderColor: ui.border,
      backgroundColor: ui.panel,
      padding: 18,
      ...cardShadow
    },
    panelHeader: {
      minHeight: 24,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      marginBottom: 2
    },
    panelTitle: {
      color: ui.text,
      fontSize: 15,
      lineHeight: 20,
      fontWeight: "600"
    },
    emptyPanelText: {
      color: ui.muted,
      fontSize: 13,
      lineHeight: 18,
      paddingVertical: 14,
      textAlign: "center"
    },
    panelAction: {
      color: ui.primary,
      fontSize: 12,
      lineHeight: 16,
      fontWeight: "600"
    },
    quickPanel: {
      flex: 1.55
    },
    schedulePanel: {
      flex: 1
    },
    quickGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 12
    },
    quickAction: {
      flexGrow: 1,
      flexBasis: 220,
      minWidth: 200,
      minHeight: 64,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: ui.border,
      backgroundColor: "rgba(255, 255, 255, 0.03)",
      paddingHorizontal: 14,
      paddingVertical: 12
    },
    quickIconBox: {
      width: 38,
      height: 38,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 10
    },
    quickTitle: {
      color: ui.text,
      fontSize: 13.5,
      lineHeight: 18,
      fontWeight: "600"
    },
    quickSubtitle: {
      marginTop: 1,
      color: ui.muted,
      fontSize: 11.5,
      lineHeight: 15
    },
    chevronButton: {
      width: 26,
      height: 26,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 13,
      borderWidth: 1,
      borderColor: ui.border,
      backgroundColor: "rgba(255, 255, 255, 0.04)"
    },
    scheduleList: {
      gap: 8,
      marginTop: 12
    },
    scheduleRow: {
      minHeight: 44,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 2
    },
    scheduleTime: {
      width: 76,
      color: ui.scheduleTime,
      fontSize: 12,
      lineHeight: 16,
      fontWeight: "500",
      fontVariant: ["tabular-nums"]
    },
    timeline: {
      width: 14,
      height: 46,
      alignItems: "center",
      justifyContent: "center"
    },
    timelineLine: {
      position: "absolute",
      top: 26,
      width: 1.5,
      height: 36,
      backgroundColor: ui.borderStrong
    },
    timelineDot: {
      width: 8,
      height: 8,
      borderRadius: 4
    },
    scheduleIcon: {
      width: 34,
      height: 34,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 9
    },
    scheduleCopy: {
      flex: 1,
      minWidth: 0
    },
    scheduleTitle: {
      color: ui.text,
      fontSize: 13,
      lineHeight: 17,
      fontWeight: "600"
    },
    scheduleSubtitle: {
      marginTop: 1,
      color: ui.muted,
      fontSize: 11,
      lineHeight: 15
    },
    statusPill: {
      minHeight: 24,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 3
    },
    statusDone: {
      backgroundColor: ui.softGreen
    },
    statusUpcoming: {
      backgroundColor: ui.upcomingPill
    },
    statusText: {
      fontSize: 11,
      lineHeight: 14,
      fontWeight: "600"
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
      alignItems: "flex-start"
    },
    progressPanel: {
      flex: 1
    },
    workoutPanel: {
      flex: 1
    },
    achievementPanel: {
      flex: 1
    },
    progressCard: {
      gap: 12,
      marginTop: 12,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: ui.border,
      backgroundColor: "rgba(255, 255, 255, 0.03)",
      padding: 14
    },
    progressCardTitle: {
      color: ui.text,
      fontSize: 13,
      lineHeight: 17,
      fontWeight: "600"
    },
    progressMainRow: {
      minHeight: 96,
      flexDirection: "row",
      alignItems: "center",
      gap: 16
    },
    progressCircle: {
      width: 96,
      height: 96,
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
      fontSize: 18,
      lineHeight: 22,
      fontWeight: "700",
      fontVariant: ["tabular-nums"]
    },
    progressLabel: {
      color: ui.muted,
      fontSize: 9,
      lineHeight: 12,
      fontWeight: "600",
      letterSpacing: 0.5
    },
    workoutProgressCopy: {
      flex: 1,
      minWidth: 0,
      gap: 8
    },
    progressMuted: {
      color: ui.muted,
      fontSize: 11.5,
      lineHeight: 15,
      fontWeight: "500"
    },
    completedText: {
      color: ui.text,
      fontSize: 16,
      lineHeight: 21,
      fontWeight: "700",
      fontVariant: ["tabular-nums"]
    },
    progressTrack: {
      height: 7,
      borderRadius: 4,
      backgroundColor: ui.progressTrack,
      overflow: "hidden"
    },
    progressFill: {
      height: "100%",
      borderRadius: 4,
      backgroundColor: ui.primary
    },
    calorieCard: {
      minHeight: 58,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginTop: 10,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: ui.border,
      backgroundColor: "rgba(255, 255, 255, 0.03)",
      padding: 14
    },
    calorieTitle: {
      color: ui.text,
      fontSize: 13,
      lineHeight: 17,
      fontWeight: "600"
    },
    calorieSubtitle: {
      marginTop: 2,
      color: ui.muted,
      fontSize: 11.5,
      lineHeight: 15,
      fontVariant: ["tabular-nums"]
    },
    calorieTrack: {
      height: 7,
      marginTop: 6,
      borderRadius: 4,
      backgroundColor: ui.calorieTrack,
      overflow: "hidden"
    },
    calorieFill: {
      height: "100%",
      borderRadius: 4,
      backgroundColor: ui.warning
    },
    caloriePercent: {
      color: ui.navLabel,
      fontSize: 12.5,
      lineHeight: 16,
      fontWeight: "700",
      fontVariant: ["tabular-nums"]
    },
    workoutList: {
      marginTop: 12,
      gap: 8
    },
    workoutRow: {
      minHeight: 58,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: ui.border,
      backgroundColor: "rgba(255, 255, 255, 0.03)",
      padding: 12
    },
    workoutImage: {
      width: 48,
      height: 48,
      borderRadius: 10,
      backgroundColor: ui.softPurple
    },
    workoutTitle: {
      color: ui.text,
      fontSize: 13.5,
      lineHeight: 18,
      fontWeight: "600"
    },
    workoutSubtitle: {
      marginTop: 1,
      color: ui.muted,
      fontSize: 11.5,
      lineHeight: 15,
      fontWeight: "400"
    },
    workoutDateRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginTop: 3
    },
    workoutDate: {
      flex: 1,
      minWidth: 0,
      color: ui.muted,
      fontSize: 11,
      lineHeight: 15
    },
    roundChevron: {
      width: 26,
      height: 26,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 13,
      borderWidth: 1,
      borderColor: ui.border,
      backgroundColor: "rgba(255, 255, 255, 0.04)"
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
    achievementList: {
      gap: 8,
      marginTop: 12
    },
    achievementRow: {
      minHeight: 52,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: ui.border,
      backgroundColor: "rgba(255, 255, 255, 0.03)",
      padding: 12
    },
    achievementIcon: {
      width: 38,
      height: 38,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 10
    },
    achievementTitle: {
      color: ui.text,
      fontSize: 13.5,
      lineHeight: 18,
      fontWeight: "600"
    },
    achievementSubtitle: {
      marginTop: 1,
      color: ui.muted,
      fontSize: 11.5,
      lineHeight: 15
    },
    achievementDate: {
      marginTop: 1,
      color: ui.muted,
      fontSize: 11,
      lineHeight: 15
    },
    achievementStatusPill: {
      borderRadius: 10,
      paddingHorizontal: 9,
      paddingVertical: 3,
      backgroundColor: "rgba(255, 255, 255, 0.07)"
    },
    achievementStatusText: {
      color: ui.muted,
      fontSize: 11,
      lineHeight: 14,
      fontWeight: "500",
      textTransform: "capitalize"
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
  });
}



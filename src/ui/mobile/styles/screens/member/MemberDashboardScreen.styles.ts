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
  background: "#EDF3FC",
  surface: "#FFFFFF",
  panel: "#FFFFFF",
  border: "#E5E5EA",
  borderStrong: "#D1D1D6",
  text: "#1D1D1F",
  muted: "#6E6E73",
  subtle: "#6E6E73",
  navLabel: "#3A3A3C",
  primary: "#0066CC",
  primaryDark: "#0066CC",
  onPrimary: "#FFFFFF",
  success: "#1E7835",
  danger: "#C9342A",
  warning: "#F97316",
  cyan: "#14B8A6",
  blue: "#3B82F6",
  pink: "#EC4899",
  softPurple: "#EAF2FF",
  softGreen: "#E9FAEF",
  softBlue: "#EAF2FF",
  softPink: "#FDEAF5",
  softOrange: "#FFF2E8",
  softCyan: "#E7FAF7",
  premiumBackground: "#EAF2FF",
  premiumTitle: "#0066CC",
  scheduleTime: "#27364F",
  upcomingPill: "#EEF4FF",
  upcomingPillText: "#2563EB",
  ringTrack: "#E5E5EA",
  progressTrack: "#E5E5EA",
  calorieTrack: "#ECEEF5",
  shadowColor: "#0F172A"
};

export const DARK_UI: DashboardPalette = {
  background: "#101114",
  surface: "#1C1C1E",
  panel: "#1C1C1E",
  border: "rgba(84,84,88,0.55)",
  borderStrong: "rgba(0,122,255,0.30)",
  text: "#FFFFFF",
  muted: "#AEAEB2",
  subtle: "#8E8E93",
  navLabel: "#D1D1D6",
  primary: "#0A84FF",
  primaryDark: "#64D2FF",
  onPrimary: "#FFFFFF",
  success: "#22C55E",
  danger: "#F87171",
  warning: "#FB923C",
  cyan: "#2DD4BF",
  blue: "#60A5FA",
  pink: "#F472B6",
  softPurple: "rgba(0,122,255,0.18)",
  softGreen: "rgba(34,197,94,0.16)",
  softBlue: "rgba(96,165,250,0.16)",
  softPink: "rgba(244,114,182,0.16)",
  softOrange: "rgba(251,146,60,0.16)",
  softCyan: "rgba(45,212,191,0.16)",
  premiumBackground: "rgba(0,122,255,0.12)",
  premiumTitle: "#64D2FF",
  scheduleTime: "#CBD5E1",
  upcomingPill: "rgba(37,99,235,0.20)",
  upcomingPillText: "#93C5FD",
  ringTrack: "rgba(0,122,255,0.22)",
  progressTrack: "rgba(0,122,255,0.18)",
  calorieTrack: "rgba(148,163,184,0.18)",
  shadowColor: "#000000"
};

function createCardShadow(ui: DashboardPalette) {
  return Platform.OS === "web"
    ? { boxShadow: "0 18px 50px rgba(15,23,42,0.08)" }
    : {
        shadowColor: ui.shadowColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 0
      };
}

function createSoftShadow(ui: DashboardPalette) {
  return Platform.OS === "web"
    ? { boxShadow: "0 12px 26px rgba(15,23,42,0.06)" }
    : {
        shadowColor: ui.shadowColor,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.03,
        shadowRadius: 16,
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
      fontSize: 34,
      lineHeight: 41,
      fontWeight: "700",
      letterSpacing: -0.8,
    },
    mobileBrand: {
      minHeight: 128,
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingTop: 24,
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
      gap: 24,
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
      gap: 12
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
      flexBasis: "44%",
      minWidth: 130,
      minHeight: 148,
      justifyContent: "space-between",
      borderRadius: 20,
      borderWidth: 0,
      borderColor: ui.border,
      backgroundColor: ui.surface,
      padding: 16,
      ...cardShadow
    },
    statTopRow: {
      minHeight: 50,
      flexDirection: "row",
      alignItems: "center",
      gap: 14
    },
    statIconBox: {
      width: 36,
      height: 36,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 12,
    },
    statValue: {
      flex: 1,
      color: ui.text,
      fontSize: 30,
      lineHeight: 36,
      fontWeight: "700",
    },
    statLabel: {
      color: ui.text,
      fontSize: 15,
      lineHeight: 20,
      fontWeight: "600",
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
      borderRadius: 24,
      borderWidth: 0,
      borderColor: ui.border,
      backgroundColor: ui.surface,
      padding: 18,
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
      fontSize: 20,
      lineHeight: 26,
      fontWeight: "700",
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
      gap: 0,
      marginTop: 8,
    },
    quickAction: { flexGrow: 1, flexBasis: "100%", minWidth: controlMetrics.minimumTouchSize, minHeight: 76, flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 0, borderWidth: 0, borderColor: ui.border, backgroundColor: ui.surface, padding: 8, borderBottomWidth: StyleSheet.hairlineWidth },
    quickIconBox: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 12,
    },
    quickTitle: {
      color: ui.text,
      fontSize: 17,
      lineHeight: 23,
      fontWeight: "600",
    },
    quickSubtitle: {
      marginTop: 3,
      color: ui.muted,
      fontSize: 12,
      lineHeight: 17
    },
    chevronButton: {
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
      marginTop: 17
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
      paddingVertical: 11
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

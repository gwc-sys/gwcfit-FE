import { controlMetrics } from "../../../theme/theme";
import { adaptPageStyles } from "../../adaptPageStyles";
import { StyleSheet } from "react-native";
import { radius, shadows, spacing, typography } from "../../../theme/theme";
import type { ThemeColors } from "../../../theme/theme";

export const createStyles = (colors: ThemeColors) =>
  adaptPageStyles(StyleSheet.create({
    page: {
      flexGrow: 1,
      backgroundColor: "#090806"
    },
    pageWide: {
      flexDirection: "row"
    },
    screenContentPhone: {
      paddingBottom: spacing["48"]
    },
    hero: {
      minHeight: 390,
      backgroundColor: "#171006"
    },
    heroCompact: {
      minHeight: 220
    },
    heroPhone: {
      minHeight: 240
    },
    heroWide: {
      flex: 1.12,
      minHeight: 720
    },
    heroImage: {
      backgroundColor: "#171006"
    },
    heroOverlay: {
      flex: 1,
      justifyContent: "space-between",
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.xxl
    },
    heroOverlayCompact: {
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.lg
    },
    heroOverlayWide: {
      paddingHorizontal: spacing["48"],
      paddingTop: spacing.xxl,
      paddingBottom: spacing["48"]
    },
    heroContent: {
      maxWidth: 560
    },
    eyebrow: {
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      borderRadius: radius.pill,
      backgroundColor: "rgba(0,122,255,0.14)",
      borderWidth: 1,
      borderColor: "rgba(0,122,255,0.42)",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm
    },
    eyebrowDot: {
      width: 7,
      height: 7,
      borderRadius: radius.pill,
      backgroundColor: "#0A84FF"
    },
    eyebrowText: {
      ...typography.small,
      color: "#64D2FF",
      fontSize: 11,
      fontWeight: "800",
      letterSpacing: 1.2
    },
    heroTitle: {
      ...typography.title,
      color: colors.ink,
      marginTop: spacing.lg,
      fontSize: 44,
      lineHeight: 50
    },
    heroTitleCompact: {
      fontSize: 32,
      lineHeight: 38
    },
    heroCopy: {
      ...typography.body,
      color: "rgba(255,255,255,0.82)",
      marginTop: spacing.sm,
      maxWidth: 500,
      fontSize: 16,
      lineHeight: 24
    },
    heroCopyCompact: {
      fontSize: 14,
      lineHeight: 20
    },
    heroStats: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
      marginTop: spacing.md
    },
    heroStat: {
      minHeight: 38,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: "rgba(0,122,255,0.28)",
      backgroundColor: "rgba(8,7,5,0.48)",
      paddingHorizontal: spacing.md
    },
    heroStatText: {
      ...typography.small,
      color: colors.ink
    },
    content: {
      alignSelf: "center",
      width: "100%",
      gap: spacing.lg,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xxl,
      paddingBottom: spacing.xxl,
      backgroundColor: "#090806"
    },
    contentCompact: {
      gap: spacing.md,
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md
    },
    contentPhone: {
      paddingBottom: spacing["48"]
    },
    contentWide: {
      flex: 0.88,
      minWidth: 440,
      maxWidth: 680,
      justifyContent: "center",
      paddingHorizontal: spacing["48"],
      paddingVertical: spacing["48"]
    },
    form: {
      width: "100%",
      gap: spacing.lg,
      borderRadius: radius.container,
      borderWidth: 1,
      borderColor: "rgba(0,122,255,0.18)",
      backgroundColor: "#12110E",
      padding: spacing.xxl,
      ...shadows.card
    },
    formWide: {
      width: "100%",
      maxWidth: 500,
      alignSelf: "center"
    },
    formPhone: {
      gap: spacing.md,
      padding: spacing.lg
    },
    formHeader: {
      gap: spacing.xs
    },
    formKicker: {
      ...typography.small,
      color: "#0A84FF",
      fontSize: 11,
      fontWeight: "800",
      letterSpacing: 1.4,
      marginBottom: spacing.xs
    },
    formTitle: {
      ...typography.h2,
      color: colors.ink
    },
    formSubtitle: {
      ...typography.small,
      color: colors.muted
    },
    iconButton: { width: controlMetrics.minimumTouchSize, height: controlMetrics.minimumTouchSize, alignItems: "center", justifyContent: "center", borderRadius: radius.pill },
    forgot: {
      alignSelf: "flex-end",
      minHeight: 38,
      justifyContent: "center"
    },
    link: {
      color: "#0A84FF",
      fontWeight: "800"
    },
    submitButton: {
      backgroundColor: "#0A84FF",
      borderColor: "#0A84FF"
    },
    footer: {
      minHeight: 52,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: "rgba(0,122,255,0.16)",
      backgroundColor: "#12110E"
    },
    footerWide: {
      width: "100%",
      maxWidth: 500,
      alignSelf: "center"
    },
    footerText: {
      ...typography.body,
      color: colors.muted
    }
  }));

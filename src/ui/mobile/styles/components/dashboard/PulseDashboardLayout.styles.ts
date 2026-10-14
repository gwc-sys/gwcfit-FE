import { controlMetrics } from "../../../theme/theme";
import { adaptPageStyles } from "../../adaptPageStyles";
import { Platform, StyleSheet } from "react-native";
import { radius, shadows, spacing, typography } from "../../../theme/theme";
import type { ThemeColors } from "../../../theme/theme";

export const stylesStatic = adaptPageStyles(StyleSheet.create({
  mobileBrandButton: { width: controlMetrics.minimumTouchSize, height: controlMetrics.minimumTouchSize, alignItems: "center", justifyContent: "center", borderRadius: 22, backgroundColor: "rgba(0,122,255,0.14)" },
  pressed: {
    opacity: 0.72,
  },
}));

export const createStyles = (
  colors: ThemeColors,
  width: number,
  height: number,
  bottomInset: number,
) => {
  const compact = width < 560;
  const isDesktop = false;

  return adaptPageStyles(StyleSheet.create({
    root: {
      backgroundColor: colors.background,
    },
    scrollContent: {
      minHeight: "100%",
      paddingBottom:
        Platform.OS === "web" ? 112 : Math.max(112, bottomInset + 104),
    },
    shell: {
      width: "100%",
      alignSelf: "center",
    },
    shellDesktop: {
      maxWidth: 1680,
      flexDirection: "row",
      gap: spacing.xl,
      padding: spacing.lg,
    },
    shellMobile: {
      paddingHorizontal: 20,
      paddingTop: 16,
    },
    mobileBrandBar: {
      minHeight: 72,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.sm,
      borderBottomWidth: 0,
      borderBottomColor: colors.border,
      paddingHorizontal: 0,
    },
    mobileBrandGroup: {
      flex: 1,
      minWidth: 0,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    mobileBrandActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    mobileBrandMark: {
      width: 36,
      height: 36,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: radius.sm,
    },
    mobileBrandName: {
      color: colors.ink,
      fontSize: 24,
      lineHeight: 30,
      fontWeight: "700",
      letterSpacing: -0.5,
    },
    mobileIdentityCopy: {
      flex: 1,
      minWidth: 0,
      paddingLeft: spacing.xs,
    },
    mobileIdentityName: {
      color: colors.ink,
      fontSize: 15,
      lineHeight: 21,
      fontWeight: "600",
    },
    mobileIdentityRole: {
      color: colors.textSecondary,
      fontSize: 12,
      lineHeight: 17,
      fontWeight: "400",
    },
    sidebar: {
      width: 292,
      flexGrow: 0,
      flexShrink: 0,
      flexBasis: 292,
      alignSelf: "stretch",
      minHeight: 860,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: spacing.md,
      ...shadows.soft,
    },
    sidebarContent: {
      flexGrow: 1,
      padding: spacing.md,
    },
    trainerSidebar: {
      width: 260,
      flexBasis: 260,
      minHeight: 0,
      height: Math.max(720, height - spacing.xl),
      position: Platform.OS === "web" ? ("sticky" as any) : "relative",
      top: Platform.OS === "web" ? spacing.md : 0,
      alignSelf: "flex-start",
      overflow: "hidden",
      borderColor: colors.border,
      borderRadius: 18,
      padding: 0,
      backgroundColor: colors.surface,
      ...(Platform.OS === "web"
        ? { boxShadow: "0 10px 24px rgba(0,0,0,0.18)" }
        : { shadowOpacity: 0.18 }),
    },
    trainerSidebarContent: {
      minHeight: "100%",
      paddingHorizontal: 18,
      paddingTop: 22,
      paddingBottom: 18,
    },
    ownerSidebarContent: {
      minHeight: "100%",
      gap: 14,
      padding: spacing.md,
      backgroundColor: colors.surface,
    },
    ownerBrandRow: {
      minHeight: 58,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    ownerBrandMark: {
      width: 52,
      height: 52,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 12,
      backgroundColor: colors.primary,
    },
    ownerBrandName: {
      fontSize: 24,
      color: colors.ink,
      fontWeight: "700"
    },
    ownerBrandAccent: { color: colors.primaryDark },
    ownerBrandRole: { fontSize: 11, color: colors.textSecondary, marginTop: 1 },
    ownerGymSwitcher: {
      minHeight: 74,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      padding: 12,
      backgroundColor: colors.surfaceElevated,
    },
    ownerGymLogo: {
      width: 42,
      height: 42,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 7,
      backgroundColor: colors.primarySoft,
    },
    ownerGymCopy: { flex: 1 },
    ownerGymName: {
      fontSize: 14,
      color: colors.ink,
      fontWeight: "700"
    },
    ownerGymMeta: { fontSize: 11, color: colors.textSecondary, marginTop: 3 },
    ownerNavList: { gap: 3, marginTop: 8 },
    ownerNavItem: { minHeight: controlMetrics.minimumTouchSize, flexDirection: "row", alignItems: "center", gap: 15, paddingHorizontal: 12, borderRadius: 7 },
    ownerNavItemActive: { backgroundColor: colors.primary },
    ownerNavLabel: { fontSize: 13, color: colors.ink, fontWeight: "600" },
    ownerNavLabelActive: { color: colors.ink, fontWeight: "700" },
    ownerSettingsSection: {
      marginTop: 7,
      paddingTop: 9,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    ownerSettingsHeader: {
      height: 38,
      flexDirection: "row",
      alignItems: "center",
      gap: 11,
      paddingHorizontal: 12,
    },
    ownerSettingsTitle: {
      flex: 1,
      fontSize: 14,
      color: colors.primaryDark,
      fontWeight: "700"
    },
    ownerSubNav: {
      height: 34,
      flexDirection: "row",
      alignItems: "center",
      gap: 11,
      marginHorizontal: 2,
      paddingHorizontal: 12,
      borderRadius: 7,
    },
    ownerSubNavActive: { backgroundColor: colors.primarySoft },
    ownerSubDot: {
      width: 5,
      height: 5,
      borderRadius: 3,
      backgroundColor: colors.border,
    },
    ownerSubDotActive: { backgroundColor: colors.primary },
    ownerSubText: { fontSize: 12, color: colors.textSecondary },
    ownerSubTextActive: {
      color: colors.primaryDark,
      fontWeight: "700"
    },
    ownerSupport: {
      flexDirection: "row",
      alignItems: "center",
      gap: 15,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    ownerAccountButton: {
      minHeight: 58,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginTop: 4,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 12,
      paddingHorizontal: 8,
    },
    ownerAccountAvatarSmall: {
      width: 34,
      height: 34,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 17,
      backgroundColor: "#F6B38A",
    },
    ownerAccountCopy: { flex: 1, minWidth: 0 },
    ownerAccountName: {
      fontSize: 17,
      color: colors.ink,
      fontWeight: "700",
      lineHeight: 23
    },
    ownerAccountEmail: {
      fontSize: 13,
      color: colors.muted,
      marginTop: 2,
      lineHeight: 19
    },
    ownerAccountBackdrop: {
      flex: 1,
      alignItems: "center",
      justifyContent: "flex-end",
      paddingTop: 40,
      paddingRight: 16,
      backgroundColor: "rgba(0,0,0,0.45)",
      paddingHorizontal: 16,
      paddingBottom: Math.max(24, bottomInset + 12)
    },
    ownerAccountMenu: { width: "100%", borderWidth: 0, borderColor: "#26364B", borderRadius: 28, paddingVertical: 12, backgroundColor: colors.surface, ...(Platform.OS === "web"
        ? { boxShadow: "0 7px 28px rgba(0,0,0,0.30)" }
        : {
            shadowColor: "#000",
            shadowOpacity: 0.3,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 7 },
            elevation: 8,
          }), maxWidth: 520, maxHeight: "90%", minHeight: controlMetrics.minimumTouchSize },
    ownerAccountIdentity: {
      flexDirection: "row",
      alignItems: "center",
      gap: 11,
      paddingHorizontal: 15,
      paddingVertical: 12,
    },
    ownerAccountAvatar: {
      width: 42,
      height: 42,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 21,
      backgroundColor: "#F6B38A",
    },
    ownerAccountAvatarText: {
      fontSize: 16,
      color: "#FFFFFF",
      fontWeight: "700"
    },
    ownerAccountDivider: {
      height: 1,
      backgroundColor: colors.borderMuted,
      marginVertical: 6
    },
    ownerAccountItem: { minHeight: controlMetrics.minimumTouchSize, flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 16 },
    ownerAccountItemText: {
      fontSize: 17,
      color: colors.ink,
      fontWeight: "500"
    },
    trainerAccountBackdrop: {
      alignItems: "center",
      justifyContent: "flex-end",
      paddingTop: 40,
      paddingRight: 16,
      paddingLeft: 16,
      paddingBottom: Math.max(24, bottomInset + 12),
      backgroundColor: "rgba(0,0,0,0.45)"
    },
    trainerAccountMenu: {
      width: "100%",
      borderColor: colors.border,
      borderRadius: 28,
      paddingVertical: 12,
      overflow: "hidden",
      backgroundColor: colors.surface,
      maxWidth: 520
    },
    trainerAccountIdentity: {
      minHeight: 90,
      gap: 13,
      paddingHorizontal: 16,
      paddingVertical: 15,
    },
    trainerAccountAvatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: "#FFAD7F",
    },
    trainerAccountName: {
      fontSize: 16,
      color: colors.ink,
      fontWeight: "700"
    },
    trainerAccountEmail: {
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: 2,
    },
    trainerAccountItem: { minHeight: 52, gap: 16, paddingHorizontal: 18 },
    trainerAccountItemText: {
      fontSize: 17,
      fontWeight: "700"
    },
    sharedTrainerHeader: {
      zIndex: 50,
      position: Platform.OS === "web" ? ("sticky" as any) : "relative",
      top: 0,
      minHeight: 88,
      flexDirection: width < 900 ? "column" : "row",
      alignItems: width < 900 ? "stretch" : "center",
      justifyContent: "space-between",
      gap: spacing.md,
      borderWidth: 0,
      borderColor: colors.border,
      borderRadius: 15,
      paddingHorizontal: 0,
      paddingVertical: 11,
      marginBottom: 16,
      backgroundColor: colors.background,
      ...(Platform.OS === "web"
        ? { boxShadow: "0 8px 28px rgba(2,6,23,0.18)" }
        : {
            shadowColor: colors.dark,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0,
            shadowRadius: 14,
            elevation: 0,
          }),
    },
    sharedTrainerGreeting: { flex: 1, minWidth: 190 },
    sharedTrainerName: {
      color: colors.ink,
      fontSize: 34,
      lineHeight: 41,
      fontWeight: "700",
    },
    sharedTrainerMessage: {
      color: colors.primary,
      fontSize: 11,
      fontWeight: "800",
      marginTop: 1,
    },
    sharedTrainerActions: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: width < 900 ? "flex-start" : "flex-end",
      gap: 12,
    },
    sharedTrainerSearch: {
      width: width < 900 ? "100%" : 340,
      minHeight: 46,
      flexDirection: "row",
      alignItems: "center",
      gap: 9,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 11,
      paddingHorizontal: 14,
      backgroundColor: colors.surfaceElevated,
    },
    sharedTrainerSearchInput: {
      flex: 1,
      color: colors.ink,
      fontSize: 13,
      } as any,
    sharedTrainerDate: {
      minHeight: 46,
      flexDirection: "row",
      alignItems: "center",
      gap: 9,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 11,
      paddingHorizontal: 14,
      backgroundColor: colors.surfaceElevated,
    },
    sharedTrainerDateText: {
      color: colors.ink,
      fontSize: 13,
      fontWeight: "700"
    },
    sharedTrainerIcon: {
      width: 48,
      height: 48,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 24,
      backgroundColor: colors.surfaceElevated,
    },
    sharedTrainerProfile: {
      width: 52,
      height: 52,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 3,
      borderColor: colors.primary,
      borderRadius: 26,
    },
    sharedTrainerProfileInner: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 20,
      backgroundColor: colors.primarySoft,
    },
    sharedOwnerHeader: {
      zIndex: 50,
      position: Platform.OS === "web" ? ("sticky" as any) : "relative",
      top: 0,
      minHeight: 78,
      flexDirection: width < 1250 ? "column" : "row",
      alignItems: width < 1250 ? "stretch" : "center",
      justifyContent: "space-between",
      gap: 14,
      borderWidth: 0,
      borderColor: colors.border,
      borderRadius: 14,
      paddingHorizontal: 0,
      paddingVertical: 10,
      marginBottom: 12,
      backgroundColor: colors.background,
      ...shadows.none,
    },
    sharedOwnerGreeting: { flex: 1, minWidth: 250 },
    sharedOwnerTitle: {
      color: colors.ink,
      fontSize: 34,
      lineHeight: 41,
      fontWeight: "700",
    },
    sharedOwnerSubtitle: {
      color: colors.textSecondary,
      fontSize: 12,
      marginTop: 2,
    },
    sharedOwnerActions: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: width < 1250 ? "flex-start" : "flex-end",
      gap: 10,
    },
    sharedOwnerDate: {
      minHeight: 48,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 11,
      paddingHorizontal: 14,
      backgroundColor: colors.surfaceElevated,
    },
    sharedOwnerDateText: {
      color: colors.ink,
      fontSize: 12,
      fontWeight: "700"
    },
    sharedOwnerIcon: {
      width: 48,
      height: 48,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 11,
      backgroundColor: colors.surfaceElevated,
    },
    sharedOwnerBadge: {
      position: "absolute",
      top: -5,
      right: -3,
      minWidth: 19,
      height: 19,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 10,
      backgroundColor: colors.primary,
    },
    sharedOwnerBadgeText: {
      color: colors.white,
      fontSize: 10,
      fontWeight: "700"
    },
    sharedOwnerAdd: {
      minHeight: 48,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 7,
      borderRadius: 10,
      paddingHorizontal: 18,
      backgroundColor: colors.primary,
    },
    sharedOwnerAddText: { color: colors.ink, fontSize: 13, fontWeight: "800" },
    sharedOwnerProfile: {
      minHeight: 48,
      maxWidth: 190,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 6,
    },
    sharedOwnerAvatar: {
      width: 42,
      height: 42,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 21,
      backgroundColor: "#F6B38A",
    },
    sharedOwnerAvatarText: {
      color: "#FFFFFF",
      fontSize: 13,
      fontWeight: "700"
    },
    sharedOwnerProfileCopy: { maxWidth: 92 },
    sharedOwnerProfileName: {
      color: colors.ink,
      fontSize: 12,
      fontWeight: "700"
    },
    sharedOwnerProfileRole: {
      color: colors.textSecondary,
      fontSize: 9,
      marginTop: 2,
    },
    ownerAccountDanger: { color: "#EF4444" },
    ownerAccountDisabled: { opacity: 0.5 },
    ownerQuickActions: {
      gap: 13,
      marginTop: 0,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 9,
      padding: 14,
      backgroundColor: colors.surfaceElevated,
    },
    ownerQuickTitle: {
      fontSize: 14,
      color: colors.primaryDark,
      fontWeight: "700",
      marginBottom: 3
    },
    ownerQuickRow: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: controlMetrics.minimumTouchSize },
    ownerQuickText: { fontSize: 12, color: colors.ink },
    brandRow: {
      minHeight: 78,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      paddingHorizontal: spacing.sm,
    },
    trainerBrandRow: {
      minHeight: 72,
      gap: 12,
      marginBottom: 10,
      paddingHorizontal: 8,
    },
    platformBrandRow: {
      minHeight: 76,
      paddingHorizontal: 4,
    },
    brandMark: {
      width: 45,
      height: 45,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: radius.sm,
    },
    trainerBrandMark: {
      width: 46,
      height: 46,
      borderRadius: 12,
      ...(Platform.OS === "web"
        ? { boxShadow: "0 5px 20px rgba(124,58,237,0.30)" }
        : {
            shadowColor: "#0066CC",
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.3,
            shadowRadius: 10,
          }),
    },
    platformBrandMark: {
      width: 38,
      height: 38,
      borderRadius: 19,
    },
    brandName: {
      ...typography.h2,
      color: colors.ink,
      fontWeight: "700"
    },
    brandRole: {
      ...typography.small,
      color: colors.textSecondary,
      letterSpacing: 3,
      fontWeight: "800",
    },
    navList: {
      gap: spacing.xs,
      marginTop: spacing.md,
    },
    trainerNavList: {
      gap: 5,
      marginTop: 4,
    },
    platformNavList: {
      gap: 0,
      marginTop: 4,
    },
    navSection: {
      marginTop: 14,
      marginBottom: 5,
      paddingHorizontal: 4,
      color: colors.textSecondary,
      fontSize: 9,
      lineHeight: 12,
      fontWeight: "700",
    },
    navItem: {
      minHeight: 52,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: "transparent",
      paddingHorizontal: spacing.md,
    },
    trainerNavItem: {
      minHeight: 46,
      gap: 13,
      borderRadius: 10,
      paddingHorizontal: 13,
    },
    platformNavItem: {
      minHeight: 29,
      gap: 10,
      borderRadius: 6,
      paddingHorizontal: 8,
    },
    navItemActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary,
    },
    trainerNavActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary,
      ...(Platform.OS === "web"
        ? { boxShadow: "0 5px 20px rgba(0,122,255,0.22)" }
        : {
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.26,
            shadowRadius: 10,
          }),
    },
    platformNavActive: {
      borderColor: "transparent",
      backgroundColor: colors.primary,
    },
    navLabel: {
      ...typography.body,
      color: colors.textSecondary,
      fontWeight: "600",
    },
    trainerNavLabel: {
      color: colors.textSecondary,
      fontSize: 14,
      lineHeight: 19,
      fontWeight: "700",
    },
    navLabelActive: {
      color: colors.ink,
      fontWeight: "700"
    },
    sidebarFooter: {
      flex: 1,
      justifyContent: "flex-end",
    },
    copyright: {
      gap: 4,
      marginTop: 28,
      paddingHorizontal: 10,
      paddingBottom: 8,
    },
    copyrightText: {
      color: colors.textSecondary,
      fontSize: 9,
      lineHeight: 12,
    },
    profileCard: {
      minHeight: 86,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      padding: spacing.sm,
    },
    trainerProfileCard: {
      minHeight: 72,
      marginTop: 18,
      borderColor: "#263750",
      borderRadius: 12,
      backgroundColor: "#101D2E",
      paddingHorizontal: 10,
    },
    avatar: {
      width: 50,
      height: 50,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: radius.pill,
    },
    avatarText: {
      ...typography.h3,
      color: "#0F172A",
      fontWeight: "700"
    },
    profileCopy: {
      flex: 1,
      minWidth: 0,
    },
    profileName: {
      ...typography.h3,
      color: colors.ink,
    },
    profileRole: {
      ...typography.small,
      color: colors.textSecondary,
    },
    mainPanel: {
      flex: 1,
      minWidth: 0,
      borderRadius: isDesktop ? radius.xl : 0,
      borderWidth: isDesktop ? 1 : 0,
      borderColor: colors.border,
      backgroundColor: isDesktop ? colors.surface : "transparent",
      padding: compact ? spacing.md : isDesktop ? spacing.xxl : spacing.lg,
      gap: spacing.lg,
      ...(!isDesktop ? shadows.none : shadows.soft),
    },
    pressed: {
      opacity: 0.78,
      transform: [{ translateY: 1 }],
    },
  }));
};

export const createHeaderStyles = (colors: ThemeColors, width: number) => {
  const compact = width < 680;
  const hideDate = width < 520;

  return adaptPageStyles(StyleSheet.create({
    header: {
      minHeight: compact ? 116 : 82,
      flexDirection: compact ? "column" : "row",
      alignItems: compact ? "stretch" : "center",
      justifyContent: "space-between",
      gap: spacing.md,
    },
    headerCopy: {
      flex: 1,
      minWidth: 0,
    },
    title: {
      ...typography.h1,
      color: colors.ink,
      fontWeight: "700",
    },
    subtitle: {
      ...typography.body,
      color: colors.textSecondary,
      marginTop: spacing.xs,
    },
    headerActions: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: compact ? "flex-start" : "flex-end",
      gap: spacing.md,
      flexWrap: "wrap",
    },
    datePill: {
      display: hideDate ? "none" : "flex",
      minHeight: 46,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      paddingHorizontal: spacing.md,
    },
    dateText: {
      ...typography.small,
      color: colors.ink,
      fontWeight: "800",
    },
    circleButton: {
      width: compact ? 48 : 58,
      height: compact ? 48 : 58,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    badge: {
      position: "absolute",
      top: compact ? 4 : 7,
      right: compact ? 4 : 7,
      minWidth: 21,
      height: 21,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: radius.pill,
      backgroundColor: colors.primary,
    },
    badgeText: {
      fontSize: 11,
      lineHeight: 15,
      color: colors.white,
      fontWeight: "700"
    },
    pressed: {
      opacity: 0.8,
      transform: [{ translateY: 1 }],
    },
  }));
};

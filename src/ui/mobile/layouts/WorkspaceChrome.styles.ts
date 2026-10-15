import { controlMetrics, getResponsiveFontSize } from "../theme/theme";
import { StyleSheet } from "react-native";
import type { ThemeColors } from "../theme/theme";

export const createWorkspaceChromeStyles = (c: ThemeColors, width: number) => {
  const gutter = width < 380 ? 16 : width >= 768 ? 28 : 20;
  return StyleSheet.create({
    root: { backgroundColor: c.background },
    dashboardContent: { paddingBottom: 32, flexGrow: 1 },
    pageContent: { flex: 1 },
    navigationBar: { minHeight: 60, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: gutter, paddingVertical: 10, borderBottomWidth: 0, borderBottomColor: c.borderMuted },
    brand: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10, minWidth: 0 },
    brandMark: { width: 32, height: 32, borderRadius: 13, backgroundColor: c.primarySoft, alignItems: "center", justifyContent: "center" },
    identity: { flex: 1, minWidth: 0 },
    brandName: { fontSize: getResponsiveFontSize(width, 16), lineHeight: getResponsiveFontSize(width, 21), fontWeight: "700", letterSpacing: -0.4, color: c.primary },
    role: { fontSize: 12, lineHeight: 17, color: c.muted },
    iconButton: { width: controlMetrics.minimumTouchSize, height: controlMetrics.minimumTouchSize, alignItems: "center", justifyContent: "center", borderRadius: 22, backgroundColor: c.surface },
    notificationDot: { position: "absolute", top: 8, right: 9, width: 7, height: 7, borderRadius: 4, backgroundColor: c.danger, borderWidth: 1, borderColor: c.surface },
    accountButton: { width: controlMetrics.minimumTouchSize, height: undefined, borderRadius: 22, backgroundColor: c.primarySoft, alignItems: "center", justifyContent: "center", minHeight: controlMetrics.minimumTouchSize },
    accountInitials: { color: c.primary, fontSize: 14, fontWeight: "700" },
    overview: { paddingHorizontal: gutter, paddingTop: 26, paddingBottom: 22, gap: 5 },
    eyebrow: { color: c.muted, fontSize: 11, lineHeight: 17, letterSpacing: 1.5, fontWeight: "600" },
    title: { fontSize: getResponsiveFontSize(width, 28), lineHeight: getResponsiveFontSize(width, 34), fontWeight: "700", letterSpacing: -1, color: c.ink },
    subtitle: { fontSize: 16, lineHeight: 23, color: c.muted },
    toolbar: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 15 },
    dateButton: { minHeight: controlMetrics.minimumTouchSize, flexGrow: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingHorizontal: 12, borderRadius: 14, backgroundColor: c.surface },
    dateText: { color: c.ink, fontSize: 14, fontWeight: "500", flexShrink: 1 },
    addButton: { minHeight: controlMetrics.minimumTouchSize, flexGrow: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingHorizontal: 14, borderRadius: 14, backgroundColor: c.primaryButton },
    addText: { color: c.white, fontSize: 15, fontWeight: "600" },
    dashboardBody: { gap: 20, paddingHorizontal: gutter, width: "100%", maxWidth: 1120, alignSelf: "center" },
    screenBody: { flex: 1, minHeight: 0 },
    searchBar: { minHeight: 48, flexDirection: "row", alignItems: "center", gap: 10, marginHorizontal: gutter, marginVertical: 12, paddingLeft: 14, paddingRight: 4, borderRadius: 14, backgroundColor: c.surface },
    searchInput: { flex: 1, minWidth: 0, minHeight: 46, fontSize: 17, color: c.ink },
    clearButton: { width: controlMetrics.minimumTouchSize, height: controlMetrics.minimumTouchSize, alignItems: "center", justifyContent: "center" },
    trainerDate: { minHeight: controlMetrics.minimumTouchSize, flexDirection: "row", alignItems: "center", gap: 8, marginHorizontal: gutter, marginBottom: 16 },
    pressed: { opacity: 0.65 }
  });
};

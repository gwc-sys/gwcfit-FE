import { controlMetrics } from "../../../theme/theme";
import { adaptPageStyles } from "../../adaptPageStyles";
import { StyleSheet } from "react-native";
import type { ThemeColors } from "../../../theme/theme";

export const createSharedStyles = (colors: ThemeColors) => adaptPageStyles(StyleSheet.create({
  stat: { minWidth: 210, minHeight: 108, flex: 1, flexDirection: "row", alignItems: "center", gap: 14, borderWidth: 1, borderColor: colors.border, borderRadius: 13, padding: 18, backgroundColor: colors.card }, statIcon: { width: 52, height: 52, alignItems: "center", justifyContent: "center", borderRadius: 26 }, statValue: {
      color: colors.ink,
      fontSize: 23,
      fontWeight: "700"
    }, statLabel: { color: colors.inkSoft, fontSize: 13, fontWeight: "700" }, statNote: { color: colors.muted, fontSize: 11, marginTop: 3 },
  card: { minWidth: 215, flexGrow: 1, flexBasis: 220, overflow: "hidden", borderWidth: 1, borderColor: colors.border, borderRadius: 13, backgroundColor: colors.card }, imageWrap: { height: 145, overflow: "hidden", backgroundColor: colors.surfaceStrong }, cardImage: { width: "100%", height: "100%" }, status: { position: "absolute", left: 12, top: 12, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 }, statusText: { fontSize: 11, fontWeight: "800" }, more: { position: "absolute", right: 10, top: 10, width: 33, height: 33, alignItems: "center", justifyContent: "center", borderRadius: 8, backgroundColor: "rgba(15,23,42,.82)" }, cardBody: { gap: 7, padding: 14 }, cardTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 }, cardTitle: {
      flex: 1,
      color: colors.ink,
      fontSize: 15,
      fontWeight: "700"
    }, category: { color: colors.muted, fontSize: 12 }, description: { minHeight: 34, color: colors.textSecondary, fontSize: 12, lineHeight: 17 }, cardMeta: { flexDirection: "row", justifyContent: "space-between", gap: 8, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10 }, metaItem: { flexDirection: "row", alignItems: "center", gap: 6 }, metaText: { color: colors.inkSoft, fontSize: 11, fontWeight: "700" }, assignee: { flexDirection: "row", alignItems: "center", gap: 8, paddingTop: 2 }, miniAvatar: { width: 25, height: 25, alignItems: "center", justifyContent: "center", borderRadius: 13, backgroundColor: colors.primary }, miniAvatarText: {
      color: "#FFFFFF",
      fontSize: 10,
      fontWeight: "700"
    }, assigneeText: { flex: 1, color: colors.muted, fontSize: 11 }
}));

export const createStyles = (compact: boolean, colors: ThemeColors) => adaptPageStyles(StyleSheet.create({
  screen: { gap: 20, paddingTop: 6, paddingBottom: 80, backgroundColor: "#08111D" }, header: { flexDirection: compact ? "column" : "row", alignItems: compact ? "stretch" : "center", justifyContent: "space-between", gap: 15, borderWidth: 1, borderColor: "#263850", borderRadius: 15, padding: 16, backgroundColor: "#0B1524" }, headerCopy: { flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", gap: 14 }, backIcon: { width: 48, height: 48, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: "#1B2340" }, title: {
      color: "#FFFFFF",
      fontSize: 25,
      fontWeight: "700"
    }, subtitle: { color: "#9EADC0", fontSize: 12, marginTop: 4 }, headerActions: { flexDirection: "row", flexWrap: "wrap", gap: 10 }, importButton: { minHeight: controlMetrics.minimumTouchSize, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1, borderColor: "#40506A", borderRadius: 9, paddingHorizontal: 16 }, importText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" }, createButton: { minHeight: controlMetrics.minimumTouchSize, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 9, paddingHorizontal: 17, backgroundColor: "#0066CC" }, createText: {
      color: "#FFFFFF",
      fontSize: 12,
      fontWeight: "700"
    }, statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 14 }, toolbar: { flexDirection: "row", flexWrap: "wrap", gap: 12 }, searchBox: { minWidth: compact ? 0 : 360, flex: 1, height: 52, flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderColor: "#2B3B52", borderRadius: 10, paddingHorizontal: 14, backgroundColor: "#0C1625" }, searchInput: { flex: 1, height: "100%", color: "#FFFFFF", fontSize: 13, outlineStyle: "none" } as any, filterButton: { minHeight: 52, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9, borderWidth: 1, borderColor: "#2B3B52", borderRadius: 10, paddingHorizontal: 15, backgroundColor: "#0C1625" }, statusDot: { width: 10, height: 10, borderRadius: 5 }, filterText: { color: "#D8E1EC", fontSize: 12, fontWeight: "700" }, tabs: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, tab: { minHeight: controlMetrics.minimumTouchSize, alignItems: "center", justifyContent: "center", borderRadius: 999, paddingHorizontal: 17, backgroundColor: "#111D2D" }, tabActive: { backgroundColor: "#007AFF" }, tabText: { color: "#A7B5C7", fontSize: 12, fontWeight: "700" }, tabTextActive: {
      color: "#FFFFFF",
      fontWeight: "700"
    }, cardGrid: { flexDirection: "row", flexWrap: "wrap", gap: 14 }, state: { minHeight: 180, alignItems: "center", justifyContent: "center", gap: 9, borderWidth: 1, borderColor: "#263850", borderRadius: 13, backgroundColor: "#0D1827" }, stateTitle: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "700"
    }, stateText: { color: "#98A9BE", fontSize: 12 }, footer: { flexDirection: compact ? "column" : "row", alignItems: "center", justifyContent: "space-between", gap: 14, borderTopWidth: 1, borderTopColor: "#223249", paddingTop: 18 }, footerText: { color: "#9CAEC3", fontSize: 12 }, pagination: { flexDirection: "row", gap: 8 }, pageButton: { width: controlMetrics.minimumTouchSize, height: undefined, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#2E4059", borderRadius: 8, backgroundColor: "#0D1726", minHeight: controlMetrics.minimumTouchSize }, pageButtonActive: { borderColor: "#0066CC", backgroundColor: "#0066CC" }, pageText: { color: "#B8C6D9", fontSize: 12, fontWeight: "800" }, pageTextActive: { color: "#FFFFFF" }, disabled: { opacity: 0.35 }, perPage: { minHeight: 44, flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: "#2E4059", borderRadius: 8, paddingHorizontal: 15, backgroundColor: "#0D1726" }
  ,modalBackdrop: { flex: 1, alignItems: "center", justifyContent: "center", padding: compact ? 10 : 24, backgroundColor: "rgba(2,6,23,0.82)" }, modalWindow: { width: "100%", maxWidth: 1180, maxHeight: "94%", overflow: "hidden", borderWidth: 1, borderColor: "#31435C", borderRadius: 18, backgroundColor: "#08111D" }, modalHeader: { minHeight: 74, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 14, borderBottomWidth: 1, borderBottomColor: "#263850", paddingHorizontal: compact ? 14 : 22, backgroundColor: "#0D1827" }, modalTitle: {
      color: "#FFFFFF",
      fontSize: compact ? 18 : 22,
      fontWeight: "700"
    }, modalSubtitle: { color: "#98A9BE", fontSize: 11, marginTop: 3 }, modalClose: { width: controlMetrics.minimumTouchSize, height: controlMetrics.minimumTouchSize, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: "#1B2940" }, modalScroll: { padding: compact ? 10 : 18, paddingBottom: 30 }
}));

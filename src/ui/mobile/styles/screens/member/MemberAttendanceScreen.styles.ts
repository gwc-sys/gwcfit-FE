import { controlMetrics } from "../../../theme/theme";
import { adaptPageStyles } from "../../adaptPageStyles";
import { StyleSheet } from "react-native";

export const styles = adaptPageStyles(StyleSheet.create({
  screen: {
      width: "100%",
      maxWidth: 1320,
      alignSelf: "center",
      gap: 18,
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 32
    },
  header: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 14 }, title: {
      fontSize: 27,
      lineHeight: 34,
      fontWeight: "700"
    }, subtitle: { marginTop: 3, fontSize: 13 }, datePill: { minHeight: 44, flexDirection: "row", alignItems: "center", gap: 9, borderWidth: 1, borderRadius: 10, paddingHorizontal: 13 }, dateText: { fontSize: 12, fontWeight: "800" }, error: { fontSize: 13, fontWeight: "700" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 }, mobileStatsContent: { gap: 12, paddingRight: 4 }, statCard: { flex: 1, flexBasis: 190, minWidth: 145, minHeight: 145, borderWidth: 1, borderRadius: 13, padding: 16 }, mobileStatCard: { flex: 0, width: 180, minWidth: 180 }, statTop: { flexDirection: "row", alignItems: "center", gap: 9 }, statIcon: { width: 34, height: 34, alignItems: "center", justifyContent: "center", borderRadius: 9 }, statLabel: { fontSize: 12 }, statValue: {
      marginTop: 21,
      fontSize: 21,
      fontWeight: "700"
    }, statDetail: { marginTop: 8, fontSize: 11 },
  actionShell: { position: "relative", flexDirection: "row", overflow: "hidden", borderWidth: 1, borderRadius: 14 }, actionShellCompact: { flexDirection: "column" }, actionCard: { flex: 1, minHeight: 300, alignItems: "center", padding: 24 }, actionHeading: { flexDirection: "row", alignItems: "center", gap: 12 }, actionIcon: { width: 52, height: 52, alignItems: "center", justifyContent: "center", borderRadius: 26, borderWidth: 1 }, actionTitle: {
      fontSize: 18,
      fontWeight: "700"
    }, actionSubtitle: { marginTop: 4, fontSize: 12 }, actionTime: {
      marginTop: 23,
      fontSize: 27,
      fontWeight: "700"
    }, actionDate: { marginTop: 6, fontSize: 12 }, actionButton: { width: "78%", maxWidth: 290, minHeight: 55, marginTop: 23, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, borderRadius: 13 }, actionButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "700"
    }, disabled: { opacity: 0.35 }, branch: { maxWidth: "80%", marginTop: 14, flexDirection: "row", alignItems: "center", gap: 5, borderWidth: 1, borderRadius: 18, paddingHorizontal: 13, paddingVertical: 6 }, branchText: { fontSize: 11 }, orBadge: { position: "absolute", zIndex: 2, left: "50%", top: "50%", width: 62, height: 62, marginLeft: -31, marginTop: -31, alignItems: "center", justifyContent: "center", borderWidth: 1, borderRadius: 31 }, orText: {
      fontSize: 18,
      fontWeight: "700"
    },
  historyHeader: { flexDirection: "row", justifyContent: "space-between" }, historyTitle: {
      fontSize: 18,
      fontWeight: "700"
    }, viewAll: { fontSize: 12, fontWeight: "800" }, historyCard: { borderWidth: 1, borderRadius: 13, paddingHorizontal: 16 }, historyRow: { minHeight: 80, flexDirection: "row", alignItems: "center", gap: 13, paddingVertical: 12 }, historyIcon: { width: 44, height: 44, alignItems: "center", justifyContent: "center", borderRadius: 22 }, historyCopy: { flex: 1, minWidth: 0 }, historyStatus: {
      fontSize: 13,
      fontWeight: "700"
    }, historyMeta: { marginTop: 5, fontSize: 11 }, historyEnd: { fontSize: 11, fontWeight: "700" }, empty: { paddingVertical: 30, textAlign: "center" },
  backdrop: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.75)", padding: 20 }, qrModal: { width: "100%", maxWidth: 390, alignItems: "center", borderWidth: 1, borderRadius: 18, padding: 24 }, close: { position: "absolute", zIndex: 2, top: 10, right: 10, padding: 8, minHeight: controlMetrics.minimumTouchSize }, qrTitle: {
      fontSize: 21,
      fontWeight: "700"
    }, qrHelp: { marginTop: 8, marginBottom: 20, fontSize: 12, textAlign: "center" }, qrFrame: { padding: 14, borderRadius: 12, backgroundColor: "#FFFFFF" }, qrGym: { marginTop: 12, fontSize: 12, fontWeight: "700" }, confirmButton: { width: "100%", minHeight: 52, marginTop: 18, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9, borderRadius: 12 }, confirmText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "700"
    }
}));

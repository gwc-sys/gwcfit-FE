import { controlMetrics } from "../../../theme/theme";
import { adaptPageStyles } from "../../adaptPageStyles";
import { StyleSheet } from "react-native";
import { shadows, typography } from "../../../theme/theme";
import type { ThemeColors } from "../../../theme/theme";

export const ui = adaptPageStyles(StyleSheet.create({
  button: { minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1, borderRadius: 12, paddingHorizontal: 18 }, buttonText: { fontSize: 13, fontWeight: "600" }, pressed: { opacity: .76 },
  metric: { flex: 1, minWidth: 215, minHeight: 116, flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderRadius: 18, padding: 16, ...shadows.subtle }, metricIcon: { width: 50, height: 50, alignItems: "center", justifyContent: "center", borderRadius: 25 }, metricCopy: { flex: 1, minWidth: 85 }, metricLabel: { fontSize: 12, fontWeight: "600" }, metricValue: { fontSize: 25, lineHeight: 31, fontWeight: "600" }, metricSub: { fontSize: 11 }, bars: { height: 54, flexDirection: "row", alignItems: "flex-end", gap: 4 },
  state: { minHeight: 190, alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1, borderRadius: 18, padding: 20 }, stateTitle: { fontSize: 20, lineHeight: 26, fontWeight: "600", textAlign: "center" }, stateText: { fontSize: 14, lineHeight: 21, maxWidth: 280, textAlign: "center" },
}));

export const makeStyles = (theme: ThemeColors, compact: boolean) => {
 const c = theme;
 return adaptPageStyles(StyleSheet.create({
  screen: {
      gap: 20,
      paddingTop: 20,
      paddingBottom: 32
    },
  metrics: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  libraryHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  sectionTitle: { fontSize: 20, fontWeight: "600", letterSpacing: -0.4, color: c.ink },
  resultCount: { fontSize: 13, color: c.muted },
  toolbar: { gap: 12 },
  filters: { flexDirection: "row", gap: 6, paddingVertical: 2 },
  filter: { minHeight: 44, alignItems: "center", justifyContent: "center", borderRadius: 22, paddingHorizontal: 16, backgroundColor: c.surface },
  filterActive: { backgroundColor: c.primarySoft },
  filterText: { fontSize: 13, lineHeight: 19, color: c.muted, fontWeight: "500" },
  filterTextActive: { color: c.primary, fontWeight: "700" },
  newWorkout: { minHeight: 44, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, borderRadius: 14, paddingHorizontal: 14, backgroundColor: c.primary },
  newWorkoutText: { fontSize: 14, color: "#FFFFFF", fontWeight: "600" },
  sort: { minHeight: 44, flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 4 },
  sortText: { fontSize: 13, color: c.muted },
  list: { gap: 16 },
  card: { minHeight: compact ? 0 : 140, flexDirection: compact ? "column" : "row", alignItems: compact ? "stretch" : "center", gap: 16, borderWidth: 1, borderColor: c.border, borderRadius: 18, padding: 0, overflow: "hidden", backgroundColor: c.surface, ...shadows.subtle }, thumbWrap: { width: compact ? "100%" : 310, height: compact ? 210 : 122, borderRadius: 12, overflow: "hidden", backgroundColor: c.surfaceStrong }, thumb: { width: "100%", height: "100%" }, thumbBadge: { position: "absolute", left: 12, top: 12, width: 42, height: 42, alignItems: "center", justifyContent: "center", borderRadius: 12 }, cardCopy: { flex: 1, minWidth: controlMetrics.minimumTouchSize, gap: 5, paddingHorizontal: compact ? 16 : 0, minHeight: controlMetrics.minimumTouchSize }, cardTitle: { ...typography.h2, color: c.ink, fontSize: 21 }, cardCategory: { ...typography.small, fontWeight: "600" }, cardMeta: { ...typography.small, color: c.muted }, cardActions: { minWidth: compact ? 0 : 170, alignItems: compact ? "stretch" : "flex-end", gap: 8, padding: compact ? 16 : 0 }, status: { alignSelf: "flex-start", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5 }, statusText: { fontSize: 11, fontWeight: "600" }, start: { minHeight: controlMetrics.minimumTouchSize, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, paddingHorizontal: 16, backgroundColor: c.primary }, startText: { ...typography.small, color: "#fff", fontWeight: "600" }, detail: { minHeight: controlMetrics.minimumTouchSize, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1, borderColor: c.border, borderRadius: 12, paddingHorizontal: 16 }, detailText: { ...typography.small, color: c.ink }, date: { flexDirection: "row", alignItems: "center", gap: 8 }, dateText: { ...typography.small, color: c.muted }, error: { ...typography.small, color: c.danger, textAlign: "center" },
  progress: { flexDirection: "row", alignItems: "center", gap: 12, borderTopWidth: 1, borderColor: c.border, paddingVertical: 18, marginTop: 8 },
  trophy: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: c.primarySoft },
  progressCopy: { flex: 1, minWidth: 0, gap: 3 },
  progressTitle: { fontSize: 16, fontWeight: "600", color: c.ink },
  progressText: { fontSize: 13, lineHeight: 19, color: c.muted },
}));
};

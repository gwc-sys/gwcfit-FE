import { adaptPageStyles } from "../../adaptPageStyles";
import { StyleSheet } from "react-native";
import { radius, spacing, typography } from "../../../theme/theme";
import type { ThemeColors } from "../../../theme/theme";

export const createStyles = (colors: ThemeColors) =>
  adaptPageStyles(StyleSheet.create({
  screen: {
      gap: spacing.md,
      paddingTop: spacing.md,
      paddingBottom: 32
    },
  metrics: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md
  },
  chartGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md
  },
  wideChart: { flexGrow: 2, flexBasis: 500, minWidth: 0 },
  sideChart: { flexGrow: 1, flexBasis: 300, minWidth: 0 },
  columnChart: { height: 210, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-around", gap: spacing.sm, paddingTop: spacing.md },
  columnItem: { flex: 1, height: "100%", alignItems: "center", justifyContent: "flex-end", gap: spacing.xs },
  columnValue: { minHeight: 18, color: colors.textMuted, fontSize: 9, textAlign: "center" },
  columnTrack: { width: "70%", height: 148, alignItems: "center", justifyContent: "flex-end", borderRadius: radius.sm, backgroundColor: colors.surfaceMuted, overflow: "hidden" },
  columnFill: { width: "100%", borderRadius: radius.sm },
  columnLabel: { color: colors.textSecondary, fontSize: 10, fontWeight: "700" },
  analyticsHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md },
  analyticsKicker: { ...typography.small, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 1 },
  analyticsTitle: { ...typography.h2, color: colors.ink, marginTop: 3 },
  periodPill: { borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceElevated, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  periodPillText: { color: colors.textSecondary, fontSize: 11, fontWeight: "800" },
  volumeChart: { minHeight: 210, justifyContent: "space-between", paddingTop: spacing.sm },
  chartGridLine: { height: 1, flexDirection: "row", alignItems: "flex-start", borderTopWidth: 1, borderTopColor: colors.borderMuted },
  chartAxisLabel: { position: "absolute", top: -18, color: colors.textMuted, fontSize: 10 },
  volumeColumns: { height: 180, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-around", gap: spacing.sm, paddingLeft: spacing.lg },
  volumeColumn: { flex: 1, height: "100%", alignItems: "center", justifyContent: "flex-end", gap: spacing.xs },
  methodRow: { gap: spacing.xs, marginBottom: spacing.sm },
  methodValue: { color: colors.textSecondary, fontSize: 11, fontWeight: "800" },
  transactionRow: { minHeight: 56, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderMuted },
  transactionMain: { flex: 1, gap: 3 },
  transactionMeta: { color: colors.textMuted, fontSize: 11 },
  transactionAmount: {
      color: colors.success,
      fontSize: 14,
      fontWeight: "700"
    },
  gymReportHeader: { flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: colors.borderMuted, paddingBottom: spacing.sm },
  gymReportHeaderText: { color: colors.textMuted, fontSize: 10, fontWeight: "800", textTransform: "uppercase" },
  gymReportRow: { minHeight: 52, flexDirection: "row", alignItems: "center", gap: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderMuted },
  gymReportName: { flex: 1, minWidth: 120, flexDirection: "row", alignItems: "center", gap: spacing.sm },
  gymReportNumber: { width: 68, color: colors.ink, fontSize: 12, fontWeight: "800", textAlign: "right" },
  gymRevenue: { width: 170, flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: spacing.sm },
  miniTrack: { flex: 1, maxWidth: 86, height: 6, borderRadius: radius.pill, backgroundColor: colors.surfaceStrong, overflow: "hidden" },
  miniFill: { height: "100%", borderRadius: radius.pill },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  emptyText: { ...typography.body, color: colors.textSecondary, paddingVertical: spacing.md },
  reportRow: {
    gap: spacing.sm
  },
  reportTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  reportLabel: {
    ...typography.body,
    color: colors.ink,
    fontWeight: "800"
  },
  track: {
    height: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceStrong,
    overflow: "hidden"
  },
  fill: {
    height: "100%",
    borderRadius: radius.pill
  }
  }));

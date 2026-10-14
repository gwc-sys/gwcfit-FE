import { controlMetrics } from "../../theme/theme";
import { StyleSheet } from "react-native";
import type { ThemeColors } from "../../theme/theme";

export const stylesShared = StyleSheet.create({
  macro: {
    minWidth: 120,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  dot: { width: 9, height: 9, borderRadius: 5 },
  macroLabel: { color: "#91A3B8", fontSize: 10, fontWeight: "700" },
  macroValue: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "700",
      marginTop: 2
    },
});

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      gap: 13,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      padding: 14,
      backgroundColor: colors.background,
    },
    headingRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    headingCopy: { flex: 1, minWidth: 220 },
    title: {
      color: colors.ink,
      fontSize: 16,
      fontWeight: "700"
    },
    subtitle: { color: colors.muted, fontSize: 11, marginTop: 3 },
    generateButton: { minHeight: controlMetrics.minimumTouchSize, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, borderRadius: 9, paddingHorizontal: 13, backgroundColor: colors.primary },
    generateText: {
      color: "#FFFFFF",
      fontSize: 12,
      fontWeight: "700"
    },
    summary: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      padding: 12,
      backgroundColor: colors.surface,
    },
    searchBox: {
      minHeight: 44,
      flexDirection: "row",
      alignItems: "center",
      gap: 9,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 9,
      paddingHorizontal: 12,
      backgroundColor: colors.surface,
    },
    searchInput: { flex: 1, color: colors.ink, fontSize: 12 },
    categorySelector: {
      minHeight: 58,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      backgroundColor: colors.surface,
    },
    categorySelectorIcon: {
      width: 36,
      height: 36,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 9,
      backgroundColor: colors.primarySoft,
    },
    categorySelectorCopy: { flex: 1 },
    categorySelectorLabel: {
      color: colors.muted,
      fontSize: 9,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.7,
    },
    categorySelectorValue: {
      color: colors.ink,
      fontSize: 13,
      fontWeight: "700",
      marginTop: 2
    },
    categoryCount: {
      minWidth: 28,
      height: 24,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 12,
      backgroundColor: colors.primarySoft,
    },
    categoryCountText: {
      color: colors.primary,
      fontSize: 10,
      fontWeight: "700"
    },
    categoryBackdrop: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
      backgroundColor: "rgba(2,6,23,0.78)",
    },
    categoryPanel: { width: "100%", maxWidth: 720, maxHeight: "82%", overflow: "hidden", borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 16, backgroundColor: colors.surface, minHeight: controlMetrics.minimumTouchSize },
    categoryPanelHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingBottom: 14,
      marginBottom: 10,
    },
    categoryPanelTitleRow: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    categoryPanelIcon: {
      width: 42,
      height: 42,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 11,
      backgroundColor: colors.primarySoft,
    },
    categoryPanelTitle: {
      color: colors.ink,
      fontSize: 16,
      fontWeight: "700"
    },
    categoryPanelSubtitle: { color: colors.muted, fontSize: 10, marginTop: 2 },
    categoryClose: { width: controlMetrics.minimumTouchSize, height: controlMetrics.minimumTouchSize, alignItems: "center", justifyContent: "center", borderRadius: 9, backgroundColor: colors.surfaceElevated },
    categoryGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      paddingVertical: 4,
    },
    categoryOption: { width: "48%", minHeight: controlMetrics.minimumTouchSize, flexGrow: 1, flexDirection: "row", alignItems: "center", gap: 9, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 11, backgroundColor: colors.surfaceElevated },
    categoryOptionActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primarySoft,
    },
    categoryRadio: {
      width: 22,
      height: 22,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 11,
    },
    categoryRadioActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary,
    },
    categoryOptionText: {
      flex: 1,
      color: colors.inkSoft,
      fontSize: 11,
      fontWeight: "700",
    },
    categoryOptionTextActive: {
      color: colors.ink,
      fontWeight: "700"
    },
    foodGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    foodCard: {
      width: 190,
      minHeight: 112,
      gap: 5,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      padding: 10,
      backgroundColor: colors.surface,
    },
    foodTitleRow: { flexDirection: "row", alignItems: "flex-start", gap: 7 },
    foodName: {
      flex: 1,
      color: colors.ink,
      fontSize: 12,
      lineHeight: 16,
      fontWeight: "700"
    },
    addButton: { width: controlMetrics.minimumTouchSize, height: controlMetrics.minimumTouchSize, alignItems: "center", justifyContent: "center", borderRadius: 8, backgroundColor: colors.primary },
    calories: {
      color: "#F59E0B",
      fontSize: 12,
      fontWeight: "700"
    },
    macros: { color: colors.muted, fontSize: 10 },
    tags: { color: colors.primary, fontSize: 9, fontWeight: "700" },
    benefit: { color: colors.muted, fontSize: 9 },
    resultNote: { color: colors.muted, fontSize: 10 },
    planBlock: {
      gap: 10,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 13,
    },
    planHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    planCount: { color: colors.primary, fontSize: 11, fontWeight: "800" },
    mealGroup: { gap: 6 },
    selectedRow: {
      minHeight: 54,
      flexDirection: "row",
      alignItems: "center",
      gap: 9,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 9,
      padding: 8,
      backgroundColor: colors.surface,
    },
    selectedCopy: { flex: 1, minWidth: 120 },
    selectedName: { color: colors.ink, fontSize: 12, fontWeight: "800" },
    selectedMeta: { color: colors.muted, fontSize: 10, marginTop: 3 },
    stepper: { flexDirection: "row", alignItems: "center", gap: 7 },
    stepButton: { width: controlMetrics.minimumTouchSize, height: controlMetrics.minimumTouchSize, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border, borderRadius: 7 },
    servings: {
      minWidth: 32,
      color: colors.ink,
      fontSize: 11,
      fontWeight: "700",
      textAlign: "center"
    },
    removeButton: { width: controlMetrics.minimumTouchSize, height: controlMetrics.minimumTouchSize, alignItems: "center", justifyContent: "center" },
    empty: {
      color: colors.muted,
      fontSize: 11,
      textAlign: "center",
      paddingVertical: 8,
    },
    basisNote: { color: colors.subtle, fontSize: 9, fontStyle: "italic" },
  });

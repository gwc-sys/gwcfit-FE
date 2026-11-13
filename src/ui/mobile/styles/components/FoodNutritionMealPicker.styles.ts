import { controlMetrics } from "../../theme/theme";
import { StyleSheet } from "react-native";
import type { ThemeColors } from "../../theme/theme";

export const stylesShared = StyleSheet.create({
  macro: {
    minWidth: 110,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  dot: { width: 9, height: 9, borderRadius: 5 },
  macroLabel: { color: "#F2F2F7", fontSize: 13, fontWeight: "700" },
  macroValue: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "700",
      marginTop: 2
    },
});

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { gap: 16, padding: 0, borderWidth: 0, backgroundColor: "transparent" },
    headingRow: { gap: 12, alignItems: "stretch" },
    headingCopy: { gap: 2 },
    title: { color: colors.ink, fontSize: 22, lineHeight: 28, fontWeight: "600", letterSpacing: -0.4 },
    subtitle: { color: colors.muted, fontSize: 13, lineHeight: 19 },
    generateButton: { minHeight: 44, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, paddingHorizontal: 16, backgroundColor: colors.primary, alignSelf: "flex-start" },
    generateText: {
      color: "#FFFFFF",
      fontSize: 12,
      fontWeight: "700"
    },
    summary: { flexDirection: "row", flexWrap: "wrap", gap: 16, padding: 18, borderRadius: 18, backgroundColor: colors.surface },
    searchBox: { minHeight: 48, flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 12, paddingHorizontal: 14, backgroundColor: colors.surface },
    searchInput: { flex: 1, minWidth: 0, color: colors.ink, fontSize: 16 },
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
      backgroundColor: "rgba(0, 0, 0,0.78)",
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
    foodGrid: { flexDirection: "row", flexWrap: "wrap", columnGap: "2%", rowGap: 12 },
    foodCard: { width: "32%", minHeight: 150, padding: 8, paddingTop: 14, alignItems: "center", borderRadius: 16, backgroundColor: colors.surface },
    foodTitleRow: { flexDirection: "row", alignItems: "flex-start", gap: 7 },
    foodName: { color: colors.ink, fontSize: 13, lineHeight: 18, fontWeight: "600", textAlign: "center", flex: 1, paddingTop: 6, alignSelf: "stretch" },
    addButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
    calories: { color: colors.ink, fontSize: 18, fontWeight: "600" },
    macros: { color: colors.muted, fontSize: 12, lineHeight: 18 },
    tags: { color: colors.muted, fontSize: 12, lineHeight: 18 },
    benefit: { color: colors.muted, fontSize: 12, lineHeight: 18 },
    resultNote: { color: colors.muted, fontSize: 12, lineHeight: 18 },
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
    selectedRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8, padding: 14, borderRadius: 14, backgroundColor: colors.surfaceElevated },
    selectedCopy: { width: "100%", gap: 3 },
    selectedName: { color: colors.ink, fontSize: 16, fontWeight: "600" },
    selectedMeta: { color: colors.muted, fontSize: 13 },
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
    empty: { color: colors.muted, fontSize: 14, lineHeight: 20, paddingVertical: 12 },
    basisNote: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  });

export const createBasketStyles = (colors: ThemeColors) => StyleSheet.create({
  browserLayout: { gap: 20, alignItems: "stretch" },
  catalog: { flex: 1, minWidth: 0, gap: 16 },
  basket: { flexShrink: 0, alignSelf: "stretch", padding: 16, gap: 12, borderRadius: 16, backgroundColor: colors.surface },
  basketHeading: { flexDirection: "row", alignItems: "center", gap: 10 },
  basketTitle: { color: colors.ink, fontSize: 20, lineHeight: 26, fontWeight: "600" },
  basketCount: { color: colors.primary, fontSize: 14, fontWeight: "600" },
});

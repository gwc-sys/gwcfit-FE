import { adaptPageStyles } from "../adaptPageStyles";
import { StyleSheet } from "react-native";
import { controlMetrics } from "../../theme/theme";
import type { ThemeColors } from "../../theme/theme";

const navigationStyles = (colors: ThemeColors, bottomInset: number) => adaptPageStyles(StyleSheet.create({
  tabBar: {
    height: 56 + Math.max(bottomInset, 8),
    paddingTop: 8,
    paddingBottom: Math.max(bottomInset, 8),
    backgroundColor: colors.background === "#0B1119" ? colors.background : colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    elevation: 0,
  },
  tabBarItem: { minHeight: controlMetrics.minimumTouchSize, paddingVertical: 2 },
  tabLabel: { fontSize: 11, fontWeight: "600", letterSpacing: 0 },
  activeTab: { width: 38, height: 30, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: "transparent" },
  memberTabItem: { minHeight: controlMetrics.minimumTouchSize, paddingVertical: 2 },
  memberTabLabel: { fontSize: 11, fontWeight: "600" },
  centerTabLabel: { fontSize: 11, fontWeight: "600" },
  memberActiveTab: { width: 38, height: 30, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: "transparent" },
  centerWorkoutTab: { width: 38, height: 30, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: "transparent" },
}));

export const createStyles = (colors: ThemeColors, _width: number, bottomInset: number) => navigationStyles(colors, bottomInset);

export const createMemberTabStyles = (colors: ThemeColors, _width: number, bottomInset: number) => {
  const base = navigationStyles(colors, bottomInset);
  return { ...base, tabBar: { ...base.tabBar, backgroundColor: colors.background === "#0B1119" ? "#0D1723" : colors.surface, borderColor: colors.background === "#0B1119" ? "#24374B" : colors.border }, memberTabLabel: { ...base.memberTabLabel, fontWeight: "500" as const }, centerTabLabel: { ...base.centerTabLabel, fontWeight: "500" as const } };
};

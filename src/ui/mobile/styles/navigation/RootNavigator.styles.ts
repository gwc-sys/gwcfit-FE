import { adaptPageStyles } from "../adaptPageStyles";
import { StyleSheet } from "react-native";
import { controlMetrics } from "../../theme/theme";
import type { ThemeColors } from "../../theme/theme";

const navigationStyles = (colors: ThemeColors, bottomInset: number) => adaptPageStyles(StyleSheet.create({
  tabBar: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: Math.max(bottomInset, 12),
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.separator,
    paddingTop: 6,
    paddingBottom: 6,
    elevation: 10,
    shadowColor: "#000000",
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  tabBarItem: { minHeight: controlMetrics.minimumTouchSize, paddingVertical: 2, paddingHorizontal: 0 },
  tabLabel: { fontSize: 10, fontWeight: "600", letterSpacing: -0.2, marginTop: 2, textAlign: "center" },
  activeTab: { width: 38, height: 30, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: "transparent" },
  memberTabItem: { minHeight: controlMetrics.minimumTouchSize, paddingVertical: 2 },
  memberTabLabel: { fontSize: 11, fontWeight: "600" },
  centerTabLabel: { fontSize: 11, fontWeight: "600" },
  memberActiveTab: { width: 38, height: 30, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: colors.primarySoft },
  centerWorkoutTab: { width: 38, height: 30, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: colors.primarySoft },
}));

export const createStyles = (colors: ThemeColors, width: number, bottomInset: number) => {
  const base = navigationStyles(colors, bottomInset);
  const compact = width > 0 && width < 360;
  return {
    ...base,
    tabLabel: { ...base.tabLabel, fontSize: 10 },
  };
};

export const createMemberTabStyles = (colors: ThemeColors, width: number, bottomInset: number) => {
  const base = navigationStyles(colors, bottomInset);
  const compact = width > 0 && width < 360;
  const labelSize = compact ? 9.5 : 10.5;
  return {
    ...base,
    tabBar: {
      ...base.tabBar,
      backgroundColor: colors.surface,
      borderColor: colors.separator,
    },
    memberTabLabel: { ...base.memberTabLabel, fontSize: labelSize, fontWeight: "600" as const },
    centerTabLabel: { ...base.centerTabLabel, fontSize: labelSize, fontWeight: "600" as const },
  };
};

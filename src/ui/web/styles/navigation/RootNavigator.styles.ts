import { StyleSheet } from "react-native";
import type { ThemeColors } from "../../theme/theme";

const navigationStyles = (colors: ThemeColors, bottomInset: number) => StyleSheet.create({
  tabBar: {
    height: 64,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    elevation: 0,
  },
  tabBarItem: { minHeight: 44, paddingVertical: 2 },
  tabLabel: { fontSize: 11, fontWeight: "600", letterSpacing: 0 },
  activeTab: { width: 38, height: 30, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: colors.primarySoft },
  memberTabItem: { minHeight: 44, paddingVertical: 2 },
  memberTabLabel: { fontSize: 11, fontWeight: "600" },
  centerTabLabel: { fontSize: 11, fontWeight: "600" },
  memberActiveTab: { width: 38, height: 30, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: colors.primarySoft },
  centerWorkoutTab: { width: 38, height: 30, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: colors.primarySoft },
});

export const createStyles = (colors: ThemeColors, _width: number, bottomInset: number) => navigationStyles(colors, bottomInset);

export const createMemberTabStyles = (colors: ThemeColors, _width: number, bottomInset: number) => navigationStyles(colors, bottomInset);

import { Platform } from "react-native";
import {
  BASE_COLORS,
  ALPHA,
  pulseFitColors,
  palette,
  colors,
  lightColors,
  lightThemeColors,
  darkThemeColors,
  getThemeColors,
  type AppColorScheme,
  type AppThemeMode,
  type ThemeColors,
} from "../../../theme/colors";

export {
  BASE_COLORS,
  ALPHA,
  pulseFitColors,
  palette,
  colors,
  lightColors,
  lightThemeColors,
  darkThemeColors,
  getThemeColors,
  type AppColorScheme,
  type AppThemeMode,
  type ThemeColors,
};

export const controlMetrics = {
  minimumTouchSize: Platform.OS === "android" ? 48 : 44,
  inputHeight: 54,
  focusBorderWidth: 2,
  iconSize: 22
} as const;

export const spacing = {
  // canonical names (legacy compatibility with existing code)
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,

  // extended scale
  '32': 32,
  '40': 40,
  '48': 48,
  '64': 64,

  // explicit s-prefixed names
  s4: 4,
  s8: 8,
  s12: 12,
  s16: 16,
  s20: 20,
  s24: 24,
  s32: 32,
  s40: 40,
  s48: 48,
  s64: 64
};

export const radii = {
  sm: 10,
  md: 12,
  lg: 16,
  xl: 20,
  card: 20, // card
  container: 24, // large container
  pill: 999
};

export const font = {
  regular: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  medium: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  bold: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
};

export const semanticTypography = {
  pageTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700" as const
  },
  sectionHeading: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "600" as const
  },
  cardHeading: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "600" as const
  },
  body: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "400" as const
  },
  buttonLabel: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "600" as const
  },
  secondaryText: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "400" as const
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "400" as const
  },
  dashboardMetric: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "700" as const,
    fontVariant: ["tabular-nums"] as ("tabular-nums")[]
  }
} as const;

export const typography = {
  // primary headings
  title: {
    fontSize: 32,
    lineHeight: 39,
    fontWeight: "700" as const
  },
  h1: {
    fontSize: 32,
    lineHeight: 39,
    fontWeight: "700" as const
  },
  h2: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "600" as const
  },
  h3: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "600" as const
  },
  cardNumber: {
    fontSize: 36,
    lineHeight: 44,
    fontWeight: "700" as const
  },
  cardTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "600" as const
  },
  body: {
    fontSize: 17,
    lineHeight: 25,
    fontWeight: "400" as const
  },
  small: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "400" as const
  }
};

export const shadows = {
  soft:
    Platform.OS === "web"
      ? { boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }
      : {
          shadowColor: "#000000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 2
        },
  card:
    Platform.OS === "web"
      ? { boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }
      : {
          shadowColor: "#000000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 6,
          elevation: 1
        },
  button:
    Platform.OS === "web"
      ? { boxShadow: "none" }
      : {
          shadowColor: "#000000",
          shadowOpacity: 0,
          shadowRadius: 0,
          elevation: 0
        },
  subtle:
    Platform.OS === "web"
      ? { boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }
      : {
          shadowColor: "#000000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.06,
          shadowRadius: 2,
          elevation: 1
        },
  none: Platform.OS === "web" ? { boxShadow: "none" } : { shadowOpacity: 0, elevation: 0 }
};

export const layout = {
  screenPadding: 32,
  compactScreenPadding: 16,
  phoneScreenPadding: 24,
  bottomBarHeight: 84,
  floatingTabBarOffset: 120,
  maxReadableWidth: 1100,
  maxFormWidth: 680,
  maxDashboardWidth: 1400
};

export const breakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1024
};

export const contentWidths = {
  dashboard: layout.maxDashboardWidth,
  screen: layout.maxReadableWidth
};

export function getResponsiveScreenPadding(width: number) {
  if (width < breakpoints.tablet) return layout.phoneScreenPadding;
  return layout.screenPadding;
}

export type ScreenContentWidth = keyof typeof contentWidths | number | "none";

export function resolveContentMaxWidth(width: number, maxWidth: ScreenContentWidth = "dashboard") {
  if (maxWidth === "none" || width < breakpoints.tablet) return undefined;
  if (typeof maxWidth === "number") return maxWidth;
  return contentWidths[maxWidth];
}

export function getResponsiveColumns(width: number, maxColumns = 3) {
  if (width < 768) return 1;
  if (width < 1024) return Math.min(2, maxColumns);
  return maxColumns;
}

export function getResponsiveScale(width: number) {
  if (width < 360) return 0.94;
  if (width < 768) return 0.98;
  if (width < 1024) return 1.02;
  return 1.04;
}

export function getResponsiveSpacing(width: number, base: number) {
  return Math.round(base * getResponsiveScale(width));
}

export function getResponsiveFontSize(width: number, base: number, compact?: number, wide?: number) {
  if (width < 360 && compact) return compact;
  if (width >= 1024 && wide) return wide;
  return base;
}

export function getResponsiveBottomInset(width: number, bottomInset: number) {
  const compact = width < 360;
  const baseTabHeight = compact ? 76 : 88;
  const platformOffset = Platform.OS === "web" ? 18 : Math.max(14, bottomInset + 12);
  return baseTabHeight + platformOffset + spacing.md;
}

export type FloatingTabBarVariant = "main" | "member";

export type FloatingTabBarMetrics = {
  activeSize: number;
  bottom: number;
  centerSize: number;
  compact: boolean;
  height: number;
  left: number;
  width: number;
};

export function getFloatingTabBarMetrics(
  width: number,
  bottomInset: number,
  variant: FloatingTabBarVariant = "main"
): FloatingTabBarMetrics {
  const viewportWidth = Math.max(width, 0);
  const compact = viewportWidth < 380;
  const horizontalGutter = viewportWidth < 320 ? spacing.sm : compact ? spacing.md : spacing.lg;
  const maxWidth = variant === "member" ? 760 : 1120;
  const availableWidth = Math.max(0, viewportWidth - horizontalGutter * 2);
  const tabBarWidth = Math.min(availableWidth, maxWidth);
  const bottom = Platform.OS === "web" ? (compact ? 14 : 18) : Math.max(12, bottomInset + (compact ? 8 : 12));
  const height = variant === "member" ? (compact ? 78 : 88) : compact ? 72 : layout.bottomBarHeight;

  return {
    activeSize: compact ? 42 : 50,
    bottom,
    centerSize: compact ? 56 : 64,
    compact,
    height,
    left: Math.max(horizontalGutter, Math.round((viewportWidth - tabBarWidth) / 2)),
    width: tabBarWidth
  };
}

export const radius = radii;

export const type = {
  hero: 36,
  h1: typography.h1.fontSize,
  h2: typography.h2.fontSize,
  h3: typography.h3.fontSize,
  body: typography.body.fontSize,
  small: typography.small.fontSize
};

export default {};




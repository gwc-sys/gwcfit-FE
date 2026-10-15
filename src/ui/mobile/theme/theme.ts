import { Platform } from "react-native";

export type AppColorScheme = "light" | "dark";

export type AppThemeMode = AppColorScheme | "system";

export const controlMetrics = {
  minimumTouchSize: Platform.OS === "android" ? 48 : 44,
  inputHeight: 54,
  focusBorderWidth: 2,
  iconSize: 22
} as const;

export const palette = {
  // Semantic system colors. Keep the compatibility names below so existing
  // feature screens inherit the redesign without changing their data flows.
  primary: "#1677FF",
  success: "#34C759",
  warning: "#FF9500",
  danger: "#FF3B30",

  // Backwards-compatible palette tokens used by existing components
  blue: "#1677FF",
  blueDark: "#0066CC",
  blueSoft: "rgba(0,122,255,0.14)",
  teal: "#0D9488",
  tealDark: "#0F766E",
  tealSoft: "rgba(13,148,136,0.18)",
  green: "#16A34A",
  greenDark: "#15803D",
  greenSoft: "rgba(22,163,74,0.18)",
  coral: "#E11D48",
  coralSoft: "rgba(225,29,72,0.16)",
  amber: "#D97706",
  amberSoft: "rgba(217,119,6,0.16)",
  indigo: "#4F46E5",
  indigoSoft: "rgba(79,70,229,0.18)",

  // Dark theme tokens
  darkBackground: "#000000",
  darkSurface: "#17212D",
  darkCard: "#1D2936",
  darkCardBorder: "#263241",

  // Light theme tokens
  lightBackground: "#F2F2F7",
  lightSurface: "#FFFFFF",
  lightBorder: "#E5EAF2",

  // Text
  textLight: "#F5F7FA",
  textSecondaryLight: "#9BAABD",
  textMutedLight: "#8E8E93",

  textDark: "#111318",
  textSecondaryDark: "#5E6C82",
  textMutedDark: "#8E8E93",

  // Convenience
  black: "#000000",
  dark: "#000000",
  border: "#E5EAF2",
  muted: "#5E6C82",
  subtle: "#8E8E93",
  text: "#111318",
  white: "#FFFFFF"
};

export const spacing = {
  // canonical names (legacy compatibility with existing code)
  xs: 4,
  sm: 8,
  md: 16,
  lg: 22,
  xl: 26,
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
  md: 16,
  lg: 22,
  xl: 26,
  card: 16, // grouped mobile surfaces
  container: 20, // large container
  pill: 999
};

export const font = {
  regular: Platform.select({ ios: "System", android: "System" }),
  medium: Platform.select({ ios: "System", android: "System" }),
  bold: Platform.select({ ios: "System", android: "System" })
};

export const typography = {
  // primary headings
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700" as const
  },
  h1: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700" as const
  },
  h2: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "600" as const
  },
  h3: {
    fontSize: 18,
    lineHeight: 24,
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
      ? { boxShadow: "0 12px 40px rgba(0,0,0,0.10)" }
      : {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.1,
          shadowRadius: 20,
          elevation: 4
        },
  card:
    Platform.OS === "web"
      ? { boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }
      : {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 2
        },
  button:
    Platform.OS === "web"
      ? { boxShadow: "0 4px 12px rgba(0,122,255,0.18)" }
      : {
          shadowColor: "#1677FF",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.18,
          shadowRadius: 10,
          elevation: 3
        },
  subtle:
    Platform.OS === "web"
      ? { boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }
      : {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.06,
          shadowRadius: 2,
          elevation: 1
        },
  none: Platform.OS === "web" ? { boxShadow: "none" } : { shadowOpacity: 0, elevation: 0 }
};

export const layout = {
  screenPadding: 24,
  compactScreenPadding: 16,
  phoneScreenPadding: 20,
  bottomBarHeight: 60,
  floatingTabBarOffset: 120,
  maxReadableWidth: 1100,
  maxFormWidth: 680,
  maxDashboardWidth: 1040
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
  if (width < 360 && compact !== undefined) return compact;
  if (width >= 1024 && wide !== undefined) return wide;
  // Modest viewport scaling supplements native Dynamic Type; it never replaces it.
  const scale = width < 390 ? Math.max(0.96, width / 390) : Math.min(1.12, 1 + (width - 390) / 5000);
  return Math.round(base * scale * 10) / 10;
}

export function getResponsiveBottomInset(width: number, bottomInset: number) {
  return Math.max(24, bottomInset + 16);
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

export const colors = {
  // Dark theme
  primary: "#318DFF",
  primaryButton: "#0066CC",
  accent: "#1677FF",
  success: "#30D158",
  info: "#64D2FF",
  warning: "#FF9F0A",
  danger: "#FF453A",
  dangerButton: "#C9342A",
  background: "#0B1119",
  surface: "#17212D",
  card: "#17212D",
  border: "#263241",
  white: "#FFFFFF",
  ink: "#F5F7FA",
  inkSoft: "#D1D1D6",
  textPrimary: "#F5F7FA",
  textSecondary: "#9BAABD",
  textMuted: "#8E8E93",
  primaryDark: "#64D2FF",
  dark: "#000000",

  // Compat keys used across the codebase
  muted: "#9BAABD",
  subtle: "#8E8E93",
  surfaceElevated: "#1D2936",
  surfaceMuted: "#1D2936",
  surfaceStrong: "#3A3A3C",
  borderMuted: "#263241",

  // Soft variants for semantic colors
  dangerSoft: "rgba(255,69,58,0.16)",
  successSoft: "rgba(48,209,88,0.16)",
  infoSoft: "rgba(100,210,255,0.16)",
  warningSoft: "rgba(255,159,10,0.16)",
  primarySoft: "rgba(10,132,255,0.18)",
  accentSoft: "rgba(10,132,255,0.12)",

  // Light fallbacks (used when theme switches)
  lightBackground: "#F2F2F7",
  lightSurface: "#FFFFFF",
  lightBorder: "#E5EAF2",
  // additional compatibility
  darkCard: "#17212D",
  darkCardBorder: "#263241",
  text: "#FFFFFF"
};

export const lightColors = {
  primary: "#0066CC",
  primaryButton: "#0066CC",
  accent: "#1677FF",
  info: "#0066CC",
  success: "#1E7835",
  warning: "#8A5100",
  danger: "#C9342A",
  dangerButton: "#C9342A",
  background: "#F2F2F7",
  surface: "#FFFFFF",
  card: "#FFFFFF",
  border: "#E5EAF2",
  textPrimary: "#111318",
  textSecondary: "#5E6C82",
  textMuted: "#5E6C82",

  // Compatibility keys
  white: "#FFFFFF",
  ink: "#111318",
  inkSoft: "#3A3A3C",
  muted: "#5E6C82",
  subtle: "#5E6C82",
  surfaceElevated: "#F8FAFD",
  surfaceMuted: "#F2F2F7",
  surfaceStrong: "#E5E5EA",
  borderMuted: "rgba(60,60,67,0.08)",

  // Soft semantic variants
  dangerSoft: "rgba(255,59,48,0.10)",
  successSoft: "rgba(52,199,89,0.10)",
  warningSoft: "rgba(255,149,0,0.10)",
  infoSoft: "rgba(90,200,250,0.12)",
  primarySoft: "rgba(0,122,255,0.12)",
  accentSoft: "rgba(0,122,255,0.08)",
  // compatibility
  text: "#111318",
  primaryDark: "#0066CC",
  dark: "#000000",
  darkCard: "#FFFFFF",
  darkCardBorder: "rgba(2,6,23,0.04)"
};

export function getThemeColors(colorScheme: AppColorScheme) {
  return colorScheme === "dark" ? colors : lightColors;
}

export type ThemeColors = ReturnType<typeof getThemeColors>;

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

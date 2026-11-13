/**
 * PulseFit Single Authoritative Color System
 * 
 * APPROVED BASE PALETTE (Only 8 literal base hues):
 * - Light background: #F2F2F7
 * - Light surface:    #FFFFFF
 * - Dark background:  #000000
 * - Dark surface:     #1C1C1E
 * - PulseFit accent:  #E91E63
 * - Link blue:        #007AFF
 * - Success:          #34C759
 * - Destructive:      #FF3B30
 */

export const BASE_COLORS = {
  lightBackground: "#F2F2F7",
  lightSurface: "#FFFFFF",
  darkBackground: "#000000",
  darkSurface: "#1C1C1E",
  accent: "#E91E63",
  link: "#007AFF",
  linkBlue: "#007AFF",
  success: "#34C759",
  destructive: "#FF3B30",
} as const;

export type BaseColorKey = keyof typeof BASE_COLORS;

/**
 * Centrally defined transparency policy:
 * All alpha variations derive strictly from the eight approved base hues.
 * Scatter no rogue RGBA literals across screen files.
 */
export const ALPHA = {
  // Separators & borders
  separatorLight: "rgba(0, 0, 0, 0.12)",
  separatorDark: "rgba(255, 255, 255, 0.16)",
  borderSubtleLight: "rgba(0, 0, 0, 0.08)",
  borderSubtleDark: "rgba(255, 255, 255, 0.12)",
  black08: "rgba(0, 0, 0, 0.08)",

  // Overlays & backdrops
  backdropLight: "rgba(0, 0, 0, 0.40)",
  backdropDark: "rgba(0, 0, 0, 0.72)",
  white32: "rgba(255, 255, 255, 0.32)",

  // Focus ring
  focusRing: "rgba(0, 122, 255, 0.35)",

  // Disabled states
  disabledTextLight: "rgba(28, 28, 30, 0.38)",
  disabledTextDark: "rgba(242, 242, 247, 0.55)",
  disabledSurfaceLight: "rgba(0, 0, 0, 0.05)",
  disabledSurfaceDark: "rgba(255, 255, 255, 0.10)",

  // Soft tinted accents / status backgrounds
  primarySoft: "rgba(233, 30, 99, 0.12)",
  primarySoftActive: "rgba(233, 30, 99, 0.20)",
  accent10: "rgba(233, 30, 99, 0.10)",
  accent12: "rgba(233, 30, 99, 0.12)",
  linkSoft: "rgba(0, 122, 255, 0.12)",
  link12: "rgba(0, 122, 255, 0.12)",
  successSoft: "rgba(52, 199, 89, 0.12)",
  success12: "rgba(52, 199, 89, 0.12)",
  dangerSoft: "rgba(255, 59, 48, 0.12)",
  danger12: "rgba(255, 59, 48, 0.12)",

  // Neutral soft surfaces
  neutralSoftLight: "rgba(0, 0, 0, 0.06)",
  neutralSoftDark: "rgba(255, 255, 255, 0.10)",

  // Shadows derived strictly from approved black
  shadowSubtle: "rgba(0, 0, 0, 0.05)",
  shadowSoft: "rgba(0, 0, 0, 0.08)",
  shadowMedium: "rgba(0, 0, 0, 0.16)",
  shadowHeavy: "rgba(0, 0, 0, 0.50)",
} as const;

export type AppColorScheme = "light" | "dark";
export type AppThemeMode = AppColorScheme | "system";

/**
 * LIGHT MODE SEMANTIC TOKENS
 */
export const lightThemeColors = {
  // Canonical semantic tokens (Section 2)
  background: BASE_COLORS.lightBackground, // #F2F2F7
  surface: BASE_COLORS.lightSurface,       // #FFFFFF
  textPrimary: BASE_COLORS.darkBackground, // #000000
  secondaryText: BASE_COLORS.darkSurface,  // #1C1C1E
  textSecondary: BASE_COLORS.darkSurface,  // #1C1C1E
  primary: BASE_COLORS.accent,             // #E91E63
  link: BASE_COLORS.link,                  // #007AFF
  success: BASE_COLORS.success,            // #34C759
  danger: BASE_COLORS.destructive,         // #FF3B30
  destructive: BASE_COLORS.destructive,    // #FF3B30
  separator: ALPHA.separatorLight,
  backdrop: ALPHA.backdropLight,
  focusRing: BASE_COLORS.link,
  disabledText: ALPHA.disabledTextLight,
  textDisabled: ALPHA.disabledTextLight,
  disabledSurface: ALPHA.disabledSurfaceLight,
  disabled: ALPHA.disabledSurfaceLight,
  selected: ALPHA.primarySoft,
  textOnPrimary: BASE_COLORS.lightSurface, // #FFFFFF

  // Structural & component aliases
  card: BASE_COLORS.lightSurface,
  cardBackground: BASE_COLORS.lightSurface,
  pageBackground: BASE_COLORS.lightBackground,
  text: BASE_COLORS.darkBackground,
  ink: BASE_COLORS.darkBackground,
  inkSoft: BASE_COLORS.darkSurface,
  textTertiary: BASE_COLORS.darkSurface,
  textMuted: BASE_COLORS.darkSurface,
  muted: BASE_COLORS.darkSurface,
  subtle: BASE_COLORS.darkSurface,
  accent: BASE_COLORS.accent,
  accentSoft: ALPHA.primarySoft,
  primaryButton: BASE_COLORS.accent,
  buttonPrimary: BASE_COLORS.accent,
  buttonSecondary: BASE_COLORS.lightBackground,
  buttonDisabled: ALPHA.disabledSurfaceLight,
  buttonPressed: BASE_COLORS.accent,
  info: BASE_COLORS.link,
  warning: BASE_COLORS.darkSurface, // Approved neutral styling for warning/pending
  error: BASE_COLORS.destructive,
  dangerButton: BASE_COLORS.destructive,
  border: ALPHA.separatorLight,
  borderSubtle: ALPHA.borderSubtleLight,
  borderMuted: ALPHA.borderSubtleLight,
  divider: ALPHA.separatorLight,
  surfaceElevated: BASE_COLORS.lightSurface,
  surfaceSecondary: BASE_COLORS.lightBackground,
  surfaceMuted: BASE_COLORS.lightBackground,
  surfaceStrong: BASE_COLORS.lightBackground,
  elevatedSurface: BASE_COLORS.lightSurface,
  sidebarBackground: BASE_COLORS.lightSurface,
  navigationBackground: BASE_COLORS.lightBackground,
  inputBackground: BASE_COLORS.lightSurface,
  inputBorder: ALPHA.separatorLight,
  placeholder: ALPHA.disabledTextLight,
  textPlaceholder: ALPHA.disabledTextLight,
  overlay: ALPHA.backdropLight,
  shadow: ALPHA.shadowSoft,
  shadowColor: BASE_COLORS.darkBackground,
  iconPrimary: BASE_COLORS.darkBackground,
  iconSecondary: BASE_COLORS.darkSurface,
  white: BASE_COLORS.lightSurface,
  black: BASE_COLORS.darkBackground,
  dark: BASE_COLORS.darkBackground,
  chartGrid: ALPHA.separatorLight,
  chartText: BASE_COLORS.darkSurface,

  // Soft semantic variants
  primarySoft: ALPHA.primarySoft,
  linkSoft: ALPHA.linkSoft,
  successSoft: ALPHA.successSoft,
  dangerSoft: ALPHA.dangerSoft,
  infoSoft: ALPHA.linkSoft,
  warningSoft: ALPHA.neutralSoftLight,

  // Squircle icon tints
  blueSquircleBg: ALPHA.linkSoft,
  blueSquircleColor: BASE_COLORS.link,
  purpleSquircleBg: ALPHA.primarySoft,
  purpleSquircleColor: BASE_COLORS.accent,
  greenSquircleBg: ALPHA.successSoft,
  greenSquircleColor: BASE_COLORS.success,
  redSquircleBg: ALPHA.dangerSoft,
  redSquircleColor: BASE_COLORS.destructive,
  violetSquircleBg: ALPHA.linkSoft,
  violetSquircleColor: BASE_COLORS.link,
  graySquircleBg: ALPHA.neutralSoftLight,
  graySquircleColor: BASE_COLORS.darkSurface,
  orangeSquircleBg: ALPHA.primarySoft,
  orangeSquircleColor: BASE_COLORS.accent,

  // Badges & buttons
  ownerBadgeBg: ALPHA.primarySoft,
  ownerBadgeText: BASE_COLORS.accent,
  verifiedBadgeBg: ALPHA.successSoft,
  verifiedBadgeText: BASE_COLORS.success,
  editBtnBg: ALPHA.linkSoft,
  editBtnText: BASE_COLORS.link,
  logoutBtnBg: ALPHA.dangerSoft,
  logoutBtnText: BASE_COLORS.destructive,

  // Backward compatibility tokens
  primaryDark: BASE_COLORS.accent,
  darkCard: BASE_COLORS.lightSurface,
  darkCardBorder: ALPHA.separatorLight,
  lightBackground: BASE_COLORS.lightBackground,
  lightSurface: BASE_COLORS.lightSurface,
  lightBorder: ALPHA.separatorLight,
} as const;

/**
 * DARK MODE SEMANTIC TOKENS
 */
export const darkThemeColors = {
  // Canonical semantic tokens (Section 2)
  background: BASE_COLORS.darkBackground, // #000000
  surface: BASE_COLORS.darkSurface,       // #1C1C1E
  textPrimary: BASE_COLORS.lightSurface,  // #FFFFFF
  secondaryText: BASE_COLORS.lightBackground, // #F2F2F7
  textSecondary: BASE_COLORS.lightBackground, // #F2F2F7
  primary: BASE_COLORS.accent,            // #E91E63
  link: BASE_COLORS.link,                 // #007AFF
  success: BASE_COLORS.success,           // #34C759
  danger: BASE_COLORS.destructive,        // #FF3B30
  destructive: BASE_COLORS.destructive,   // #FF3B30
  separator: ALPHA.separatorDark,
  backdrop: ALPHA.backdropDark,
  focusRing: BASE_COLORS.link,
  disabledText: ALPHA.disabledTextDark,
  textDisabled: ALPHA.disabledTextDark,
  disabledSurface: ALPHA.disabledSurfaceDark,
  disabled: ALPHA.disabledSurfaceDark,
  selected: ALPHA.primarySoft,
  textOnPrimary: BASE_COLORS.lightSurface, // #FFFFFF

  // Structural & component aliases
  card: BASE_COLORS.darkSurface,
  cardBackground: BASE_COLORS.darkSurface,
  pageBackground: BASE_COLORS.darkBackground,
  text: BASE_COLORS.lightSurface,
  ink: BASE_COLORS.lightSurface,
  inkSoft: BASE_COLORS.lightBackground,
  textTertiary: BASE_COLORS.lightBackground,
  textMuted: BASE_COLORS.lightBackground,
  muted: BASE_COLORS.lightBackground,
  subtle: BASE_COLORS.lightBackground,
  accent: BASE_COLORS.accent,
  accentSoft: ALPHA.primarySoft,
  primaryButton: BASE_COLORS.accent,
  buttonPrimary: BASE_COLORS.accent,
  buttonSecondary: "rgba(255, 255, 255, 0.08)",
  buttonDisabled: ALPHA.disabledSurfaceDark,
  buttonPressed: BASE_COLORS.accent,
  info: BASE_COLORS.link,
  warning: BASE_COLORS.lightBackground, // Approved neutral styling for warning/pending
  error: BASE_COLORS.destructive,
  dangerButton: BASE_COLORS.destructive,
  border: ALPHA.separatorDark,
  borderSubtle: ALPHA.borderSubtleDark,
  borderMuted: ALPHA.borderSubtleDark,
  divider: ALPHA.separatorDark,
  surfaceElevated: BASE_COLORS.darkSurface,
  surfaceSecondary: BASE_COLORS.darkSurface,
  surfaceMuted: BASE_COLORS.darkSurface,
  surfaceStrong: BASE_COLORS.darkSurface,
  elevatedSurface: BASE_COLORS.darkSurface,
  sidebarBackground: BASE_COLORS.darkSurface,
  navigationBackground: BASE_COLORS.darkBackground,
  inputBackground: BASE_COLORS.darkSurface,
  inputBorder: ALPHA.separatorDark,
  placeholder: ALPHA.disabledTextDark,
  textPlaceholder: ALPHA.disabledTextDark,
  overlay: ALPHA.backdropDark,
  shadow: ALPHA.shadowHeavy,
  shadowColor: BASE_COLORS.darkBackground,
  iconPrimary: BASE_COLORS.lightSurface,
  iconSecondary: BASE_COLORS.lightBackground,
  white: BASE_COLORS.lightSurface,
  black: BASE_COLORS.darkBackground,
  dark: BASE_COLORS.darkBackground,
  chartGrid: ALPHA.separatorDark,
  chartText: BASE_COLORS.lightBackground,

  // Soft semantic variants
  primarySoft: ALPHA.primarySoft,
  linkSoft: ALPHA.linkSoft,
  successSoft: ALPHA.successSoft,
  dangerSoft: ALPHA.dangerSoft,
  infoSoft: ALPHA.linkSoft,
  warningSoft: ALPHA.neutralSoftDark,

  // Squircle icon tints
  blueSquircleBg: ALPHA.linkSoft,
  blueSquircleColor: BASE_COLORS.link,
  purpleSquircleBg: ALPHA.primarySoft,
  purpleSquircleColor: BASE_COLORS.accent,
  greenSquircleBg: ALPHA.successSoft,
  greenSquircleColor: BASE_COLORS.success,
  redSquircleBg: ALPHA.dangerSoft,
  redSquircleColor: BASE_COLORS.destructive,
  violetSquircleBg: ALPHA.linkSoft,
  violetSquircleColor: BASE_COLORS.link,
  graySquircleBg: ALPHA.neutralSoftDark,
  graySquircleColor: BASE_COLORS.lightBackground,
  orangeSquircleBg: ALPHA.primarySoft,
  orangeSquircleColor: BASE_COLORS.accent,

  // Badges & buttons
  ownerBadgeBg: ALPHA.primarySoft,
  ownerBadgeText: BASE_COLORS.accent,
  verifiedBadgeBg: ALPHA.successSoft,
  verifiedBadgeText: BASE_COLORS.success,
  editBtnBg: ALPHA.linkSoft,
  editBtnText: BASE_COLORS.link,
  logoutBtnBg: ALPHA.dangerSoft,
  logoutBtnText: BASE_COLORS.destructive,

  // Backward compatibility tokens
  primaryDark: BASE_COLORS.accent,
  darkCard: BASE_COLORS.darkSurface,
  darkCardBorder: ALPHA.separatorDark,
  lightBackground: BASE_COLORS.lightBackground,
  lightSurface: BASE_COLORS.lightSurface,
  lightBorder: ALPHA.separatorLight,
} as const;

export function getThemeColors(colorScheme: AppColorScheme) {
  return colorScheme === "dark" ? darkThemeColors : lightThemeColors;
}

export type ThemeColors = {
  [K in keyof typeof darkThemeColors]: string;
};

// Default exports for dark and light
export const colors = darkThemeColors;
export const lightColors = lightThemeColors;

export const pulseFitColors = {
  light: {
    background: BASE_COLORS.lightBackground,
    surface: BASE_COLORS.lightSurface,
  },
  dark: {
    background: BASE_COLORS.darkBackground,
    surface: BASE_COLORS.darkSurface,
  },
  brand: {
    primary: BASE_COLORS.accent,
    link: BASE_COLORS.link,
  },
  status: {
    success: BASE_COLORS.success,
    destructive: BASE_COLORS.destructive,
  },
} as const;

export const palette = {
  primary: BASE_COLORS.accent,
  success: BASE_COLORS.success,
  warning: BASE_COLORS.darkSurface,
  danger: BASE_COLORS.destructive,
  link: BASE_COLORS.link,

  blue: BASE_COLORS.link,
  blueDark: BASE_COLORS.link,
  blueSoft: ALPHA.linkSoft,
  teal: BASE_COLORS.link,
  tealDark: BASE_COLORS.link,
  tealSoft: ALPHA.linkSoft,
  green: BASE_COLORS.success,
  greenDark: BASE_COLORS.success,
  greenSoft: ALPHA.successSoft,
  coral: BASE_COLORS.destructive,
  coralSoft: ALPHA.dangerSoft,
  amber: BASE_COLORS.darkSurface,
  amberSoft: ALPHA.neutralSoftDark,
  indigo: BASE_COLORS.link,
  indigoSoft: ALPHA.linkSoft,

  darkBackground: BASE_COLORS.darkBackground,
  darkSurface: BASE_COLORS.darkSurface,
  darkCard: BASE_COLORS.darkSurface,
  darkCardBorder: ALPHA.separatorDark,

  lightBackground: BASE_COLORS.lightBackground,
  lightSurface: BASE_COLORS.lightSurface,
  lightBorder: ALPHA.separatorLight,

  textLight: BASE_COLORS.lightSurface,
  textSecondaryLight: BASE_COLORS.lightBackground,
  textMutedLight: BASE_COLORS.lightBackground,

  textDark: BASE_COLORS.darkBackground,
  textSecondaryDark: BASE_COLORS.darkSurface,
  textMutedDark: BASE_COLORS.darkSurface,

  black: BASE_COLORS.darkBackground,
  dark: BASE_COLORS.darkBackground,
  border: ALPHA.separatorLight,
  muted: BASE_COLORS.darkSurface,
  subtle: BASE_COLORS.darkSurface,
  text: BASE_COLORS.darkBackground,
  white: BASE_COLORS.lightSurface,
} as const;

/**
 * Adapter helper for Web Member views to eliminate private `const C` maps
 * and support active theme (light/dark) with zero off-palette colors.
 */
export function getMemberC(colors: ThemeColors) {
  return {
    bg: colors.background,
    card: colors.surface,
    cardSubtle: colors.surfaceElevated,
    cardBorder: colors.separator,
    cardBorderActive: colors.primary,
    cardHover: colors.surfaceElevated,
    headerBg: colors.surface,
    headerBorder: colors.separator,
    primary: colors.primary,
    primaryGradient: [colors.primary, colors.primary] as const,
    primaryOrange: colors.primary,
    orange: colors.primary,
    blue: colors.link,
    cyan: colors.link,
    cyanBg: colors.linkSoft,
    cyanBorder: colors.separator,
    teal: colors.link,
    green: colors.success,
    greenBg: colors.successSoft,
    greenBorder: colors.separator,
    purple: colors.primary,
    purpleBg: colors.primarySoft,
    purpleBorder: colors.separator,
    red: colors.danger,
    redBg: colors.dangerSoft,
    redBorder: colors.separator,
    amber: colors.textPrimary,
    amberBg: colors.disabledSurface,
    amberBorder: colors.separator,
    gold: colors.primary,
    goldDark: colors.primary,
    yellow: colors.textPrimary,
    muted: colors.textSecondary,
    mutedDark: colors.textSecondary,
    white: colors.white,
    ink: colors.ink,
    inkSoft: colors.inkSoft,
    navActiveBg: colors.primarySoft,
    pillBg: colors.surface,
    pillBorder: colors.separator,
    scannerBg: colors.surface,
    trackBg: colors.disabledSurface,
    trainerBadgeBg: colors.primarySoft,
    trainerBadgeBorder: colors.separator,
  };
}

export default {
  BASE_COLORS,
  ALPHA,
  lightThemeColors,
  darkThemeColors,
  colors,
  lightColors,
  getThemeColors,
  pulseFitColors,
  palette,
};

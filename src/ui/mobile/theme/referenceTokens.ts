import { BASE_COLORS, ALPHA } from "../../../theme/colors";

// Canonical PulseFit accents strictly derived from approved 8-color palette
export const pulseAccents = {
  blue: BASE_COLORS.link,
  green: BASE_COLORS.success,
  purple: BASE_COLORS.link,
  orange: BASE_COLORS.accent,
  pink: BASE_COLORS.accent,
} as const;

export const pulseGradients = {
  members: [BASE_COLORS.accent, BASE_COLORS.accent] as const,
  selection: [BASE_COLORS.accent, BASE_COLORS.accent] as const,
} as const;

export const pulseEffects = {
  scrim: ALPHA.backdropLight,
  heroIcon: "rgba(255,255,255,0.15)",
} as const;

export const pulseScreenGradients = {
  light: [BASE_COLORS.lightBackground, BASE_COLORS.lightBackground] as const,
  dark: [BASE_COLORS.darkBackground, BASE_COLORS.darkBackground] as const,
} as const;

export const pulseDarkAccents = {
  blue: BASE_COLORS.link,
  green: BASE_COLORS.success,
  purple: BASE_COLORS.link,
  orange: BASE_COLORS.accent,
  pink: BASE_COLORS.accent,
} as const;

export const pulseLayout = {
  gutter: 20,
  gap: 12,
  radius: 16,
  title: 28,
  rowHeight: 68,
  operationHeight: 124,
} as const;

// Decorative colors match the reference. Text uses the accessible semantic
// foregrounds in theme.ts rather than low-contrast decorative colors.
export const pulseAccents = {
  blue: "#0A84FF",
  green: "#34C759",
  purple: "#5856D6",
  orange: "#FF9500",
  pink: "#FF453A",
} as const;

export const pulseGradients = {
  members: ["#007AFF", "#0A84FF"] as const,
  selection: ["#0A84FF", "#0A84FF"] as const,
} as const;

export const pulseEffects = {
  scrim: "rgba(0,0,0,0.4)",
  heroIcon: "rgba(255,255,255,0.15)",
} as const;

export const pulseScreenGradients = {
  light: ["#F2F2F7", "#F2F2F7"] as const,
  dark: ["#000000", "#000000"] as const,
} as const;

export const pulseDarkAccents = {
  ...pulseAccents,
  green: "#30D158",
  purple: "#5E5CE6",
  orange: "#FF9F0A",
  pink: "#FF453A",
} as const;

export const pulseLayout = {
  gutter: 20,
  gap: 12,
  radius: 16,
  title: 28,
  rowHeight: 68,
  operationHeight: 124,
} as const;

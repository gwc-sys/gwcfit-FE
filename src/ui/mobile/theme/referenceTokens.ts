// Decorative colors match the reference. Text uses the accessible semantic
// foregrounds in theme.ts rather than low-contrast decorative colors.
export const pulseAccents = {
  blue: "#1677FF",
  green: "#14B86A",
  purple: "#7847FF",
  orange: "#FF9500",
  pink: "#FF453A",
} as const;

export const pulseGradients = {
  members: ["#0875FF", "#258BFF"] as const,
  selection: ["#459AFF", "#1677FF"] as const,
} as const;

export const pulseEffects = {
  scrim: "rgba(0,0,0,0.4)",
  heroIcon: "rgba(255,255,255,0.15)",
} as const;

export const pulseScreenGradients = {
  light: ["#FFFFFF", "#F3F7FF"] as const,
  dark: ["#0B1119", "#09121A"] as const,
} as const;

export const pulseDarkAccents = {
  ...pulseAccents,
  green: "#24D783",
  purple: "#9164FF",
  orange: "#FF9F0A",
  pink: "#FF5A66",
} as const;

export const pulseLayout = {
  gutter: 20,
  gap: 12,
  radius: 16,
  title: 28,
  rowHeight: 68,
  operationHeight: 124,
} as const;

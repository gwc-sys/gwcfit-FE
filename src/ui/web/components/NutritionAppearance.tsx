import { useMemo } from "react";
import type { ReactNode } from "react";
import { AppThemeColorScope, useAppTheme } from "../../../theme/AppThemeProvider";
import type { AppColorScheme, ThemeColors } from "../theme/theme";

/** The mobile nutrition palette, scoped to the web plan editor. */
export function nutritionColors(base: ThemeColors, scheme: AppColorScheme): ThemeColors & { dangerButton: string } {
  return scheme === "dark" ? {
    ...base,
    dangerButton: "#C9342A",
    primaryButton: "#0A84FF",
    background: "#000000",
    surface: "#1C1C1E",
    card: "#1C1C1E",
    border: "#38383A",
    borderMuted: "#38383A",
    muted: "#A1A1A8",
    textSecondary: "#A1A1A8",
    darkCardBorder: "#38383A",
  } : {
    ...base,
    dangerButton: "#C9342A",
    accent: "#007AFF",
    background: "#F2F2F7",
    border: "#E5E5EA",
    ink: "#1C1C1E",
    text: "#1C1C1E",
    textPrimary: "#1C1C1E",
    muted: "#6C6C70",
    subtle: "#6C6C70",
    textSecondary: "#6C6C70",
    textMuted: "#6C6C70",
    success: "#1E7835",
  };
}

export function NutritionAppearance({ children }: { children: (colors: ThemeColors) => ReactNode }) {
  const { colors: base, colorScheme } = useAppTheme();
  const colors = useMemo(() => nutritionColors(base, colorScheme), [base, colorScheme]);
  return <AppThemeColorScope colors={colors}>{children(colors)}</AppThemeColorScope>;
}

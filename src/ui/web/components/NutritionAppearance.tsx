import { useMemo } from "react";
import type { ReactNode } from "react";
import { AppThemeColorScope, useAppTheme } from "../../../theme/AppThemeProvider";
import type { AppColorScheme, ThemeColors } from "../theme/theme";

/** The mobile nutrition palette, scoped to the web plan editor. */
export function nutritionColors(base: ThemeColors, scheme: AppColorScheme): ThemeColors & { dangerButton: string } {
  return scheme === "dark" ? {
    ...base,
    dangerButton: "#FF3B30",
    primaryButton: "#E91E63",
    background: "#000000",
    surface: "#1C1C1E",
    card: "#1C1C1E",
    border: "#1C1C1E",
    borderMuted: "#1C1C1E",
    muted: "#F2F2F7",
    textSecondary: "#F2F2F7",
    darkCardBorder: "#1C1C1E",
  } : {
    ...base,
    dangerButton: "#FF3B30",
    accent: "#E91E63",
    background: "#F2F2F7",
    border: "#F2F2F7",
    ink: "#000000",
    text: "#000000",
    textPrimary: "#000000",
    muted: "#F2F2F7",
    subtle: "#F2F2F7",
    textSecondary: "#F2F2F7",
    textMuted: "#F2F2F7",
    success: "#34C759",
  };
}

export function NutritionAppearance({ children }: { children: (colors: ThemeColors) => ReactNode }) {
  const { colors: base, colorScheme } = useAppTheme();
  const colors = useMemo(() => nutritionColors(base, colorScheme), [base, colorScheme]);
  return <AppThemeColorScope colors={colors as any}>{children(colors as any)}</AppThemeColorScope>;
}

import type { CSSProperties, ReactNode } from "react";
import { useAppTheme } from "../../../theme/AppThemeProvider";
import "../styles/web.css";

export function PresentationRoot({ children }: { children: ReactNode }) {
  const { colors, colorScheme } = useAppTheme();
  const theme: CSSProperties & Record<`--${string}`, string> = {
    colorScheme,
    "--pulse-bg": colors.background,
    "--pulse-surface": colors.surface,
    "--pulse-text": colors.ink,
    "--pulse-muted": colors.muted,
    "--pulse-border": colors.border,
    "--pulse-primary": colors.primary,
    "--pulse-danger": colors.danger,
    "--pulse-success": colors.success,
    "--pulse-warning": colors.warning,
  };
  return <div data-pulse-ui="web" style={theme}>{children}</div>;
}

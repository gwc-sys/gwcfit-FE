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
    "--pulse-muted": colors.textSecondary,
    "--pulse-border": colors.border,
    "--pulse-primary": colors.primary,
    "--pulse-danger": colors.danger,
    "--pulse-success": colors.success,
    "--pulse-warning": colors.warning,
    "--bg": colors.background,
    "--surface": colors.surface,
    "--card": colors.card,
    "--card-strong": colors.surface,
    "--border": colors.border,
    "--text-primary": colors.ink,
    "--text-secondary": colors.textSecondary,
    "--text-muted": colors.textMuted,
    "--primary": colors.primary,
    "--blue": colors.link,
    "--cyan": colors.link,
    "--success": colors.success,
    "--warning": colors.warning,
  };
  return <div data-pulse-ui="web" data-theme={colorScheme} style={theme}>{children}</div>;
}

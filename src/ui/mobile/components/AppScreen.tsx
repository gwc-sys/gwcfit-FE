import type { ReactNode } from "react";
import { useAppTheme } from "../../../theme/AppThemeProvider";
import type { ScreenContentWidth } from "../theme/theme";
import { Screen } from "./Screen";

type AppScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  keyboard?: boolean;
  backgroundColor?: string;
  maxWidth?: ScreenContentWidth;
};

// Keep the established public props while sharing one native implementation for
// safe areas, scrolling and keyboard avoidance.
export function AppScreen({ children, scroll = true, padded = true, keyboard = false, backgroundColor, maxWidth = "dashboard" }: AppScreenProps) {
  const { colors } = useAppTheme();
  return <Screen scroll={scroll} noPadding={!padded} keyboard={keyboard} maxWidth={maxWidth} style={{ backgroundColor: backgroundColor ?? colors.background }}>{children}</Screen>;
}

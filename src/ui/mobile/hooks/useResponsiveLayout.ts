import { useWindowDimensions, Platform } from "react-native";

export interface ResponsiveLayoutMetrics {
  width: number;
  height: number;
  fontScale: number;
  isSmallPhone: boolean;       // width < 360 (compact Android / narrow viewports)
  isStandardPhone: boolean;    // 360 <= width < 390 (iPhone SE 2020 at 375, standard Android)
  isLargePhone: boolean;       // width >= 390 && width < 600 (iPhone 15 at 393, Plus/Max at 430, large Android at 412+)
  isTablet: boolean;           // width >= 600 (iPads, Android tablets, foldables unfolded)
  isShortScreen: boolean;      // height < 700 (iPhone SE 2020 at 667, landscape, split-screen)
  isLargeFont: boolean;        // system fontScale > 1.15 (Dynamic Type / Accessibility)
  gutter: number;              // 12 on small, 16 on standard/large, 24 on tablet
  cardGap: number;             // 8 on small, 10-12 on standard/large, 16 on tablet
  minTouchSize: number;        // 44pt on iOS, 48dp on Android
  getGridColumns: (dense?: boolean) => number;
  getCardWidth: (columns: 1 | 2 | 3 | 4, customGap?: number, customGutter?: number) => number;
}

/**
 * Shared responsive layout hook for PulseFit Mobile UI.
 * Enforces Apple HIG and Android Adaptive design principles:
 * - Adapts to available width, height, and font scale via useWindowDimensions.
 * - Never makes decisions based on hardcoded device model strings.
 * - Below 360 layout units: stacks dense metrics/actions in 1 column when space is constrained.
 * - 360 to 389 layout units: selective 2-column or wrapping layouts.
 * - 390 to 599 layout units: 2-column or 3-column cards when content fits.
 * - 600+ layout units: Tablet presentation with multi-column grid layouts.
 * - Automatically accounts for accessibility font scaling (> 1.15).
 */
export function useResponsiveLayout(): ResponsiveLayoutMetrics {
  const { width, height, fontScale = 1 } = useWindowDimensions();

  const isSmallPhone = width < 360;
  const isStandardPhone = width >= 360 && width < 390;
  const isLargePhone = width >= 390 && width < 600;
  const isTablet = width >= 600;
  const isShortScreen = height < 700;
  const isLargeFont = fontScale > 1.15;

  const gutter = isTablet ? 24 : isSmallPhone ? 12 : 16;
  const cardGap = isTablet ? 16 : isSmallPhone ? 8 : 12;
  const minTouchSize = Platform.OS === "android" ? 48 : 44;

  const getGridColumns = (dense = false): number => {
    if (isTablet) return dense ? 4 : 3;
    if (isLargeFont) return 1;
    if (isSmallPhone && !dense) return 1;
    return 2;
  };

  const getCardWidth = (
    columns: 1 | 2 | 3 | 4,
    customGap: number = cardGap,
    customGutter: number = gutter
  ): number => {
    const totalGutter = customGutter * 2;
    const availableWidth = Math.max(0, width - totalGutter);
    if (columns <= 1) return availableWidth;
    const totalGaps = customGap * (columns - 1);
    return Math.floor((availableWidth - totalGaps) / columns);
  };

  return {
    width,
    height,
    fontScale,
    isSmallPhone,
    isStandardPhone,
    isLargePhone,
    isTablet,
    isShortScreen,
    isLargeFont,
    gutter,
    cardGap,
    minTouchSize,
    getGridColumns,
    getCardWidth,
  };
}


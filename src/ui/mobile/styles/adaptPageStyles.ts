import type { ImageStyle, TextStyle, ViewStyle } from "react-native";

export function adaptPageStyles<T extends Record<string, ViewStyle | TextStyle | ImageStyle>>(styles: T): T {
  const result = { ...styles };
  for (const key of Object.keys(styles) as Array<keyof T>) {
    const style: any = { ...styles[key] };
    const styleName = String(key);
    const isFunctionalStroke = /focus|error|invalid|selected|active|ring|chart|progress|track|avatar/i.test(styleName);

    // PulseFit uses tonal elevation instead of one-pixel container outlines.
    // Preserve functional strokes (focus, validation, selection and data
    // visualisation), but remove decorative hairlines without changing layout.
    if (!isFunctionalStroke) {
      if (typeof style.borderWidth === "number" && style.borderWidth <= 1.25) style.borderWidth = 0;
      if (typeof style.borderTopWidth === "number" && style.borderTopWidth <= 1.25) style.borderTopWidth = 0;
      if (typeof style.borderRightWidth === "number" && style.borderRightWidth <= 1.25) style.borderRightWidth = 0;
      if (typeof style.borderBottomWidth === "number" && style.borderBottomWidth <= 1.25) style.borderBottomWidth = 0;
      if (typeof style.borderLeftWidth === "number" && style.borderLeftWidth <= 1.25) style.borderLeftWidth = 0;
    }
    if (typeof style.minWidth === "number" && style.minWidth >= 200) {
      style.minWidth = 0;
      style.flexBasis = "100%";
    }
    if (typeof style.width === "number" && style.width > 200) {
      style.maxWidth = style.width;
      style.width = "100%";
    }
    if (/header|actions/i.test(styleName) && style.flexDirection === "row") {
      style.flexWrap = "wrap";
    }
    result[key] = style as T[keyof T];
  }
  return result;
}

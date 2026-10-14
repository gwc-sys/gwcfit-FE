import type { ImageStyle, TextStyle, ViewStyle } from "react-native";

export function adaptPageStyles<T extends Record<string, ViewStyle | TextStyle | ImageStyle>>(styles: T): T {
  const result = { ...styles };
  for (const key of Object.keys(styles) as Array<keyof T>) {
    const style = { ...styles[key] };
    if (typeof style.minWidth === "number" && style.minWidth >= 280) {
      style.minWidth = 0;
      style.flexBasis = "100%";
    }
    if (typeof style.width === "number" && style.width > 280) {
      style.maxWidth = style.width;
      style.width = "100%";
    }
    if (/header|actions/i.test(String(key)) && style.flexDirection === "row") {
      style.flexWrap = "wrap";
    }
    result[key] = style as T[keyof T];
  }
  return result;
}

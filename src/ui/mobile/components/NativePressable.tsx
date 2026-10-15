import { createElement } from "react";
import type { ComponentPropsWithRef } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { Platform, StyleSheet, Pressable as ReactNativePressable } from "react-native";

/**
 * Native screens use StyleSheet styles, including Pressable's state callback.
 * The installed CSS interop flattens that callback into an empty style object.
 * NativeWind rewrites BOTH JSX and React.createElement, so the supported
 * cssInterop opt-out is essential even at this boundary. Its runtime removes
 * the flag before forwarding the original callback to React Native.
 */
export function Pressable(props: ComponentPropsWithRef<typeof ReactNativePressable>) {
  const minimum = Platform.OS === "android" ? 48 : 44;
  const fitTarget = (style: StyleProp<ViewStyle>) => {
    const flat = StyleSheet.flatten(style) ?? {};
    return [style, {
      minWidth: Math.max(minimum, typeof flat.minWidth === "number" ? flat.minWidth : 0),
      minHeight: Math.max(minimum, typeof flat.minHeight === "number" ? flat.minHeight : 0, typeof flat.height === "number" ? flat.height : 0),
      // Let labels grow with Dynamic Type instead of clipping inside fixed heights.
      ...(typeof flat.height === "number" ? { height: undefined } : {}),
    }];
  };
  const style = props.style;
  return createElement(ReactNativePressable, { ...props, style: typeof style === "function" ? state => fitTarget(style(state)) : fitTarget(style), cssInterop: false });
}

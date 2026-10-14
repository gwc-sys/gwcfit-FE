import type * as React from "react";
import { SplashScreenView } from "./SplashScreen.presentation";
import { styles } from "./SplashScreen.styles";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radius, spacing, typography } from "../../theme/theme";

export function useSplashScreenPresentation() {
  return { kind: "view1" as const, props: { styles } };
}

export function SplashScreen(...args: Parameters<typeof useSplashScreenPresentation>): React.JSX.Element {
  return <SplashScreenView model={useSplashScreenPresentation(...args)} />;
}



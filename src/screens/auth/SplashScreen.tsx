import type * as React from "react";
import { useEffect, useRef } from "react";
import { SplashScreenView } from "./SplashScreen.presentation";
import { styles } from "./SplashScreen.styles";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radius, spacing, typography } from "../../theme/theme";

type SplashScreenProps = {
  onSkip?: () => void;
};

export function useSplashScreenPresentation({
  onSkip,
}: SplashScreenProps = {}) {
  const onSkipRef = useRef(onSkip);
  onSkipRef.current = onSkip;

  useEffect(() => {
    // Generous fallback timeout so user has time to interact with all 3 steps
    const timeout = setTimeout(() => onSkipRef.current?.(), 180000);
    return () => clearTimeout(timeout);
  }, []);

  return { kind: "view1" as const, props: { styles, onSkip } };
}

export function SplashScreen(
  ...args: Parameters<typeof useSplashScreenPresentation>
): React.JSX.Element {
  return <SplashScreenView model={useSplashScreenPresentation(...args)} />;
}

import type * as React from "react";
import { OnboardingScreenView } from "./OnboardingScreen.presentation";
import { styles } from "./OnboardingScreen.styles";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PrimaryButton } from "../../components/PrimaryButton";
import { onboardingSlides } from "../../data/onboarding";
import type { RootStackParamList } from "../../navigation/types";
import { colors, radius, spacing, typography } from "../../theme/theme";

type Props = NativeStackScreenProps<RootStackParamList, "Onboarding">;

export function useOnboardingScreenPresentation({ navigation }: Props) {
  const [index, setIndex] = useState(0);
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  const slide = onboardingSlides[index];
  const last = index === onboardingSlides.length - 1;
  const compact = width < 360 || height < 700;

  const goNext = () => {
    if (last) {
      navigation.replace("SignUp");
      return;
    }
    setIndex((current) => current + 1);
  };

  return { kind: "view1" as const, props: { slide, styles, compact, insets, navigation, index, last, goNext } };
}

export function OnboardingScreen(...args: Parameters<typeof useOnboardingScreenPresentation>): React.JSX.Element {
  return <OnboardingScreenView model={useOnboardingScreenPresentation(...args)} />;
}



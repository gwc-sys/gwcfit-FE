import { useState } from "react";
import { ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { PrimaryButton } from "../components/PrimaryButton";
import { onboardingSlides } from "../data/onboarding";
import type { RootStackParamList } from "../navigation/types";
import { palette, radii, spacing, type } from "../theme/theme";

type Props = NativeStackScreenProps<RootStackParamList, "Onboarding">;

export function OnboardingScreen({ navigation }: Props) {
  const [index, setIndex] = useState(0);
  const slide = onboardingSlides[index];
  const isLast = index === onboardingSlides.length - 1;

  const next = () => {
    if (isLast) {
      navigation.replace("Login");
      return;
    }
    setIndex((current) => current + 1);
  };

  return (
    <ImageBackground source={slide.image} style={styles.root} resizeMode="cover">
      <LinearGradient colors={["rgba(5,7,10,0.18)", "rgba(5,7,10,0.95)"]} style={styles.overlay}>
        <Pressable onPress={() => navigation.replace("Login")} style={styles.skip}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
        <View style={styles.copy}>
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.body}>{slide.body}</Text>
          <View style={styles.dots}>
            {onboardingSlides.map((item, dotIndex) => (
              <View
                key={item.id}
                style={[styles.dot, dotIndex === index && styles.activeDot]}
              />
            ))}
          </View>
          <PrimaryButton label={isLast ? "Get Started" : "Next"} onPress={next} />
          {isLast ? (
            <Pressable onPress={() => navigation.navigate("Login")} style={styles.signIn}>
              <Text style={styles.signInText}>
                Already have an account? <Text style={styles.signInLink}>Sign In</Text>
              </Text>
            </Pressable>
          ) : null}
        </View>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.black
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 24,
    paddingBottom: 52
  },
  skip: {
    position: "absolute",
    top: 64,
    right: 28,
    padding: spacing.sm
  },
  skipText: {
    color: palette.green,
    fontSize: type.h3,
    fontWeight: "800"
  },
  copy: {
    gap: spacing.lg
  },
  title: {
    color: palette.white,
    fontSize: 38,
    fontWeight: "900",
    textAlign: "center",
    lineHeight: 48
  },
  body: {
    color: "#D6DAE2",
    fontSize: 18,
    lineHeight: 29,
    textAlign: "center"
  },
  dots: {
    flexDirection: "row",
    alignSelf: "center",
    gap: 9,
    marginVertical: 8
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: radii.pill,
    backgroundColor: "#4C5565"
  },
  activeDot: {
    width: 18,
    backgroundColor: palette.green
  },
  signIn: {
    alignItems: "center"
  },
  signInText: {
    color: "#C3C8D1",
    fontSize: type.body,
    fontWeight: "700"
  },
  signInLink: {
    color: palette.green
  }
});

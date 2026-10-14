import { LinearGradient } from "expo-linear-gradient";
import { ImageBackground, Pressable, Text, View } from "react-native";
import { PrimaryButton } from "../../components/PrimaryButton";
import { onboardingSlides } from "../../../../data/onboarding";
import { colors, spacing } from "../../theme/theme";
import type * as React from "react";
import type { useOnboardingScreenPresentation } from "../../../../screens/auth/OnboardingScreen";

export function OnboardingScreenView({ model }: { model: ReturnType<typeof useOnboardingScreenPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { slide, styles, compact, insets, navigation, index, last, goNext } = model.props;
      return ((
    <ImageBackground source={slide.image} resizeMode="cover" style={styles.background}>
      <LinearGradient
        colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.36)", "rgba(0,0,0,0.96)"]}
        locations={[0, 0.46, 1]}
        style={[
          styles.overlay,
          compact && styles.overlayCompact,
          {
            paddingTop: Math.max(compact ? spacing.lg : spacing.xxl, insets.top + spacing.md),
            paddingBottom: Math.max(compact ? spacing.md : spacing.xl, insets.bottom + spacing.md)
          }
        ]}
      >
        <Pressable accessibilityRole="button" onPress={() => navigation.replace("Login")} style={styles.skip}>
          <Text maxFontSizeMultiplier={1.15} style={styles.skipText}>Skip</Text>
        </Pressable>

        <View style={[styles.content, compact && styles.contentCompact]}>
          <View style={styles.heroCard}>
            <Text adjustsFontSizeToFit maxFontSizeMultiplier={1.15} numberOfLines={3} style={[styles.title, compact && styles.titleCompact]}>{slide.title}</Text>
            <Text maxFontSizeMultiplier={1.15} style={[styles.body, compact && styles.bodyCompact]}>{slide.body}</Text>
          </View>
          <View style={styles.dots}>
            {onboardingSlides.map((item, dotIndex) => (
              <View
                key={item.id}
                style={[styles.dot, dotIndex === index && styles.activeDot]}
              />
            ))}
          </View>
          <PrimaryButton title={last ? "Create Account" : "Next"} onPress={goNext} />
          <Pressable accessibilityRole="button" onPress={() => navigation.navigate("Login")} style={styles.signIn}>
            <Text maxFontSizeMultiplier={1.15} style={styles.signInText}>Already training? Sign in</Text>
          </Pressable>
        </View>
      </LinearGradient>
    </ImageBackground>
  ));
    }
  }
}

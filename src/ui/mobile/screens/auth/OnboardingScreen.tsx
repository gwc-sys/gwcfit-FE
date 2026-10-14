import { Image, Pressable, Text, View } from "react-native";
import { useMemo } from "react";
import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { onboardingSlides } from "../../../../data/onboarding";
import { useAppTheme } from "../../../../theme/AppThemeProvider";
import { createStyles } from "../../styles/screens/auth/OnboardingScreen.styles";
import type * as React from "react";
import type { useOnboardingScreenPresentation } from "../../../../screens/auth/OnboardingScreen";

export function OnboardingScreenView({ model }: { model: ReturnType<typeof useOnboardingScreenPresentation> }): React.ReactNode {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { slide, navigation, index, last, goNext } = model.props;
      return (
        <Screen scroll contentContainerStyle={styles.overlay}>
          <View style={styles.topRow}>
            <View accessible accessibilityLabel={`Introduction, page ${index + 1} of ${onboardingSlides.length}`} style={styles.dots}>
              {onboardingSlides.map((item, dotIndex) => <View key={item.id} style={[styles.dot, dotIndex === index && styles.activeDot]} />)}
            </View>
            <Pressable accessibilityRole="button" onPress={() => navigation.replace("Login")} style={({ pressed }) => [styles.skip, pressed && styles.pressed]}>
              <Text style={styles.skipText}>Skip</Text>
            </Pressable>
          </View>
          <View style={styles.heroImageFrame}>
            <Image accessible={false} source={slide.image} resizeMode="cover" style={styles.heroImage} />
          </View>
          <View style={styles.content}>
            <Text accessibilityRole="header" style={styles.title}>{slide.title}</Text>
            <Text style={styles.body}>{slide.body}</Text>
            <PrimaryButton title={last ? "Create Account" : "Next"} onPress={goNext} />
            <Pressable accessibilityRole="button" onPress={() => navigation.navigate("Login")} style={styles.signIn}>
              <Text style={styles.signInText}>Already training? Sign in</Text>
            </Pressable>
          </View>
        </Screen>
      );
    }
  }
}

import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { AppLogo } from "../components/AppLogo";
import { useAppTheme } from "../theme/AppThemeProvider";
import { spacing, type } from "../theme/theme";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Splash">;

export function SplashScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  const scale = useRef(new Animated.Value(0.88)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6 }),
      Animated.timing(opacity, { toValue: 1, duration: 550, useNativeDriver: true })
    ]).start();

    const timeout = setTimeout(() => navigation.replace("Onboarding"), 1500);
    return () => clearTimeout(timeout);
  }, [navigation, opacity, scale]);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Animated.View style={[styles.logo, { opacity, transform: [{ scale }] }]}>
        <AppLogo size={112} chromeless />
      </Animated.View>
      <View style={styles.bottom}>
        <Text style={[styles.brand, { color: colors.textPrimary }]}>
          Pulse<Text style={{ color: colors.primary }}>Fit</Text>
        </Text>
        <Text style={[styles.tagline, { color: colors.textSecondary }]}>Towards optimal health with every step</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl
  },
  logo: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  bottom: {
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: 56
  },
  brand: {
    fontSize: type.h3,
    fontWeight: "900"
  },
  tagline: {
    fontSize: type.body,
    opacity: 0.9
  }
});

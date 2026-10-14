import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../../theme/theme";
import type * as React from "react";
import type { useSplashScreenPresentation } from "../../../../screens/auth/SplashScreen";

export function SplashScreenView({ model }: { model: ReturnType<typeof useSplashScreenPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles } = model.props;
      return ((
    <LinearGradient colors={["#1E3A8A", "#6366F1", "#0B1120"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.container}>
      <View style={styles.glow} />
      <View style={styles.mark}>
        <Ionicons name="barbell" size={46} color={colors.white} />
      </View>
      <Text style={styles.title}>PulseFit</Text>
      <Text style={styles.subtitle}>A polished, premium fitness command center.</Text>
      <View style={styles.pill}>
        <Text style={styles.pillText}>Live insights • Instant check-ins</Text>
      </View>
    </LinearGradient>
  ));
    }
  }
}

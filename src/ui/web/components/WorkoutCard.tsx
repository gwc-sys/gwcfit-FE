import { useMemo } from "react";
import { ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Dumbbell, Sparkles } from "./icons";
import type { WorkoutPlan } from "../../../types/fitness";
import { useAppTheme } from "../../../theme/AppThemeProvider";
import { radius, shadows, spacing, typography } from "../theme/theme";
import type { ThemeColors } from "../theme/theme";
import { PrimaryButton } from "./PrimaryButton";

type WorkoutCardProps = {
  plan: WorkoutPlan;
  onPress?: () => void;
};

export function WorkoutCard({ plan, onPress }: WorkoutCardProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}>
      <ImageBackground source={plan.heroImage} style={styles.image} imageStyle={styles.imageRadius}>
        <LinearGradient colors={["rgba(5,7,10,0.18)", "rgba(5,7,10,0.86)"]} style={styles.overlay}>
          <View style={styles.badge}>
            <Sparkles size={15} color={colors.info} />
            <Text style={styles.badgeText}>AI Fit</Text>
          </View>
          <Text style={styles.title}>{plan.title}</Text>
          <View style={styles.metaRow}>
            <Dumbbell size={16} color={colors.white} />
            <Text style={styles.meta}>
              {plan.durationWeeks} week - {plan.sessionsPerWeek}x/week
            </Text>
          </View>
          <PrimaryButton label="Start now" style={styles.button} />
        </LinearGradient>
      </ImageBackground>
    </Pressable>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    wrap: {
      width: 320,
      height: 190,
      borderRadius: radius.lg,
      overflow: "hidden",
      backgroundColor: colors.dark,
      ...shadows.card
    },
    image: {
      flex: 1
    },
    imageRadius: {
      borderRadius: radius.lg
    },
    overlay: {
      flex: 1,
      padding: spacing.lg,
      justifyContent: "flex-end"
    },
    badge: {
      position: "absolute",
      top: 16,
      left: 16,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: radius.pill,
      backgroundColor: colors.white,
      flexDirection: "row",
      alignItems: "center",
      gap: 6
    },
    badgeText: {
      color: colors.dark,
      fontWeight: "800"
    },
    title: {
      color: colors.white,
      ...typography.h3,
      fontWeight: "900",
      marginBottom: 8
    },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 14
    },
    meta: {
      color: colors.white,
      ...typography.body,
      fontWeight: "600"
    },
    button: {
      width: 148,
      minHeight: 48,
      borderRadius: radius.sm,
      ...shadows.none
    },
    pressed: {
      opacity: 0.9,
      transform: [{ scale: 0.99 }]
    }
  });

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { AppHeader } from "../../components/AppHeader";
import { Pill } from "../../components/Pill";
import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { StatusBadge } from "../../components/StatusBadge";
import { SurfacePanel } from "../../components/SurfacePanel";
import { useFitnessStore } from "../../store/useFitnessStore";
import { colors, radius, shadows, spacing, typography } from "../../theme/theme";
import type { ExperienceLevel, FitnessGoal, GeneratorPreferences, WorkoutGender } from "../../types/fitness";

const goals: FitnessGoal[] = ["Build Muscle", "Lose Fat", "Endurance"];
const levels: ExperienceLevel[] = ["Beginner", "Intermediate", "Expert"];
const focusAreas = ["Upper Body", "Full Body", "Core", "Mobility"];
const sessionLengths = [35, 45, 60];

export function AIWorkoutGeneratorScreen() {
  const navigation = useNavigation<any>();
  const generateWorkoutPlan = useFitnessStore((state) => state.generatePlan);
  const [goal, setGoal] = useState(goals[0]);
  const [level, setLevel] = useState(levels[1]);
  const [focus, setFocus] = useState(focusAreas[0]);
  const [days, setDays] = useState(4);
  const [sessionMinutes, setSessionMinutes] = useState(45);
  const [loading, setLoading] = useState(false);
  const [gender] = useState<WorkoutGender>("Male");

  const generatePlan = async () => {
    setLoading(true);
    const preferences: GeneratorPreferences = {
      gender,
      goal,
      level,
      daysPerWeek: days,
      sessionMinutes,
      equipment: [focus]
    };
    const plan = await generateWorkoutPlan(preferences);
    setLoading(false);
    navigation.navigate("WorkoutPlan", { planId: plan.id });
  };

  return (
    <Screen scroll contentContainerStyle={styles.screen}>
      <AppHeader title="AI Workout" subtitle="Plan builder" rightIcon="options-outline" />

      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons name="sparkles" size={26} color={colors.white} />
        </View>
        <View style={styles.heroCopy}>
          <StatusBadge label={`${days} days/week`} tone="success" />
          <Text style={styles.heroTitle}>{focus} plan for {goal.toLowerCase()}</Text>
          <Text style={styles.heroText}>{level} level, {sessionMinutes} minutes per session.</Text>
        </View>
      </View>

      <SurfacePanel title="Training Goal" kicker="Step 1" icon="flag-outline">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillRow}>
          {goals.map((item) => (
            <Pill key={item} label={item} selected={item === goal} onPress={() => setGoal(item)} />
          ))}
        </ScrollView>
      </SurfacePanel>

      <SurfacePanel title="Experience" kicker="Step 2" icon="trending-up-outline">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillRow}>
          {levels.map((item) => (
            <Pill key={item} label={item} selected={item === level} onPress={() => setLevel(item)} />
          ))}
        </ScrollView>
      </SurfacePanel>

      <SurfacePanel title="Schedule" kicker="Step 3" icon="calendar-outline">
        <Text style={styles.label}>Training focus</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillRow}>
          {focusAreas.map((item) => (
            <Pill key={item} label={item} selected={item === focus} onPress={() => setFocus(item)} />
          ))}
        </ScrollView>

        <Text style={styles.label}>Days per week</Text>
        <View style={styles.wrapRow}>
          {[3, 4, 5, 6].map((item) => (
            <Pill key={item} label={`${item} days`} selected={item === days} onPress={() => setDays(item)} />
          ))}
        </View>

        <Text style={styles.label}>Session length</Text>
        <View style={styles.wrapRow}>
          {sessionLengths.map((item) => (
            <Pill key={item} label={`${item} min`} selected={item === sessionMinutes} onPress={() => setSessionMinutes(item)} />
          ))}
        </View>
      </SurfacePanel>

      <View style={styles.preview}>
        <Text style={styles.previewTitle}>{focus} {goal}</Text>
        <Text style={styles.previewText}>{level} - {days}x/week - {sessionMinutes} minute sessions</Text>
        <View style={styles.previewStats}>
          <View style={styles.previewStat}>
            <Text style={styles.previewStatValue}>{days}</Text>
            <Text style={styles.previewStatLabel}>days</Text>
          </View>
          <View style={styles.previewStat}>
            <Text style={styles.previewStatValue}>{sessionMinutes}</Text>
            <Text style={styles.previewStatLabel}>minutes</Text>
          </View>
          <View style={styles.previewStat}>
            <Text style={styles.previewStatValue}>{goals.indexOf(goal) + 1}</Text>
            <Text style={styles.previewStatLabel}>goal</Text>
          </View>
        </View>
      </View>

      <PrimaryButton title="Generate Plan" icon="sparkles" loading={loading} onPress={generatePlan} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 112
  },
  hero: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.darkCard,
    ...shadows.card
  },
  heroIcon: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    backgroundColor: colors.primary
  },
  heroCopy: {
    flex: 1,
    gap: spacing.sm
  },
  heroTitle: {
    ...typography.h2,
    color: colors.white
  },
  heroText: {
    ...typography.body,
    color: "rgba(255,255,255,0.72)"
  },
  label: {
    ...typography.small,
    color: colors.muted
  },
  pillRow: {
    gap: spacing.sm,
    paddingRight: spacing.lg
  },
  wrapRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  preview: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    ...shadows.card
  },
  previewTitle: {
    ...typography.h2,
    color: colors.ink
  },
  previewText: {
    ...typography.body,
    color: colors.muted
  },
  previewStats: {
    flexDirection: "row",
    gap: spacing.sm
  },
  previewStat: {
    flex: 1,
    alignItems: "center",
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    padding: spacing.md
  },
  previewStatValue: {
    ...typography.h2,
    color: colors.ink
  },
  previewStatLabel: {
    ...typography.small,
    color: colors.muted
  }
});

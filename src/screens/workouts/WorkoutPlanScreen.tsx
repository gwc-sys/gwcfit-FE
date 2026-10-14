import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AppHeader } from "../../components/AppHeader";
import { InfoRow } from "../../components/InfoRow";
import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { exercises, workoutPlans } from "../../data/workouts";
import type { RootStackParamList } from "../../navigation/types";
import { useFitnessStore } from "../../store/useFitnessStore";
import { colors, radius, spacing, typography } from "../../theme/theme";

type Props = NativeStackScreenProps<RootStackParamList, "WorkoutPlan">;

export function WorkoutPlanScreen({ route, navigation }: Props) {
  const { plans, selectedPlanId, setSelectedPlan } = useFitnessStore();
  const planId = route.params?.planId ?? selectedPlanId;
  const plan = plans.find((item) => item.id === planId) ?? workoutPlans[0];
  const startExercise = plan.exercises[0] ?? exercises[0];

  const openExercise = (exerciseId: string) => {
    setSelectedPlan(plan.id);
    navigation.navigate("ExerciseDetail", { exerciseId });
  };

  return (
    <Screen scroll noPadding>
      <ImageBackground source={plan.heroImage} resizeMode="cover" style={styles.hero}>
        <LinearGradient colors={["rgba(0,0,0,0.08)", "rgba(0,0,0,0.86)"]} style={styles.heroOverlay}>
          <AppHeader title="" onBack={() => navigation.goBack()} rightIcon="bookmark-outline" light />
          <View>
            <Text style={styles.badge}>{plan.level}</Text>
            <Text style={styles.title}>{plan.title}</Text>
            <Text style={styles.subtitle}>{plan.summary}</Text>
          </View>
        </LinearGradient>
      </ImageBackground>

      <View style={styles.content}>
        <View style={styles.statRow}>
          <View style={styles.stat}>
            <Ionicons name="calendar-outline" size={22} color={colors.primary} />
            <Text style={styles.statValue}>{plan.durationWeeks} weeks</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="repeat-outline" size={22} color={colors.primary} />
            <Text style={styles.statValue}>{plan.sessionsPerWeek}x/week</Text>
            <Text style={styles.statLabel}>Frequency</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="flame-outline" size={22} color={colors.primary} />
            <Text style={styles.statValue}>{startExercise.calories}</Text>
            <Text style={styles.statLabel}>Kcal</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Weekly Plan</Text>
        <View style={styles.dayList}>
          {plan.exercises.map((exercise, index) => (
            <View key={exercise.id} style={styles.dayCard}>
              <View style={styles.dayHead}>
                <View style={styles.dayBadge}>
                  <Text style={styles.dayText}>Day {index + 1}</Text>
                </View>
                <View style={styles.dayCopy}>
                  <Text style={styles.dayTitle}>{exercise.focus}</Text>
                  <Text style={styles.dayMeta}>{exercise.duration} - {exercise.equipment}</Text>
                </View>
              </View>
              <InfoRow
                icon="barbell-outline"
                label={exercise.title}
                value={`${exercise.calories} kcal`}
                onPress={() => openExercise(exercise.id)}
              />
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Quick Start</Text>
        <View style={styles.quickGrid}>
          {exercises.map((exercise) => (
            <Pressable
              key={exercise.id}
              accessibilityRole="button"
              onPress={() => navigation.navigate("ExerciseDetail", { exerciseId: exercise.id })}
              style={styles.quickCard}
            >
              <Ionicons name="play-circle" size={28} color={colors.primary} />
              <Text style={styles.quickTitle}>{exercise.title}</Text>
              <Text style={styles.quickMeta}>{exercise.calories} kcal</Text>
            </Pressable>
          ))}
        </View>

        <PrimaryButton
          title="Start Workout"
          icon="play"
          onPress={() => openExercise(startExercise.id)}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    height: 380,
    backgroundColor: colors.dark
  },
  heroOverlay: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl
  },
  badge: {
    ...typography.small,
    alignSelf: "flex-start",
    color: colors.primary,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    overflow: "hidden"
  },
  title: {
    ...typography.title,
    color: colors.white,
    marginTop: spacing.md
  },
  subtitle: {
    ...typography.body,
    color: "rgba(255,255,255,0.76)",
    marginTop: spacing.xs
  },
  content: {
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    paddingTop: spacing.lg,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    marginTop: -spacing.lg
  },
  statRow: {
    flexDirection: "row",
    gap: spacing.md
  },
  stat: {
    flex: 1,
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface
  },
  statValue: {
    ...typography.body,
    color: colors.ink,
    fontWeight: "800",
    marginTop: spacing.xs
  },
  statLabel: {
    ...typography.small,
    color: colors.muted
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.ink
  },
  dayList: {
    gap: spacing.md
  },
  dayCard: {
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white
  },
  dayHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md
  },
  dayBadge: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    backgroundColor: colors.primary
  },
  dayText: {
    ...typography.small,
    color: colors.white
  },
  dayCopy: {
    flex: 1
  },
  dayTitle: {
    ...typography.h3,
    color: colors.ink
  },
  dayMeta: {
    ...typography.small,
    color: colors.muted
  },
  quickGrid: {
    flexDirection: "row",
    gap: spacing.md
  },
  quickCard: {
    flex: 1,
    minHeight: 126,
    justifyContent: "space-between",
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface
  },
  quickTitle: {
    ...typography.body,
    color: colors.ink,
    fontWeight: "800"
  },
  quickMeta: {
    ...typography.small,
    color: colors.muted
  }
});

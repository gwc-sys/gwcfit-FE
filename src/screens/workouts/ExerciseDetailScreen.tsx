import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useState } from "react";
import { ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";
import { AppHeader } from "../../components/AppHeader";
import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { exercises } from "../../data/workouts";
import type { RootStackParamList } from "../../navigation/types";
import { colors, radius, spacing, typography } from "../../theme/theme";

type Props = NativeStackScreenProps<RootStackParamList, "ExerciseDetail">;

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function ExerciseDetailScreen({ route, navigation }: Props) {
  const exercise =
    exercises.find((item) => item.id === route.params?.exerciseId) ?? exercises[0];
  const initialSeconds = useMemo(() => 45 * 60, []);
  const [seconds, setSeconds] = useState(initialSeconds);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) {
      return undefined;
    }
    const interval = setInterval(() => {
      setSeconds((current) => {
        if (current <= 1) {
          setRunning(false);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [running]);

  return (
    <Screen scroll noPadding>
      <ImageBackground source={exercise.image} resizeMode="cover" style={styles.hero}>
        <LinearGradient colors={["rgba(0,0,0,0.08)", "rgba(0,0,0,0.7)"]} style={styles.heroOverlay}>
          <AppHeader title="" onBack={() => navigation.goBack()} rightIcon="ellipsis-vertical" light />
        </LinearGradient>
      </ImageBackground>

      <View style={styles.content}>
        <Text style={styles.title}>{exercise.title}</Text>
        <Text style={styles.subtitle}>{exercise.focus}</Text>

        <View style={styles.metaRow}>
          <View style={styles.meta}>
            <Ionicons name="time-outline" size={22} color={colors.primary} />
            <Text style={styles.metaValue}>{exercise.duration}</Text>
          </View>
          <View style={styles.meta}>
            <Ionicons name="flame-outline" size={22} color={colors.primary} />
            <Text style={styles.metaValue}>{exercise.calories} kcal</Text>
          </View>
          <View style={styles.meta}>
            <Ionicons name="barbell-outline" size={22} color={colors.primary} />
            <Text style={styles.metaValue}>{exercise.equipment}</Text>
          </View>
        </View>

        <View style={styles.timerCard}>
          <Text style={styles.timerLabel}>Workout Timer</Text>
          <Text style={styles.timer}>{formatTime(seconds)}</Text>
          <View style={styles.timerActions}>
            <PrimaryButton
              title={running ? "Pause" : "Start"}
              icon={running ? "pause" : "play"}
              onPress={() => setRunning((current) => !current)}
            />
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setSeconds(initialSeconds);
                setRunning(false);
              }}
              style={styles.reset}
            >
              <Ionicons name="refresh" size={22} color={colors.ink} />
            </Pressable>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Technique</Text>
        <View style={styles.steps}>
          {exercise.steps.map((step, index) => (
            <View key={step} style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    height: 410,
    backgroundColor: colors.dark
  },
  heroOverlay: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl
  },
  content: {
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    paddingTop: spacing.lg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    backgroundColor: colors.white,
    marginTop: -spacing.lg
  },
  title: {
    ...typography.title,
    color: colors.ink
  },
  subtitle: {
    ...typography.body,
    color: colors.muted,
    marginTop: -spacing.md
  },
  metaRow: {
    flexDirection: "row",
    gap: spacing.sm
  },
  meta: {
    flex: 1,
    minHeight: 86,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surface
  },
  metaValue: {
    ...typography.small,
    color: colors.ink,
    textAlign: "center"
  },
  timerCard: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.ink
  },
  timerLabel: {
    ...typography.body,
    color: "rgba(255,255,255,0.66)"
  },
  timer: {
    ...typography.title,
    color: colors.white,
    fontSize: 52,
    lineHeight: 60,
    marginVertical: spacing.lg
  },
  timerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  reset: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    backgroundColor: colors.white
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.ink
  },
  steps: {
    gap: spacing.md
  },
  step: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "flex-start"
  },
  stepNumber: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    backgroundColor: colors.primary
  },
  stepNumberText: {
    ...typography.small,
    color: colors.white
  },
  stepText: {
    ...typography.body,
    flex: 1,
    color: colors.ink
  }
});

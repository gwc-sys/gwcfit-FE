import type * as React from "react";
import { MemberWorkoutScreenView, ButtonView, MetricView, WorkoutCardView, StateView } from "./MemberWorkoutScreen.presentation";
import { ui, makeStyles } from "./MemberWorkoutScreen.styles";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useMemo, useState } from "react";
import { ActivityIndicator, Image, Pressable, RefreshControl, StyleSheet, Text, useWindowDimensions, View } from "react-native";

import { Screen } from "../../components/Screen";
import { genderExerciseLibrary } from "../../data/genderExerciseLibrary";
import { useMemberWorkouts } from "../../hooks/useMember";
import { getApiErrorMessage } from "../../services/api/client";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { shadows, typography } from "../../theme/theme";
import type { ThemeColors } from "../../theme/theme";
import type { MemberWorkout } from "../../types/member";
import { formatDate } from "../../utils/formatters";

type Filter = "all" | "completed" | "pending" | "not-started";
type Icon = keyof typeof Ionicons.glyphMap;
const fallbackWorkoutImage = require("../../../assets/images/workout-plan-library.png");

function textOf(value: unknown, keys: string[], fallback = "") {
  if (!value || typeof value !== "object") return fallback;
  const record = value as Record<string, unknown>;
  for (const key of keys) if (typeof record[key] === "string" && String(record[key]).trim()) return String(record[key]).trim();
  return fallback;
}

function sessionOf(workout: MemberWorkout) {
  return workout.today_workout ?? workout.sessions?.[0] ?? workout.weekly_plan?.[0] ?? null;
}

function statusOf(workout: MemberWorkout): Exclude<Filter, "all"> {
  const status = workout.completion_status.toLowerCase();
  if (status.includes("complete")) return "completed";
  if (status.includes("pending") || status.includes("progress")) return "pending";
  return "not-started";
}

function imageOf(workout: MemberWorkout) {
  const session = sessionOf(workout);
  const gender = textOf(session, ["gender"]);
  const id = textOf(session, ["exerciseId", "exercise_id", "slug"]).toLowerCase();
  const name = textOf(session, ["name", "title", "exercise_name"]).toLowerCase();
  const libraries = gender === "Male" || gender === "Female" ? [genderExerciseLibrary[gender]] : [genderExerciseLibrary.Male, genderExerciseLibrary.Female];
  for (const library of libraries) {
    const match = library.find((item) => (id && item.slug === id) || (name && item.title.toLowerCase() === name));
    if (match) return match.image;
  }
  return fallbackWorkoutImage;
}

function durationText(minutes: number) {
  const hours = Math.floor(minutes / 60);
  return hours ? `${hours}h ${minutes % 60}m` : `${minutes}m`;
}

export function useMemberWorkoutScreenPresentation() {
  const query = useMemberWorkouts();
  const navigation = useNavigation<any>();
  const { colors } = useAppTheme();
  const { width } = useWindowDimensions();
  const compact = width < 760;
  const styles = useMemo(() => makeStyles(colors, compact), [colors, compact]);
  const [filter, setFilter] = useState<Filter>("all");
  const [recent, setRecent] = useState(true);
  const workouts = query.data ?? [];

  const completed = workouts.reduce((sum, item) => sum + (item.completed_workouts ?? 0), 0);
  const consistency = workouts.length ? Math.round(workouts.reduce((sum, item) => sum + (item.weekly_consistency ?? 0), 0) / workouts.length) : 0;
  const calories = workouts.reduce((sum, item) => sum + Math.max(1, item.completed_workouts ?? 0) * 180, 0);
  const duration = workouts.reduce((sum, item) => sum + Math.max(1, item.sessions?.length ?? 0) * 45, 0);
  const visible = useMemo(() => {
    const items = filter === "all" ? workouts : workouts.filter((item) => statusOf(item) === filter);
    return [...items].sort((a, b) => {
      const first = new Date(a.starts_at ?? 0).getTime() || 0;
      const second = new Date(b.starts_at ?? 0).getTime() || 0;
      return recent ? second - first : first - second;
    });
  }, [filter, recent, workouts]);

  return { kind: "view1" as const, props: { styles, query, colors, Metric, completed, consistency, calories, durationText, duration, setFilter, filter, navigation, ui, setRecent, recent, State, visible, WorkoutCard, compact, workouts, Button } };
}

export function MemberWorkoutScreen(...args: Parameters<typeof useMemberWorkoutScreenPresentation>): React.JSX.Element {
  return <MemberWorkoutScreenView model={useMemberWorkoutScreenPresentation(...args)} />;
}

export function useButtonPresentation({ icon, label, onPress, secondary }: { icon: Icon; label: string; onPress: () => void; secondary?: boolean }) {
  const { colors } = useAppTheme();
  return { kind: "view1" as const, props: { onPress, ui, secondary, colors, icon, label } };
}

function Button(...args: Parameters<typeof useButtonPresentation>): React.JSX.Element {
  return <ButtonView model={useButtonPresentation(...args)} />;
}

export function useMetricPresentation({ icon, label, value, sub, tone }: { icon: Icon; label: string; value: string; sub: string; tone: string }) {
  const { colors } = useAppTheme();
  return { kind: "view1" as const, props: { ui, colors, tone, icon, label, value, sub } };
}

function Metric(...args: Parameters<typeof useMetricPresentation>): React.JSX.Element {
  return <MetricView model={useMetricPresentation(...args)} />;
}

export function useWorkoutCardPresentation({ workout, compact, onOpen }: { workout: MemberWorkout; compact: boolean; onOpen: () => void }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors, compact), [colors, compact]);
  const status = statusOf(workout);
  const tone = status === "completed" ? colors.success : status === "pending" ? colors.warning : colors.primary;
  const label = status === "completed" ? "Completed" : status === "pending" ? "Pending" : "Not Started";
  const session = sessionOf(workout);
  const exercise = textOf(session, ["title", "name", "exercise_name"], "Today workout");
  const category = textOf(session, ["group", "category", "focus"], workout.goal);
  return { kind: "view1" as const, props: { styles, onOpen, imageOf, workout, tone, status, category, exercise, label, colors } };
}

function WorkoutCard(...args: Parameters<typeof useWorkoutCardPresentation>): React.JSX.Element {
  return <WorkoutCardView model={useWorkoutCardPresentation(...args)} />;
}

export function useStatePresentation({ icon, title, message, loading }: { icon: Icon; title?: string; message: string; loading?: boolean }) {
  const { colors } = useAppTheme();
  return { kind: "view1" as const, props: { ui, colors, loading, icon, title, message } };
}

function State(...args: Parameters<typeof useStatePresentation>): React.JSX.Element {
  return <StateView model={useStatePresentation(...args)} />;
}





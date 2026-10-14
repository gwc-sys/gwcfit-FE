import type * as React from "react";
import { MemberWorkoutDetailScreenView, ActionView, InfoView, PanelView, SummaryView, ExercisePanelView, TipsView, TipView, ProgressChartView } from "./MemberWorkoutDetailScreen.presentation";
import { s } from "./MemberWorkoutDetailScreen.styles";
import { showAlert } from "../../utils/appAlert";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useMemo, useState } from "react";
import { ActivityIndicator, Image, Pressable, RefreshControl, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Svg, { Circle, Line, Polyline, Text as SvgText } from "react-native-svg";

import { Screen } from "../../components/Screen";
import { genderExerciseLibrary, type GenderExerciseAsset } from "../../data/genderExerciseLibrary";
import { useMemberWorkouts } from "../../hooks/useMember";
import { getApiErrorMessage } from "../../services/api/client";
import type { MemberWorkout } from "../../types/member";

type Tab = "plan" | "details" | "notes" | "history";
type Icon = keyof typeof Ionicons.glyphMap;
export type ExerciseData = { name: string; group: string; sets: number; reps: string; rest: string; equipment: string; gender?: string; exerciseId?: string; image?: GenderExerciseAsset["image"] };

const fallbackHero = require("../../../assets/images/workout-plan-library.png");
const muscleImages: Record<string, any> = {
  chest: require("../../../assets/images/repdb/muscles/pectoralis-major.webp"),
  back: require("../../../assets/images/repdb/muscles/latissimus-dorsi.webp"),
  shoulders: require("../../../assets/images/repdb/muscles/lateral-deltoid.webp"),
  arms: require("../../../assets/images/repdb/muscles/triceps-brachii.webp"),
  triceps: require("../../../assets/images/repdb/muscles/triceps-brachii.webp"),
  biceps: require("../../../assets/images/repdb/muscles/biceps-brachii.webp"),
  legs: require("../../../assets/images/repdb/muscles/quadriceps.webp"),
  glutes: require("../../../assets/images/repdb/muscles/gluteus-maximus.webp"),
  core: require("../../../assets/images/repdb/muscles/rectus-abdominis.webp"),
};

function value(source: unknown, keys: string[], fallback = "") {
  if (!source || typeof source !== "object") return fallback;
  const record = source as Record<string, unknown>;
  for (const key of keys) {
    const item = record[key];
    if ((typeof item === "string" || typeof item === "number") && String(item).trim()) return String(item).trim();
  }
  return fallback;
}

function numberValue(source: unknown, keys: string[], fallback: number) {
  const parsed = Number(value(source, keys));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function resolveExerciseImage(gender: string, exerciseId: string, name: string) {
  const libraries = gender === "Male" || gender === "Female" ? [genderExerciseLibrary[gender]] : [genderExerciseLibrary.Male, genderExerciseLibrary.Female];
  for (const library of libraries) {
    const match = library.find((item) => item.slug === exerciseId.toLowerCase() || item.title.toLowerCase() === name.toLowerCase());
    if (match) return match.image;
  }
  return undefined;
}

export function exercisesOf(workout: MemberWorkout): ExerciseData[] {
  return (workout.sessions?.length ? workout.sessions : workout.weekly_plan ?? []).map((session, index) => {
    const name = value(session, ["name", "title", "exercise_name"], `Exercise ${index + 1}`);
    const gender = value(session, ["gender"]);
    const exerciseId = value(session, ["exerciseId", "exercise_id", "slug"]);
    return {
      name,
      gender,
      exerciseId,
      group: value(session, ["group", "category", "focus"], workout.goal),
      equipment: value(session, ["equipment"], "Gym equipment"),
      sets: numberValue(session, ["sets"], workout.level.toLowerCase().includes("begin") ? 3 : 4),
      reps: value(session, ["reps", "rep_range"], "10–12"),
      rest: value(session, ["rest", "rest_time", "rest_seconds"], index % 2 ? "90s" : "60s"),
      image: resolveExerciseImage(gender, exerciseId, name),
    };
  });
}

function planStatus(workout: MemberWorkout) {
  return workout.completion_status.toLowerCase().includes("complete") ? "Completed" : workout.completion_status.toLowerCase().includes("pending") ? "Pending" : "Not Started";
}

export function useMemberWorkoutDetailScreenPresentation() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const query = useMemberWorkouts();
  const { width } = useWindowDimensions();
  const stacked = width < 1080;
  const [tab, setTab] = useState<Tab>("plan");
  const workout = query.data?.find((item) => item.workout_plan_uuid === route.params?.workoutPlanUuid);
  const exercises = useMemo(() => workout ? exercisesOf(workout) : [], [workout]);

  if (query.isLoading) return { kind: "view1" as const, props: { s } };
  if (query.error || !workout) return { kind: "view2" as const, props: { s, query, Action, navigation } };

  const totalSets = exercises.reduce((sum, item) => sum + item.sets, 0);
  const totalRepsLow = exercises.reduce((sum, item) => sum + item.sets * (Number(item.reps.match(/\d+/)?.[0]) || 10), 0);
  const duration = Math.max(30, exercises.length * 8);
  const focus = exercises[0]?.group || workout.goal;
  const equipment = [...new Set(exercises.map((item) => item.equipment))].slice(0, 2).join(", ") || "Gym equipment";
  const heroImage = exercises[0]?.image ?? fallbackHero;
  const muscleKey = Object.keys(muscleImages).find((key) => focus.toLowerCase().includes(key)) ?? "arms";

  return { kind: "view3" as const, props: { s, query, navigation, workout, Action, planStatus, stacked, heroImage, exercises, Info, duration, focus, equipment, setTab, tab, ExercisePanel, Panel, muscleImages, muscleKey, Summary, totalSets, totalRepsLow, Tips, ProgressChart } };
}

export function MemberWorkoutDetailScreen(...args: Parameters<typeof useMemberWorkoutDetailScreenPresentation>): React.JSX.Element {
  return <MemberWorkoutDetailScreenView model={useMemberWorkoutDetailScreenPresentation(...args)} />;
}

export function useActionPresentation({ icon, label, onPress }: { icon: Icon; label: string; onPress: () => void }) { return { kind: "view1" as const, props: { onPress, s, icon, label } }; }

function Action(...args: Parameters<typeof useActionPresentation>): React.JSX.Element {
  return <ActionView model={useActionPresentation(...args)} />;
}
export function useInfoPresentation({ icon, label, value: detail, tone }: { icon: Icon; label: string; value: string; tone: string }) { return { kind: "view1" as const, props: { s, tone, icon, label, detail } }; }

function Info(...args: Parameters<typeof useInfoPresentation>): React.JSX.Element {
  return <InfoView model={useInfoPresentation(...args)} />;
}
export function usePanelPresentation({ title, children, style }: { title: string; children: React.ReactNode; style?: any }) { return { kind: "view1" as const, props: { s, style, title, children } }; }

function Panel(...args: Parameters<typeof usePanelPresentation>): React.JSX.Element {
  return <PanelView model={usePanelPresentation(...args)} />;
}
export function useSummaryPresentation({ icon, label, value: detail, tone }: { icon: Icon; label: string; value: string; tone: string }) { return { kind: "view1" as const, props: { s, tone, icon, label, detail } }; }

function Summary(...args: Parameters<typeof useSummaryPresentation>): React.JSX.Element {
  return <SummaryView model={useSummaryPresentation(...args)} />;
}

export function useExercisePanelPresentation({ exercises, detailed, onOpen }: { exercises: ExerciseData[]; detailed: boolean; onOpen: (index: number) => void }) { return { kind: "view1" as const, props: { Panel, detailed, s, exercises, onOpen, fallbackHero } }; }

function ExercisePanel(...args: Parameters<typeof useExercisePanelPresentation>): React.JSX.Element {
  return <ExercisePanelView model={useExercisePanelPresentation(...args)} />;
}

export function useTipsPresentation() { return { kind: "view1" as const, props: { Panel, s, Tip } }; }

function Tips(...args: Parameters<typeof useTipsPresentation>): React.JSX.Element {
  return <TipsView model={useTipsPresentation(...args)} />;
}
export function useTipPresentation({ icon, text, tone }: { icon: Icon; text: string; tone: string }) { return { kind: "view1" as const, props: { s, tone, icon, text } }; }

function Tip(...args: Parameters<typeof useTipPresentation>): React.JSX.Element {
  return <TipView model={useTipPresentation(...args)} />;
}

export function useProgressChartPresentation({ consistency }: { consistency: number }) { const points = [18, 44, 39, 68, 47, 72, 64, 84, 67, Math.max(25, consistency)].map((point, index) => `${28 + index * 48},${130 - point}`).join(" "); return { kind: "view1" as const, props: { s, points, consistency } }; }

function ProgressChart(...args: Parameters<typeof useProgressChartPresentation>): React.JSX.Element {
  return <ProgressChartView model={useProgressChartPresentation(...args)} />;
}



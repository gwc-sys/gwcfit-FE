import type * as React from "react";
import { MemberExerciseDetailScreenView, ButtonView, PanelView, TagView, MetricView, LegendView, SummaryView, TrainerTipsView, TipView } from "./MemberExerciseDetailScreen.presentation";
import { s } from "./MemberExerciseDetailScreen.styles";
import { showAlert } from "../../utils/appAlert";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useMemo, useState } from "react";
import { ActivityIndicator, Image, Pressable, RefreshControl, StyleSheet, Text, useWindowDimensions, View } from "react-native";

import { Screen } from "../../components/Screen";
import { useMemberWorkouts } from "../../hooks/useMember";
import { getApiErrorMessage } from "../../services/api/client";
import { exercisesOf } from "./MemberWorkoutDetailScreen";
import type { ExerciseData } from "./MemberWorkoutDetailScreen";

type Tab = "exercises" | "notes" | "history" | "tips";
type Icon = keyof typeof Ionicons.glyphMap;
const fallbackImage = require("../../../assets/images/workout-plan-library.png");
const muscleImages: Record<string, any> = {
  chest: require("../../../assets/images/repdb/muscles/pectoralis-major.webp"), back: require("../../../assets/images/repdb/muscles/erector-spinae.webp"), shoulders: require("../../../assets/images/repdb/muscles/lateral-deltoid.webp"), arms: require("../../../assets/images/repdb/muscles/triceps-brachii.webp"), triceps: require("../../../assets/images/repdb/muscles/triceps-brachii.webp"), biceps: require("../../../assets/images/repdb/muscles/biceps-brachii.webp"), legs: require("../../../assets/images/repdb/muscles/quadriceps.webp"), glutes: require("../../../assets/images/repdb/muscles/gluteus-maximus.webp"), core: require("../../../assets/images/repdb/muscles/rectus-abdominis.webp"),
};

function focusImage(group: string) { const key = Object.keys(muscleImages).find((item) => group.toLowerCase().includes(item)); return muscleImages[key ?? "back"]; }
function difficulty(level: string) { return level.toLowerCase().includes("begin") ? "Easy" : level.toLowerCase().includes("expert") ? "Hard" : "Medium"; }
function exerciseSteps(exercise: ExerciseData) { return [
  { title: "Set Your Position", body: `Set up safely for ${exercise.name} and brace your core before moving.` },
  { title: `Perform ${exercise.name}`, body: "Move through the working range slowly while keeping your body stable." },
  { title: "Pause at the Peak", body: `Hold briefly and squeeze your ${exercise.group.toLowerCase()} without losing control.` },
  { title: "Return with Control", body: "Return to the starting position smoothly, then repeat with the same form." },
]; }

export function useMemberExerciseDetailScreenPresentation() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const query = useMemberWorkouts();
  const { width } = useWindowDimensions();
  const stacked = width < 1050;
  const [tab, setTab] = useState<Tab>("exercises");
  const workout = query.data?.find((item) => item.workout_plan_uuid === route.params?.workoutPlanUuid);
  const exercises = useMemo(() => workout ? exercisesOf(workout) : [], [workout]);
  const exercise = exercises[Number(route.params?.exerciseIndex ?? 0)];

  if (query.isLoading) return { kind: "view1" as const, props: { s } };
  if (query.error || !workout || !exercise) return { kind: "view2" as const, props: { s, query, Button, navigation } };

  const steps = exerciseSteps(exercise);
  const totalSets = exercises.reduce((sum, item) => sum + item.sets, 0);
  const lowReps = exercises.reduce((sum, item) => sum + item.sets * (Number(item.reps.match(/\d+/)?.[0]) || 10), 0);
  const minutes = Math.max(30, exercises.length * 8);
  const statusDone = workout.completion_status.toLowerCase().includes("complete");
  const start = () => statusDone ? undefined : navigation.navigate("MemberWorkoutSession", { workoutPlanUuid: workout.workout_plan_uuid, exerciseIndex: Number(route.params?.exerciseIndex ?? 0) });

  return { kind: "view3" as const, props: { s, query, navigation, exercise, workout, Button, statusDone, start, stacked, fallbackImage, Panel, Tag, Metric, minutes, focusImage, Legend, setTab, tab, steps, TrainerTips, Summary, exercises, totalSets, lowReps, difficulty } };
}

export function MemberExerciseDetailScreen(...args: Parameters<typeof useMemberExerciseDetailScreenPresentation>): React.JSX.Element {
  return <MemberExerciseDetailScreenView model={useMemberExerciseDetailScreenPresentation(...args)} />;
}

export function useButtonPresentation({ icon, label, onPress, outline }: { icon: Icon; label: string; onPress: () => void; outline?: boolean }) { return { kind: "view1" as const, props: { onPress, s, outline, icon, label } }; }

function Button(...args: Parameters<typeof useButtonPresentation>): React.JSX.Element {
  return <ButtonView model={useButtonPresentation(...args)} />;
}
export function usePanelPresentation({ title, children, style }: { title?: string; children: React.ReactNode; style?: any }) { return { kind: "view1" as const, props: { s, style, title, children } }; }

function Panel(...args: Parameters<typeof usePanelPresentation>): React.JSX.Element {
  return <PanelView model={usePanelPresentation(...args)} />;
}
export function useTagPresentation({ label }: { label: string }) { return { kind: "view1" as const, props: { s, label } }; }

function Tag(...args: Parameters<typeof useTagPresentation>): React.JSX.Element {
  return <TagView model={useTagPresentation(...args)} />;
}
export function useMetricPresentation({ icon, label, value, tone }: { icon: Icon; label: string; value: string; tone: string }) { return { kind: "view1" as const, props: { s, tone, icon, label, value } }; }

function Metric(...args: Parameters<typeof useMetricPresentation>): React.JSX.Element {
  return <MetricView model={useMetricPresentation(...args)} />;
}
export function useLegendPresentation({ tone, label, value }: { tone: string; label: string; value: string }) { return { kind: "view1" as const, props: { s, tone, label, value } }; }

function Legend(...args: Parameters<typeof useLegendPresentation>): React.JSX.Element {
  return <LegendView model={useLegendPresentation(...args)} />;
}
export function useSummaryPresentation({ icon, label, value, tone }: { icon: Icon; label: string; value: string; tone: string }) { return { kind: "view1" as const, props: { s, tone, icon, label, value } }; }

function Summary(...args: Parameters<typeof useSummaryPresentation>): React.JSX.Element {
  return <SummaryView model={useSummaryPresentation(...args)} />;
}
export function useTrainerTipsPresentation({ exercise }: { exercise: ExerciseData }) { return { kind: "view1" as const, props: { Panel, s, Tip, exercise } }; }

function TrainerTips(...args: Parameters<typeof useTrainerTipsPresentation>): React.JSX.Element {
  return <TrainerTipsView model={useTrainerTipsPresentation(...args)} />;
}
export function useTipPresentation({ icon, text, tone }: { icon: Icon; text: string; tone: string }) { return { kind: "view1" as const, props: { s, tone, icon, text } }; }

function Tip(...args: Parameters<typeof useTipPresentation>): React.JSX.Element {
  return <TipView model={useTipPresentation(...args)} />;
}



import type * as React from "react";
import { MemberWorkoutSessionScreenView, SkeletonView, AngleView, OverlayView, PhasesView, MetricView, QueueView, CheckView, TipView } from "./MemberWorkoutCoachScreen.presentation";
import { s } from "./MemberWorkoutCoachScreen.styles";
import { showAlert } from "../../utils/appAlert";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Svg, { Circle, Line } from "react-native-svg";

import { Screen } from "../../components/Screen";
import { useWebPoseTracking } from "../../hooks/useWebPoseTracking";
import { useCompleteWorkout, useMemberWorkouts } from "../../hooks/useMember";
import { getApiErrorMessage } from "../../services/api/client";
import { ExerciseAnalysisEngine } from "../../services/poseAnalysisEngine";
import type { ExerciseAnalysis, PoseLandmark } from "../../services/poseAnalysisEngine";
import { exercisesOf } from "./MemberWorkoutDetailScreen";
import type { ExerciseData } from "./MemberWorkoutDetailScreen";

const CONNECTIONS = [[11,12],[11,13],[13,15],[12,14],[14,16],[11,23],[12,24],[23,24],[23,25],[25,27],[27,29],[29,31],[24,26],[26,28],[28,30],[30,32]] as const;
const time = (value: number) => `${Math.floor(value / 60).toString().padStart(2, "0")}:${(value % 60).toString().padStart(2, "0")}`;
const targetOf = (value: string) => Number(value.match(/\d+/g)?.at(-1) ?? 10);
const restOf = (value: string) => Math.min(180, Number(value.match(/\d+/)?.[0] ?? 60));

export function useMemberWorkoutSessionScreenPresentation() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const query = useMemberWorkouts();
  const complete = useCompleteWorkout();
  const stacked = useWindowDimensions().width < 1050;
  const workout = query.data?.find((item) => item.workout_plan_uuid === route.params?.workoutPlanUuid);
  const exercises = useMemo(() => workout ? exercisesOf(workout) : [], [workout]);
  const [index, setIndex] = useState(Number(route.params?.exerciseIndex ?? 0));
  const [sets, setSets] = useState<Record<number, number>>({});
  const [setNumber, setSetNumber] = useState(1);
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const [rest, setRest] = useState(0);
  const [nextIndex, setNextIndex] = useState<number | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [facing, setFacing] = useState<"front" | "back">("front");
  const [tracking, setTracking] = useState(true);
  const [permission, requestPermission] = useCameraPermissions();
  const engine = useRef(new ExerciseAnalysisEngine("workout"));
  const [analysis, setAnalysis] = useState<ExerciseAnalysis>(() => engine.current.snapshot());
  const exercise = exercises[index];
  const pose = useWebPoseTracking({ enabled: cameraOpen, active: tracking && !paused && rest === 0, cameraElementId: "ai-coach-camera", engine: engine.current, onAnalysis: setAnalysis });

  useEffect(() => { const id = setInterval(() => { if (!paused) setElapsed((v) => v + 1); if (!paused && rest > 0) setRest((v) => Math.max(0, v - 1)); }, 1000); return () => clearInterval(id); }, [paused, rest]);
  useEffect(() => { if (rest || nextIndex === null) return; goTo(nextIndex); setNextIndex(null); }, [rest, nextIndex]);

  if (query.isLoading) return { kind: "view1" as const, props: { s } };
  if (query.error || !workout || !exercise) return { kind: "view2" as const, props: { s, query } };

  const target = targetOf(exercise.reps);
  const reps = analysis.repetitions;
  const doneSets = Object.values(sets).reduce((sum, value) => sum + value, 0);
  const totalSets = exercises.reduce((sum, item) => sum + item.sets, 0);
  const score = Math.round(analysis.formScore);
  const rom = Math.min(100, Math.round(analysis.rangeOfMotion / 45 * 100));
  const hip = Math.round(analysis.jointAngles.primary ?? 0);
  const back = hip ? Math.abs(180 - hip) : 0;
  const quality = score >= 85 ? "Great Form" : score >= 70 ? "Good Form" : analysis.framesProcessed ? "Adjust Form" : "Waiting";
  const fatigue = elapsed > 1200 || doneSets > totalSets * .7 ? "High" : elapsed > 480 || doneSets > totalSets * .35 ? "Medium" : "Low";

  function goTo(next: number) { const safe = Math.max(0, Math.min(exercises.length - 1, next)); setIndex(safe); setSetNumber((sets[safe] ?? 0) + 1); setRest(0); setAnalysis(engine.current.reset(exercises[safe].name)); }
  function finishWorkout(nextSets: Record<number, number>) { const results = exercises.map((item, i) => ({ exercise_name: item.name, sets_completed: nextSets[i] ?? 0, planned_sets: item.sets, reps: item.reps, equipment: item.equipment, completed: (nextSets[i] ?? 0) >= item.sets })); complete.mutate({ workoutPlanUuid: workout!.workout_plan_uuid, notes: `AI coached workout completed in ${time(elapsed)}.`, exercises: results }, { onSuccess: () => showAlert("Workout complete!", `You finished ${workout!.workout_plan_name}.`, [{ text: "View Plan", onPress: () => navigation.navigate("MemberWorkoutDetail", { workoutPlanUuid: workout!.workout_plan_uuid }) }]) }); }
  function completeSet() { const count = Math.min(exercise.sets, (sets[index] ?? 0) + 1); const nextSets = { ...sets, [index]: count }; setSets(nextSets); if (setNumber >= exercise.sets && index >= exercises.length - 1) return showAlert("Finish workout?", "Save this workout to your progress?", [{ text: "Not Yet", style: "cancel" }, { text: "Finish", onPress: () => finishWorkout(nextSets) }]); setRest(restOf(exercise.rest)); if (setNumber >= exercise.sets) setNextIndex(index + 1); else setSetNumber(count + 1); setAnalysis(engine.current.reset(exercise.name)); }
  async function openCamera() { if (!permission?.granted) { const result = await requestPermission(); if (!result.granted) return showAlert("Camera permission needed", "Allow camera access for live form analysis."); } setAnalysis(engine.current.reset(exercise.name)); setCameraOpen(true); setTracking(true); }
  const detector = !cameraOpen ? "READY" : pose.status === "tracking" ? "LIVE" : pose.status === "loading" ? "LOADING" : pose.status === "no-pose" ? "FINDING BODY" : "CAMERA";

  return { kind: "view3" as const, props: { s, navigation, workout, setNumber, exercise, index, exercises, time, elapsed, setPaused, paused, stacked, detector, cameraOpen, facing, Skeleton, pose, reps, target, analysis, quality, rom, Angle, back, hip, score, openCamera, setFacing, setTracking, tracking, setAnalysis, engine, Overlay, rest, nextIndex, setRest, Phases, complete, completeSet, Metric, fatigue, doneSets, totalSets, Queue, sets, goTo, Check, Tip } };
}

export function MemberWorkoutSessionScreen(...args: Parameters<typeof useMemberWorkoutSessionScreenPresentation>): React.JSX.Element {
  return <MemberWorkoutSessionScreenView model={useMemberWorkoutSessionScreenPresentation(...args)} />;
}

export function useSkeletonPresentation({ landmarks, mirrored }: { landmarks?: PoseLandmark[]; mirrored: boolean }) { if (!landmarks?.length) return null; const x = (p: PoseLandmark) => (mirrored ? 1 - p.x : p.x) * 640; const y = (p: PoseLandmark) => p.y * 410; return { kind: "view1" as const, props: { s, CONNECTIONS, landmarks, x, y } }; }

function Skeleton(...args: Parameters<typeof useSkeletonPresentation>): React.JSX.Element {
  return <SkeletonView model={useSkeletonPresentation(...args)} />;
}
export function useAnglePresentation({ label, value, good }: { label: string; value: string; good: boolean }) { return { kind: "view1" as const, props: { s, label, value, good } }; }

function Angle(...args: Parameters<typeof useAnglePresentation>): React.JSX.Element {
  return <AngleView model={useAnglePresentation(...args)} />;
}
export function useOverlayPresentation({ icon, title }: { icon: keyof typeof Ionicons.glyphMap; title: string }) { return { kind: "view1" as const, props: { s, icon, title } }; }

function Overlay(...args: Parameters<typeof useOverlayPresentation>): React.JSX.Element {
  return <OverlayView model={useOverlayPresentation(...args)} />;
}
export function usePhasesPresentation({ phase }: { phase: ExerciseAnalysis["phase"] }) { const items = ["Setup", "Eccentric", "Concentric", "Top Position"]; return { kind: "view1" as const, props: { s, items, phase } }; }

function Phases(...args: Parameters<typeof usePhasesPresentation>): React.JSX.Element {
  return <PhasesView model={usePhasesPresentation(...args)} />;
}
export function useMetricPresentation({ label, value, sub, ring, warning }: { label: string; value: string; sub: string; ring?: boolean; warning?: boolean }) { return { kind: "view1" as const, props: { s, label, ring, warning, value, sub } }; }

function Metric(...args: Parameters<typeof useMetricPresentation>): React.JSX.Element {
  return <MetricView model={useMetricPresentation(...args)} />;
}
export function useQueuePresentation({ item, index, active, completed, onPress }: { item: ExerciseData; index: number; active: boolean; completed: number; onPress: () => void }) { return { kind: "view1" as const, props: { onPress, s, active, index, item, completed } }; }

function Queue(...args: Parameters<typeof useQueuePresentation>): React.JSX.Element {
  return <QueueView model={useQueuePresentation(...args)} />;
}
export function useCheckPresentation({ text, warning }: { text: string; warning?: boolean }) { return { kind: "view1" as const, props: { s, warning, text } }; }

function Check(...args: Parameters<typeof useCheckPresentation>): React.JSX.Element {
  return <CheckView model={useCheckPresentation(...args)} />;
}
export function useTipPresentation({ text }: { text: string }) { return { kind: "view1" as const, props: { s, text } }; }

function Tip(...args: Parameters<typeof useTipPresentation>): React.JSX.Element {
  return <TipView model={useTipPresentation(...args)} />;
}



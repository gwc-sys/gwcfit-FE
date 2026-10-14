import type * as React from "react";
import { ExerciseDetailScreenView } from "./ExerciseDetailScreen.presentation";
import { styles } from "./ExerciseDetailScreen.styles";
import { useEffect, useMemo, useState } from "react";
import { ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Check, Clock, Flame, MoreVertical, Pause, Play, RotateCcw } from "../components/icons";

import { Header } from "../components/Header";
import { PrimaryButton } from "../components/PrimaryButton";
import { exercises } from "../data/workouts";
import { useFitnessStore } from "../store/useFitnessStore";
import type { RootStackParamList } from "../navigation/types";
import { palette, radii, spacing, type } from "../theme/theme";

type Props = NativeStackScreenProps<RootStackParamList, "ExerciseDetail">;

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remaining = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remaining}`;
}

export function useExerciseDetailScreenPresentation({ route }: Props) {
  const plans = useFitnessStore((state) => state.plans);
  const exercise = useMemo(
    () => plans.flatMap((plan) => plan.exercises).find((item) => item.id === route.params?.exerciseId)
      ?? exercises.find((item) => item.id === route.params?.exerciseId)
      ?? exercises[0],
    [plans, route.params?.exerciseId]
  );
  const [seconds, setSeconds] = useState(45 * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) {
      return undefined;
    }
    const interval = setInterval(() => {
      setSeconds((current) => Math.max(0, current - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [running]);

  return { kind: "view1" as const, props: { styles, exercise, formatTime, seconds, setSeconds, setRunning, running } };
}

export function ExerciseDetailScreen(...args: Parameters<typeof useExerciseDetailScreenPresentation>): React.JSX.Element {
  return <ExerciseDetailScreenView model={useExerciseDetailScreenPresentation(...args)} />;
}



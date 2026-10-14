import type * as React from "react";
import { WorkoutPlanScreenView } from "./WorkoutPlanScreen.presentation";
import { styles } from "./WorkoutPlanScreen.styles";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CalendarDays, Dumbbell, MoreVertical } from "../components/icons";

import { AppScreen } from "../components/AppScreen";
import { ExerciseListItem } from "../components/ExerciseListItem";
import { Header } from "../components/Header";
import { PrimaryButton } from "../components/PrimaryButton";
import { WorkoutCard } from "../components/WorkoutCard";
import { useFitnessStore } from "../store/useFitnessStore";
import { palette, radii, spacing, type } from "../theme/theme";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "WorkoutPlan">;

const weeks = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"];

export function useWorkoutPlanScreenPresentation({ navigation }: Props) {
  const { plans, selectedPlanId } = useFitnessStore();
  const plan = plans.find((item) => item.id === selectedPlanId) ?? plans[0];

  return { kind: "view1" as const, props: { plan, styles, weeks, navigation } };
}

export function WorkoutPlanScreen(...args: Parameters<typeof useWorkoutPlanScreenPresentation>): React.JSX.Element {
  return <WorkoutPlanScreenView model={useWorkoutPlanScreenPresentation(...args)} />;
}



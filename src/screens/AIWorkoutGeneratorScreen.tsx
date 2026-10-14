import type * as React from "react";
import { AIWorkoutGeneratorScreenView } from "./AIWorkoutGeneratorScreen.presentation";
import { styles } from "./AIWorkoutGeneratorScreen.styles";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Bot, Check, Clock, Dumbbell, Sparkles, Target } from "../components/icons";

import { AppScreen } from "../components/AppScreen";
import { Header } from "../components/Header";
import { PrimaryButton } from "../components/PrimaryButton";
import { SegmentedControl } from "../components/SegmentedControl";
import { useFitnessStore } from "../store/useFitnessStore";
import { palette, radii, spacing, type } from "../theme/theme";
import type { ExperienceLevel, FitnessGoal, GeneratorPreferences, WorkoutGender } from "../types/fitness";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "AIWorkoutGenerator">;

const goals: FitnessGoal[] = ["Build Muscle", "Lose Fat", "Mobility", "Endurance"];
const levels: ExperienceLevel[] = ["Beginner", "Intermediate", "Expert"];
const genders: WorkoutGender[] = ["Male", "Female"];
const equipmentOptions = ["Dumbbells", "Bands", "Cable", "Bodyweight"];

export function useAIWorkoutGeneratorScreenPresentation({ navigation }: Props) {
  const { generatePlan, isGenerating, profile } = useFitnessStore();
  const [goal, setGoal] = useState<FitnessGoal>(profile.goal);
  const [level, setLevel] = useState<ExperienceLevel>(profile.level);
  const [gender, setGender] = useState<WorkoutGender>(profile.gender);
  const [days, setDays] = useState(4);
  const [minutes, setMinutes] = useState(45);
  const [equipment, setEquipment] = useState<string[]>(["Dumbbells", "Bodyweight"]);

  const toggleEquipment = (item: string) => {
    setEquipment((current) =>
      current.includes(item) ? current.filter((value) => value !== item) : [...current, item]
    );
  };

  const handleGenerate = async () => {
    const preferences: GeneratorPreferences = {
      gender,
      goal,
      level,
      daysPerWeek: days,
      sessionMinutes: minutes,
      equipment
    };
    await generatePlan(preferences);
    navigation.navigate("WorkoutPlan");
  };

  return { kind: "view1" as const, props: { styles, goals, setGoal, goal, levels, level, setLevel, genders, gender, setGender, setDays, days, setMinutes, minutes, equipmentOptions, equipment, toggleEquipment, isGenerating, handleGenerate } };
}

export function AIWorkoutGeneratorScreen(...args: Parameters<typeof useAIWorkoutGeneratorScreenPresentation>): React.JSX.Element {
  return <AIWorkoutGeneratorScreenView model={useAIWorkoutGeneratorScreenPresentation(...args)} />;
}



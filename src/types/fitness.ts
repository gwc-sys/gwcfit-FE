import type { ImageSourcePropType } from "react-native";

export type FitnessGoal = "Build Muscle" | "Lose Fat" | "Mobility" | "Endurance";
export type ExperienceLevel = "Beginner" | "Intermediate" | "Expert";
export type WorkoutGender = "Male" | "Female";

export type Exercise = {
  id: string;
  title: string;
  focus: string;
  duration: string;
  calories: number;
  image: ImageSourcePropType;
  equipment: string;
  description: string;
  steps: string[];
};

export type WorkoutPlan = {
  id: string;
  title: string;
  goal: FitnessGoal;
  level: ExperienceLevel;
  durationWeeks: number;
  sessionsPerWeek: number;
  heroImage: ImageSourcePropType;
  summary: string;
  exercises: Exercise[];
  gender?: WorkoutGender;
};

export type Meal = {
  id: string;
  title: string;
  time: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  items: string[];
};

export type UserProfile = {
  name: string;
  email: string;
  goal: FitnessGoal;
  level: ExperienceLevel;
  heightCm: number;
  weightKg: number;
  dailyCalories: number;
  waterCups: number;
  stepsKm: number;
  gender: WorkoutGender;
};

export type GeneratorPreferences = {
  gender: WorkoutGender;
  goal: FitnessGoal;
  level: ExperienceLevel;
  daysPerWeek: number;
  sessionMinutes: number;
  equipment: string[];
};

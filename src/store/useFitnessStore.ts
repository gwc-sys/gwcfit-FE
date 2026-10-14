import { create } from "zustand";

import { meals } from "../data/meals";
import { workoutPlans } from "../data/workouts";
import { requestAiWorkoutPlan } from "../services/aiPlanner";
import type { AppThemeMode } from "../theme/theme";
import type { GeneratorPreferences, Meal, UserProfile, WorkoutPlan } from "../types/fitness";

type FitnessSettings = {
  notifications: boolean;
  haptics: boolean;
  metricUnits: boolean;
  mealReminders: boolean;
};

type FitnessState = {
  profile: UserProfile;
  plans: WorkoutPlan[];
  selectedPlanId: string;
  meals: Meal[];
  isGenerating: boolean;
  darkMode: boolean;
  themeMode: AppThemeMode;
  settings: FitnessSettings;
  setSelectedPlan: (planId: string) => void;
  generatePlan: (preferences: GeneratorPreferences) => Promise<WorkoutPlan>;
  setThemeMode: (mode: AppThemeMode) => void;
  setDarkMode: (enabled: boolean) => void;
  toggleDarkMode: () => void;
  toggleSetting: (key: keyof FitnessSettings) => void;
  updateWater: (cups: number) => void;
};

export const useFitnessStore = create<FitnessState>((set, get) => ({
  profile: {
    name: "Aaron Ramsdale",
    email: "aaronramsdale@gmail.com",
    goal: "Build Muscle",
    level: "Intermediate",
    heightCm: 175,
    weightKg: 73.8,
    dailyCalories: 1372,
    waterCups: 7,
    stepsKm: 7.2,
    gender: "Male"
  },
  plans: workoutPlans,
  selectedPlanId: workoutPlans[0].id,
  meals,
  isGenerating: false,
  darkMode: true,
  themeMode: "dark",
  settings: {
    notifications: true,
    haptics: true,
    metricUnits: true,
    mealReminders: false
  },
  setSelectedPlan: (planId) => set({ selectedPlanId: planId }),
  generatePlan: async (preferences) => {
    set({ isGenerating: true });
    const plan = await requestAiWorkoutPlan(get().profile, preferences);
    set((state) => ({
      plans: [plan, ...state.plans],
      selectedPlanId: plan.id,
      isGenerating: false
    }));
    return plan;
  },
  setThemeMode: (mode) => set({ themeMode: mode, darkMode: mode === "dark" }),
  setDarkMode: (enabled) => set({ darkMode: enabled, themeMode: enabled ? "dark" : "light" }),
  toggleDarkMode: () =>
    set((state) => {
      const enabled = state.themeMode === "dark" ? false : true;
      return { darkMode: enabled, themeMode: enabled ? "dark" : "light" };
    }),
  toggleSetting: (key) =>
    set((state) => ({
      settings: {
        ...state.settings,
        [key]: !state.settings[key]
      }
    })),
  updateWater: (cups) =>
    set((state) => ({ profile: { ...state.profile, waterCups: cups } }))
}));

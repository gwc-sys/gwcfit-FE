import { images } from "../assets/images";
import { buildGenderExercises } from "../data/genderExerciseLibrary";
import type { GeneratorPreferences, UserProfile, WorkoutPlan } from "../types/fitness";

export function buildDummyWorkoutPlan(
  profile: UserProfile,
  preferences: GeneratorPreferences
): WorkoutPlan {
  const exercises = buildGenderExercises(preferences);

  return {
    id: `ai-${Date.now()}`,
    title: `${preferences.goal} ${preferences.gender} Plan`,
    goal: preferences.goal,
    level: preferences.level,
    durationWeeks: 5,
    sessionsPerWeek: preferences.daysPerWeek,
    heroImage: exercises[0]?.image ?? (preferences.goal === "Lose Fat" ? images.groupTraining : images.gymDetail),
    summary: `${profile.name.split(" ")[0]}, this ${preferences.gender.toLowerCase()} demonstration plan balances ${preferences.sessionMinutes}-minute sessions with your ${preferences.goal.toLowerCase()} target, ${preferences.level.toLowerCase()} experience, and available equipment.`,
    exercises,
    gender: preferences.gender,
  };
}

export async function requestAiWorkoutPlan(
  profile: UserProfile,
  preferences: GeneratorPreferences
) {
  // Replace this function with a secure backend call when wiring OpenAI.
  await new Promise((resolve) => setTimeout(resolve, 450));
  return buildDummyWorkoutPlan(profile, preferences);
}

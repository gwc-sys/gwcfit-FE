/// <reference types="expo/types/metro-require" />

import type { ImageSourcePropType } from "react-native";

import type { Exercise, FitnessGoal, GeneratorPreferences, WorkoutGender } from "../types/fitness";

type AssetContext = {
  keys: () => string[];
  (key: string): ImageSourcePropType | { default: ImageSourcePropType };
};

export type GenderExerciseGroup =
  | "Chest"
  | "Back"
  | "Shoulders"
  | "Arms"
  | "Legs & Glutes"
  | "Core"
  | "Cardio"
  | "Mobility & Recovery"
  | "Full Body";

export type GenderExerciseAsset = {
  key: string;
  slug: string;
  title: string;
  image: ImageSourcePropType;
  gender: WorkoutGender;
  group: GenderExerciseGroup;
  assetPath: string;
  equipment: string;
  focus: string;
};

export const genderExerciseGroups: GenderExerciseGroup[] = [
  "Chest", "Back", "Shoulders", "Arms", "Legs & Glutes", "Core",
  "Cardio", "Mobility & Recovery", "Full Body",
];

// Metro needs literal paths here. These contexts bundle every GIF in both folders,
// including any new exercise GIF added later without maintaining a large manual map.
const maleAssets = require.context("../../male_image", false, /\.gif$/) as AssetContext;
const femaleAssets = require.context("../../female_image", false, /\.gif$/) as AssetContext;

const priorityByGoal: Record<FitnessGoal, string[]> = {
  "Build Muscle": [
    "bench_press", "dumbbell_bench_press", "barbell_squats", "goblet_squat",
    "bent_over_rows", "dumbbell_row", "shoulder_press", "bicep_curls",
    "tricep_pushdowns", "deadlifts", "hip_thrusts", "leg_press",
  ],
  "Lose Fat": [
    "burpees", "mountain_climbers", "jumping_jacks", "kettlebell_swings",
    "jump_rope", "high_knees", "jump_squats", "battle_ropes", "shadow_boxing",
  ],
  Mobility: [
    "cat_stretches", "downward_dog", "butterfly_stretch", "child_poses",
    "sun_salutations", "foam_rolling", "stretching", "yoga", "pilates",
  ],
  Endurance: [
    "treadmill_running", "rowing_machine", "stationary_bike", "elliptical_trainer",
    "stairmaster", "battle_ropes", "jump_rope", "high_knees", "hiit_cardio",
  ],
};

function unwrapAsset(value: ImageSourcePropType | { default: ImageSourcePropType }) {
  return typeof value === "object" && value !== null && "default" in value ? value.default : value;
}

function toTitle(slug: string) {
  return slug
    .replace(/\s+\d+$/, "")
    .replace(/\s*\((.*?)\)/g, " - $1")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .trim();
}

function inferEquipment(slug: string) {
  if (/dumbbell|dumbell/.test(slug)) return "Dumbbells";
  if (/resistance_band|band_/.test(slug)) return "Bands";
  if (/cable|pulldown|pushdown/.test(slug)) return "Cable";
  if (/barbell|military_press|rack_pull/.test(slug)) return "Barbell";
  if (/kettlebell|goblet/.test(slug)) return "Kettlebell";
  if (/treadmill|elliptical|rowing_machine|bike|stair/.test(slug)) return "Cardio machine";
  if (/squat|push.?up|plank|lunge|burpee|crunch|sit.?up|stretch|yoga|pose|jump|knee|bridge|mountain|dip/.test(slug)) {
    return "Bodyweight";
  }
  return "Gym equipment";
}

function inferFocus(slug: string) {
  if (/stretch|yoga|pose|mobility|pilates|foam|meditation|bend/.test(slug)) return "Mobility & recovery";
  if (/treadmill|bike|elliptical|rowing|jump|burpee|battle|hiit|stair|boxing|high_knee/.test(slug)) return "Cardio & conditioning";
  if (/crunch|plank|sit.?up|leg_raise|knee_raise|russian|bicycle|v.?sit|flutter|scissor/.test(slug)) return "Core";
  if (/squat|lunge|leg_|calf|glute|hip_|hamstring|deadlift|good_morning/.test(slug)) return "Legs & glutes";
  if (/curl|tricep|dip|extension|skull/.test(slug)) return "Arms";
  if (/press|fly|push.?up/.test(slug)) return "Chest & shoulders";
  if (/row|pull.?up|pulldown|superman|back_/.test(slug)) return "Back";
  return "Full body";
}

function inferGroup(slug: string): GenderExerciseGroup {
  if (/stretch|yoga|pose|mobility|pilates|foam|meditation|bend|salutation/.test(slug)) return "Mobility & Recovery";
  if (/treadmill|bike|cycling|elliptical|rowing_machine|jump|battle_ropes|hiit|stair|boxing|high_knee/.test(slug)) return "Cardio";
  if (/crunch|plank|sit.?up|leg_raise|knee_raise|russian|bicycle|v.?sit|flutter|scissor|abdominal/.test(slug)) return "Core";
  if (/squat|lunge|leg_|calf|glute|hip_|hamstring|deadlift|good_morning|step.?up|butt_kick|wall_sit/.test(slug)) return "Legs & Glutes";
  if (/shoulder|lateral_raise|front_raise|upright_row|military_press|overhead_press|push_press|y.?raise/.test(slug)) return "Shoulders";
  if (/bicep|tricep|curl|skull_crusher|preacher|wrist|bench_dip|pushdown/.test(slug)) return "Arms";
  if (/bench_press|chest|fly|push.?up|pec/.test(slug)) return "Chest";
  if (/row|pull.?up|pulldown|pullover|superman|back_|rack_pull|shrug|chin.?up|band_pull|prone_cobra/.test(slug)) return "Back";
  return "Full Body";
}

function createLibrary(context: AssetContext, gender: WorkoutGender): GenderExerciseAsset[] {
  return context.keys()
    .filter((key) => key !== "./default.gif")
    .map((key) => {
      const slug = key.replace(/^\.\//, "").replace(/\.gif$/i, "").toLowerCase();
      return {
        key,
        slug,
        title: toTitle(slug),
        image: unwrapAsset(context(key)),
        gender,
        group: inferGroup(slug),
        assetPath: `${gender === "Male" ? "male_image" : "female_image"}/${key.replace(/^\.\//, "")}`,
        equipment: inferEquipment(slug),
        focus: inferFocus(slug),
      };
    });
}

export const genderExerciseLibrary: Record<WorkoutGender, GenderExerciseAsset[]> = {
  Male: createLibrary(maleAssets, "Male"),
  Female: createLibrary(femaleAssets, "Female"),
};

export const genderExerciseCounts = {
  Male: genderExerciseLibrary.Male.length,
  Female: genderExerciseLibrary.Female.length,
};

export const genderExercisesByGroup: Record<WorkoutGender, Record<GenderExerciseGroup, GenderExerciseAsset[]>> = {
  Male: Object.fromEntries(genderExerciseGroups.map((group) => [group, genderExerciseLibrary.Male.filter((item) => item.group === group)])) as Record<GenderExerciseGroup, GenderExerciseAsset[]>,
  Female: Object.fromEntries(genderExerciseGroups.map((group) => [group, genderExerciseLibrary.Female.filter((item) => item.group === group)])) as Record<GenderExerciseGroup, GenderExerciseAsset[]>,
};

function canonicalSlug(slug: string) {
  return slug.replace(/\s+\d+$/, "").replace(/[^a-z0-9]/g, "").replace(/s$/, "");
}

function matchesGoal(item: GenderExerciseAsset, goal: FitnessGoal) {
  if (goal === "Mobility") return item.focus === "Mobility & recovery";
  if (goal === "Endurance") return item.focus === "Cardio & conditioning";
  if (goal === "Lose Fat") {
    return item.focus === "Cardio & conditioning" || item.focus === "Full body" || item.focus === "Core";
  }
  return item.focus !== "Mobility & recovery" && item.focus !== "Cardio & conditioning";
}

function buildSteps(goal: FitnessGoal, level: GeneratorPreferences["level"], title: string) {
  const rounds = level === "Beginner" ? 3 : level === "Intermediate" ? 4 : 5;
  if (goal === "Mobility") {
    return [
      `Move into ${title} slowly and without pain.`,
      "Hold or flow for 30-45 seconds with steady breathing.",
      `Repeat for ${Math.max(2, rounds - 1)} controlled rounds.`,
      "Reduce the range if your form or breathing changes.",
    ];
  }
  if (goal === "Endurance" || goal === "Lose Fat") {
    return [
      `Warm up before starting ${title}.`,
      `Complete ${rounds} rounds of 40 seconds work and 20 seconds recovery.`,
      "Keep a repeatable pace and controlled technique.",
      "Cool down until your breathing returns to normal.",
    ];
  }
  return [
    `Warm up the working muscles before ${title}.`,
    `Complete ${rounds} sets of 8-12 controlled repetitions.`,
    "Keep one or two good repetitions in reserve.",
    "Rest 60-90 seconds, then repeat with the same form.",
  ];
}

export function buildGenderExercises(preferences: GeneratorPreferences): Exercise[] {
  const library = genderExerciseLibrary[preferences.gender];
  const preferredEquipment = new Set(preferences.equipment);
  const priority = priorityByGoal[preferences.goal];
  const desiredCount = Math.max(4, Math.min(8, Math.round(preferences.sessionMinutes / 8)));
  const goalMatches = library.filter((item) => matchesGoal(item, preferences.goal));
  const equipmentMatches = library.filter((item) => preferredEquipment.has(item.equipment));
  const combinedMatches = goalMatches.filter((item) => preferredEquipment.has(item.equipment));
  const pool = combinedMatches.length >= desiredCount
    ? combinedMatches
    : goalMatches.length >= desiredCount
      ? goalMatches
      : equipmentMatches.length >= desiredCount
        ? equipmentMatches
        : library;
  const scored = pool.map((item) => {
    const priorityIndex = priority.indexOf(item.slug);
    const equipmentScore = preferredEquipment.has(item.equipment) ? 35 : 0;
    const goalScore = priorityIndex >= 0 ? 120 - priorityIndex * 4 : 0;
    return { item, score: goalScore + equipmentScore };
  }).sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title));

  const selected: GenderExerciseAsset[] = [];
  const seen = new Set<string>();
  for (const { item } of scored) {
    const canonical = canonicalSlug(item.slug);
    if (seen.has(canonical)) continue;
    selected.push(item);
    seen.add(canonical);
    if (selected.length === desiredCount) break;
  }

  const minutesPerExercise = Math.max(5, Math.round(preferences.sessionMinutes / selected.length));
  return selected.map((item, index) => ({
    id: `generated-${preferences.gender.toLowerCase()}-${item.slug.replace(/[^a-z0-9]+/g, "-")}-${index}`,
    title: item.title,
    focus: item.focus,
    duration: `${minutesPerExercise} min`,
    calories: Math.round(minutesPerExercise * (preferences.goal === "Mobility" ? 4 : 7)),
    image: item.image,
    equipment: item.equipment,
    description: `${item.title} is included in this ${preferences.level.toLowerCase()} ${preferences.goal.toLowerCase()} session. Follow the animated ${preferences.gender.toLowerCase()} demonstration and keep every repetition controlled.`,
    steps: buildSteps(preferences.goal, preferences.level, item.title),
  }));
}

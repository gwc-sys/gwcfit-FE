export type ExerciseWorkoutGroup =
  | "Chest"
  | "Back"
  | "Shoulders"
  | "Arms"
  | "Legs & Glutes"
  | "Core & Conditioning";

export type RepdbExercise = {
  id: string;
  name: string;
  group: ExerciseWorkoutGroup;
  muscles: string[];
  equipment: string;
  sourceAssets: string[];
  featured?: boolean;
};

// The start/peak files and classic/classic-white/flat variants are one exercise,
// so they are intentionally represented once here.
export const repdbExerciseLibrary: RepdbExercise[] = [
  {
    id: "bench-press",
    name: "Bench Press",
    group: "Chest",
    muscles: ["Chest", "Triceps", "Front delts"],
    equipment: "Barbell",
    sourceAssets: ["animations/bench-press.webp"],
    featured: true,
  },
  {
    id: "incline-bench-press",
    name: "Incline Bench Press",
    group: "Chest",
    muscles: ["Upper chest", "Triceps", "Front delts"],
    equipment: "Barbell",
    sourceAssets: ["animations/incline-bench-press.webp"],
    featured: true,
  },
  {
    id: "bench-dips",
    name: "Bench Dips",
    group: "Chest",
    muscles: ["Triceps", "Chest", "Front delts"],
    equipment: "Bench",
    sourceAssets: [
      "classic-white/bench-dips-start.webp",
      "classic-white/bench-dips-peak.webp",
    ],
  },
  {
    id: "bent-arm-ez-bar-pullover",
    name: "Bent-Arm EZ-Bar Pullover",
    group: "Chest",
    muscles: ["Chest", "Lats", "Triceps"],
    equipment: "EZ bar",
    sourceAssets: [
      "classic-white/bent-arm-ez-bar-pullover-start.webp",
      "classic-white/bent-arm-ez-bar-pullover-peak.webp",
    ],
  },
  {
    id: "pec-deck",
    name: "Pec Deck",
    group: "Chest",
    muscles: ["Chest"],
    equipment: "Pec-deck machine",
    sourceAssets: [
      "classic-white/pec-deck-start.webp",
      "classic-white/pec-deck-peak.webp",
    ],
  },
  {
    id: "pull-up",
    name: "Pull-Up",
    group: "Back",
    muscles: ["Lats", "Biceps", "Forearms"],
    equipment: "Pull-up bar",
    sourceAssets: ["animations/pull-up.webp"],
    featured: true,
  },
  {
    id: "double-kettlebell-row",
    name: "Double Kettlebell Row",
    group: "Back",
    muscles: ["Lats", "Rhomboids", "Traps"],
    equipment: "Kettlebells",
    sourceAssets: [
      "classic-white/double-kettlebell-row-start.webp",
      "classic-white/double-kettlebell-row-peak.webp",
    ],
  },
  {
    id: "one-arm-kettlebell-row",
    name: "One-Arm Kettlebell Row",
    group: "Back",
    muscles: ["Lats", "Rhomboids", "Biceps"],
    equipment: "Kettlebell + bench",
    sourceAssets: [
      "classic-white/one-arm-kettlebell-row-start.webp",
      "classic-white/one-arm-kettlebell-row-peak.webp",
    ],
  },
  {
    id: "smith-machine-bent-over-row",
    name: "Smith-Machine Bent-Over Row",
    group: "Back",
    muscles: ["Lats", "Rhomboids", "Rear delts"],
    equipment: "Smith machine",
    sourceAssets: [
      "classic-white/smith-machine-bent-over-row-start.webp",
      "classic-white/smith-machine-bent-over-row-peak.webp",
    ],
  },
  {
    id: "wide-grip-seated-cable-row",
    name: "Wide-Grip Seated Cable Row",
    group: "Back",
    muscles: ["Lats", "Rhomboids", "Traps"],
    equipment: "Cable machine",
    sourceAssets: [
      "classic-white/wide-grip-seated-cable-row-start.webp",
      "classic-white/wide-grip-seated-cable-row-peak.webp",
    ],
  },
  {
    id: "arnold-press",
    name: "Arnold Press",
    group: "Shoulders",
    muscles: ["Front delts", "Lateral delts", "Triceps"],
    equipment: "Dumbbells",
    sourceAssets: [
      "classic-white/arnold-press-start.webp",
      "classic-white/arnold-press-peak.webp",
    ],
  },
  {
    id: "behind-the-neck-press",
    name: "Behind-the-Neck Press",
    group: "Shoulders",
    muscles: ["Front delts", "Lateral delts", "Triceps"],
    equipment: "Barbell",
    sourceAssets: [
      "classic-white/behind-the-neck-press-start.webp",
      "classic-white/behind-the-neck-press-peak.webp",
    ],
  },
  {
    id: "push-press",
    name: "Push Press",
    group: "Shoulders",
    muscles: ["Delts", "Triceps", "Legs"],
    equipment: "Barbell",
    sourceAssets: [
      "classic-white/push-press-start.webp",
      "classic-white/push-press-peak.webp",
    ],
  },
  {
    id: "one-arm-kettlebell-push-press",
    name: "One-Arm Kettlebell Push Press",
    group: "Shoulders",
    muscles: ["Delts", "Triceps", "Core"],
    equipment: "Kettlebell",
    sourceAssets: ["animations/one-arm-kettlebell-push-press.webp"],
    featured: true,
  },
  {
    id: "ez-bar-overhead-extension",
    name: "EZ-Bar Overhead Extension",
    group: "Arms",
    muscles: ["Triceps"],
    equipment: "EZ bar",
    sourceAssets: [
      "classic-white/ez-bar-overhead-extension-start.webp",
      "classic-white/ez-bar-overhead-extension-peak.webp",
    ],
  },
  {
    id: "hip-thrust",
    name: "Hip Thrust",
    group: "Legs & Glutes",
    muscles: ["Glutes", "Hamstrings"],
    equipment: "Barbell",
    sourceAssets: ["animations/hip-thrust.webp"],
    featured: true,
  },
  {
    id: "barbell-glute-bridge",
    name: "Barbell Glute Bridge",
    group: "Legs & Glutes",
    muscles: ["Glutes", "Hamstrings"],
    equipment: "Barbell + mat",
    sourceAssets: [
      "classic-white/barbell-glute-bridge-start.webp",
      "classic-white/barbell-glute-bridge-peak.webp",
    ],
  },
  {
    id: "banded-lateral-walk",
    name: "Banded Lateral Walk",
    group: "Legs & Glutes",
    muscles: ["Gluteus medius", "Glutes"],
    equipment: "Loop band",
    sourceAssets: [
      "classic-white/banded-lateral-walk-start.webp",
      "classic-white/banded-lateral-walk-peak.webp",
    ],
  },
  {
    id: "bulgarian-split-squat",
    name: "Bulgarian Split Squat",
    group: "Legs & Glutes",
    muscles: ["Quadriceps", "Glutes", "Hamstrings"],
    equipment: "Dumbbells + bench",
    sourceAssets: [
      "classic-white/bulgarian-split-squat-start.webp",
      "classic-white/bulgarian-split-squat-peak.webp",
    ],
  },
  {
    id: "kettlebell-deadlift",
    name: "Kettlebell Deadlift",
    group: "Legs & Glutes",
    muscles: ["Hamstrings", "Glutes", "Erector spinae"],
    equipment: "Kettlebell",
    sourceAssets: [
      "classic-white/kettlebell-deadlift-start.webp",
      "classic-white/kettlebell-deadlift-peak.webp",
    ],
  },
  {
    id: "smith-machine-squat",
    name: "Smith-Machine Squat",
    group: "Legs & Glutes",
    muscles: ["Quadriceps", "Glutes", "Hamstrings"],
    equipment: "Smith machine",
    sourceAssets: [
      "classic-white/smith-machine-squat-start.webp",
      "classic-white/smith-machine-squat-peak.webp",
    ],
  },
  {
    id: "dumbbell-calf-raise",
    name: "Dumbbell Calf Raise",
    group: "Legs & Glutes",
    muscles: ["Gastrocnemius", "Soleus"],
    equipment: "Dumbbells",
    sourceAssets: [
      "classic-white/dumbbell-calf-raise-start.webp",
      "classic-white/dumbbell-calf-raise-peak.webp",
    ],
  },
  {
    id: "cable-crunch",
    name: "Cable Crunch",
    group: "Core & Conditioning",
    muscles: ["Rectus abdominis", "Obliques"],
    equipment: "Cable machine",
    sourceAssets: [
      "classic-white/cable-crunch-start.webp",
      "classic-white/cable-crunch-peak.webp",
    ],
  },
  {
    id: "mountain-climbers",
    name: "Mountain Climbers",
    group: "Core & Conditioning",
    muscles: ["Core", "Shoulders", "Hip flexors"],
    equipment: "Bodyweight",
    sourceAssets: ["animations/mountain-climbers.webp"],
    featured: true,
  },
  {
    id: "cable-external-rotation",
    name: "Cable External Rotation",
    group: "Shoulders",
    muscles: ["Rotator cuff", "Rear delts"],
    equipment: "Cable machine",
    sourceAssets: [
      "classic-white/cable-external-rotation-start.webp",
      "classic-white/cable-external-rotation-peak.webp",
    ],
  },
  {
    id: "behind-the-back-barbell-shrug",
    name: "Behind-the-Back Barbell Shrug",
    group: "Back",
    muscles: ["Trapezius", "Forearms"],
    equipment: "Barbell",
    sourceAssets: [
      "classic-white/behind-the-back-barbell-shrug-start.webp",
      "classic-white/behind-the-back-barbell-shrug-peak.webp",
    ],
  },
];

export const repdbWorkoutGroups: ExerciseWorkoutGroup[] = [
  "Chest",
  "Back",
  "Shoulders",
  "Arms",
  "Legs & Glutes",
  "Core & Conditioning",
];

export const repdbExercisesByGroup = Object.fromEntries(
  repdbWorkoutGroups.map((group) => [
    group,
    repdbExerciseLibrary.filter((exercise) => exercise.group === group),
  ]),
) as Record<ExerciseWorkoutGroup, RepdbExercise[]>;

const repdbExerciseImages: Record<string, ImageSourcePropType> = {
  "bench-press": require("../../assets/images/repdb/animations/bench-press.webp"),
  "incline-bench-press": require("../../assets/images/repdb/animations/incline-bench-press.webp"),
  "bench-dips": require("../../assets/images/repdb/classic-white/bench-dips-peak.webp"),
  "bent-arm-ez-bar-pullover": require("../../assets/images/repdb/classic-white/bent-arm-ez-bar-pullover-peak.webp"),
  "pec-deck": require("../../assets/images/repdb/classic-white/pec-deck-peak.webp"),
  "pull-up": require("../../assets/images/repdb/animations/pull-up.webp"),
  "double-kettlebell-row": require("../../assets/images/repdb/classic-white/double-kettlebell-row-peak.webp"),
  "one-arm-kettlebell-row": require("../../assets/images/repdb/classic-white/one-arm-kettlebell-row-peak.webp"),
  "smith-machine-bent-over-row": require("../../assets/images/repdb/classic-white/smith-machine-bent-over-row-peak.webp"),
  "wide-grip-seated-cable-row": require("../../assets/images/repdb/classic-white/wide-grip-seated-cable-row-peak.webp"),
  "arnold-press": require("../../assets/images/repdb/classic-white/arnold-press-peak.webp"),
  "behind-the-neck-press": require("../../assets/images/repdb/classic-white/behind-the-neck-press-peak.webp"),
  "push-press": require("../../assets/images/repdb/classic-white/push-press-peak.webp"),
  "one-arm-kettlebell-push-press": require("../../assets/images/repdb/animations/one-arm-kettlebell-push-press.webp"),
  "ez-bar-overhead-extension": require("../../assets/images/repdb/classic-white/ez-bar-overhead-extension-peak.webp"),
  "hip-thrust": require("../../assets/images/repdb/animations/hip-thrust.webp"),
  "barbell-glute-bridge": require("../../assets/images/repdb/classic-white/barbell-glute-bridge-peak.webp"),
  "banded-lateral-walk": require("../../assets/images/repdb/classic-white/banded-lateral-walk-peak.webp"),
  "bulgarian-split-squat": require("../../assets/images/repdb/classic-white/bulgarian-split-squat-peak.webp"),
  "kettlebell-deadlift": require("../../assets/images/repdb/classic-white/kettlebell-deadlift-peak.webp"),
  "smith-machine-squat": require("../../assets/images/repdb/classic-white/smith-machine-squat-peak.webp"),
  "dumbbell-calf-raise": require("../../assets/images/repdb/classic-white/dumbbell-calf-raise-peak.webp"),
  "cable-crunch": require("../../assets/images/repdb/classic-white/cable-crunch-peak.webp"),
  "mountain-climbers": require("../../assets/images/repdb/animations/mountain-climbers.webp"),
  "cable-external-rotation": require("../../assets/images/repdb/classic-white/cable-external-rotation-peak.webp"),
  "behind-the-back-barbell-shrug": require("../../assets/images/repdb/classic-white/behind-the-back-barbell-shrug-peak.webp"),
};

export function getRepdbExerciseImage(
  exerciseId: string,
): ImageSourcePropType | undefined {
  return repdbExerciseImages[exerciseId];
}
import type { ImageSourcePropType } from "react-native";

export type WorkoutCatalogKind =
  | "exercise"
  | "training-style"
  | "split"
  | "rep-range"
  | "competition"
  | "phase"
  | "nutrition"
  | "recovery";

export type WorkoutCatalogItem = {
  name: string;
  category: string;
  kind: WorkoutCatalogKind;
};

const groups: Array<[string, WorkoutCatalogKind, string]> = [
  [
    "Chest Exercises",
    "exercise",
    "Barbell Bench Press|Flat Dumbbell Bench Press|Incline Barbell Press|Incline Dumbbell Press|Decline Bench Press|Decline Dumbbell Press|Smith Machine Bench Press|Machine Chest Press|Cable Chest Press|Pec Deck Fly|Cable Fly High-to-Low|Cable Fly Low-to-High|Flat Dumbbell Fly|Incline Dumbbell Fly|Push-Up|Weighted Push-Up|Ring Push-Up|Svend Press|Guillotine Press|Landmine Chest Press",
  ],
  [
    "Back Exercises",
    "exercise",
    "Deadlift|Rack Pull|Barbell Row|Pendlay Row|T-Bar Row|Seated Cable Row|Chest Supported Row|Single Arm Dumbbell Row|Meadows Row|Machine Row|Lat Pulldown|Wide Grip Pulldown|Close Grip Pulldown|Reverse Grip Pulldown|Pull-Up|Chin-Up|Weighted Pull-Up|Straight Arm Pulldown|Inverted Row|Cable Pullover",
  ],
  [
    "Shoulder Exercises",
    "exercise",
    "Military Press|Standing Barbell Press|Seated Dumbbell Press|Arnold Press|Machine Shoulder Press|Push Press|Dumbbell Lateral Raise|Cable Lateral Raise|Leaning Lateral Raise|Front Raise|Plate Front Raise|Cable Front Raise|Reverse Pec Deck|Bent Over Rear Delt Raise|Face Pull|Upright Row|Cuban Press|Landmine Press|Single Arm Press|Y Raise",
  ],
  [
    "Biceps Exercises",
    "exercise",
    "Barbell Curl|EZ Bar Curl|Dumbbell Curl|Alternating Curl|Incline Curl|Concentration Curl|Hammer Curl|Cross Body Hammer Curl|Cable Curl|Rope Curl|Preacher Curl|Machine Curl|Spider Curl|Bayesian Curl|Reverse Curl|Zottman Curl|Drag Curl|High Cable Curl|Chin-Up Curl Focus|Wrist Curl",
  ],
  [
    "Triceps Exercises",
    "exercise",
    "Close Grip Bench Press|Skull Crusher|EZ Skull Crusher|Rope Pushdown|Straight Bar Pushdown|Reverse Grip Pushdown|Overhead Rope Extension|Single Arm Extension|Dumbbell Kickback|Overhead Dumbbell Extension|French Press|Machine Dip|Parallel Bar Dip|Bench Dip|JM Press|Tate Press|Cable Kickback|Incline Extension|Cross Body Extension|Diamond Push-Up",
  ],
  [
    "Leg Exercises",
    "exercise",
    "Back Squat|Front Squat|Hack Squat|Zercher Squat|Goblet Squat|Bulgarian Split Squat|Walking Lunge|Reverse Lunge|Step Up|Leg Press|Sissy Squat|Romanian Deadlift|Stiff Leg Deadlift|Good Morning|Leg Extension|Seated Leg Curl|Lying Leg Curl|Nordic Curl|Hip Thrust|Glute Bridge|Standing Calf Raise|Seated Calf Raise|Donkey Calf Raise|Tibialis Raise|Cable Kickback",
  ],
  [
    "Core Exercises",
    "exercise",
    "Crunch|Decline Crunch|Cable Crunch|Hanging Leg Raise|Lying Leg Raise|Reverse Crunch|Ab Wheel Rollout|Russian Twist|Bicycle Crunch|Plank|Side Plank|Mountain Climber|Hollow Hold|V-Up|Toe Touch",
  ],
  [
    "Forearms",
    "exercise",
    "Wrist Curl|Reverse Wrist Curl|Farmer Carry|Plate Pinch|Towel Pull-Up|Dead Hang|Grip Crusher|Fat Grip Curl|Reverse Curl|Wrist Roller",
  ],
  [
    "Neck",
    "exercise",
    "Neck Flexion|Neck Extension|Lateral Neck Flexion|Neck Harness Extension|Isometric Neck Hold",
  ],
  [
    "Bodybuilding Training Styles",
    "training-style",
    "Hypertrophy Training|Progressive Overload|Time Under Tension (TUT)|German Volume Training (GVT)|FST-7|Blood Flow Restriction (BFR)|Rest-Pause Training|Drop Sets|Giant Sets|Super Sets|Tri Sets|Mechanical Drop Sets|Cluster Sets|Pyramid Sets|Reverse Pyramid|Wave Loading|Forced Reps|Partial Reps|Negative Reps|Cheat Reps|Tempo Training|Occlusion Training|Isolation Training|Compound Training|High Volume Training",
  ],
  [
    "Training Splits",
    "split",
    "Full Body|Upper Lower|Push Pull Legs|Bro Split|Arnold Split|3-Day Split|4-Day Split|5-Day Split|6-Day Split|2x Muscle Frequency|Body Part Split|Antagonist Split|Strength-Hypertrophy Split|Hybrid Split|Undulating Split",
  ],
  [
    "Rep Ranges",
    "rep-range",
    "Strength (1–5 reps)|Power (3–5 reps)|Hypertrophy (6–12 reps)|Endurance (15–25 reps)|Deload Training|AMRAP|EMOM|Density Training|Volume Accumulation|Intensity Block",
  ],
  [
    "Bodybuilding Competition Categories",
    "competition",
    "Men's Bodybuilding|Classic Physique|Men's Physique|Women's Bodybuilding|Women's Physique|Figure|Bikini|Wellness|Fitness|Wheelchair Bodybuilding",
  ],
  [
    "Bodybuilding Phases",
    "phase",
    "Bulking|Lean Bulk|Clean Bulk|Dirty Bulk|Maintenance|Cutting|Contest Prep|Peak Week|Reverse Diet|Recovery Phase",
  ],
  [
    "Nutrition for Bodybuilding",
    "nutrition",
    "High Protein Diet|Carb Cycling|Flexible Dieting (IIFYM)|Clean Eating|Meal Timing|Pre-Workout Nutrition|Post-Workout Nutrition|Intra-Workout Nutrition|Refeed Day|Cheat Meal Strategy",
  ],
  [
    "Recovery",
    "recovery",
    "Active Recovery|Deload Week|Foam Rolling|Stretching|Sleep Optimization|Massage Therapy|Contrast Bath|Cold Therapy|Heat Therapy|Mobility Work",
  ],
];

export const workoutCatalogCategories = groups.map(([category]) => category);

export const workoutExerciseCatalog: WorkoutCatalogItem[] = groups.flatMap(
  ([category, kind, values]) =>
    values.split("|").map((name) => ({ name, category, kind })),
);

export const workoutCatalogByCategory = Object.fromEntries(
  groups.map(([category]) => [
    category,
    workoutExerciseCatalog.filter((item) => item.category === category),
  ]),
) as Record<string, WorkoutCatalogItem[]>;

export function parseWorkoutSessions(value: string): WorkoutCatalogItem[] {
  try {
    const parsed = JSON.parse(value || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is WorkoutCatalogItem =>
      Boolean(item && typeof item.name === "string"),
    );
  } catch {
    return [];
  }
}

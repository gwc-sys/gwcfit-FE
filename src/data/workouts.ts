import { images } from "../assets/images";
import type { Exercise, WorkoutPlan } from "../types/fitness";

export const exercises: Exercise[] = [
  {
    id: "dash-strength",
    title: "Dash Strength",
    focus: "Upper body power",
    duration: "45 min",
    calories: 220,
    image: images.mobility,
    equipment: "Cable straps, dumbbells",
    description:
      "A controlled strength block built around tension, clean tempo, and short rests.",
    steps: [
      "Warm up shoulders and hips for 5 minutes.",
      "Complete 4 rounds of strap presses and dumbbell rows.",
      "Keep two reps in reserve on every working set.",
      "Finish with slow mountain climbers and nasal breathing."
    ]
  },
  {
    id: "high-56",
    title: "High 56",
    focus: "Conditioning",
    duration: "40 min",
    calories: 260,
    image: images.high56,
    equipment: "Treadmill, kettlebell",
    description:
      "Interval work that pairs short cardio surges with lower-body strength.",
    steps: [
      "Alternate 90 second runs with 12 kettlebell deadlifts.",
      "Use a pace that feels hard but repeatable.",
      "Rest for 45 seconds after each round.",
      "Cool down with 6 minutes of easy walking."
    ]
  },
  {
    id: "mobility-flow",
    title: "Mobility",
    focus: "Range and stability",
    duration: "35 min",
    calories: 160,
    image: images.trainerEmma,
    equipment: "Mat, bands",
    description:
      "A joint-friendly flow for hips, thoracic rotation, and shoulder control.",
    steps: [
      "Start with 90/90 hip switches.",
      "Move through slow inchworms and deep squat holds.",
      "Add banded face pulls for shoulder balance.",
      "End with 3 minutes of box breathing."
    ]
  },
  {
    id: "core-plank",
    title: "Core Plank",
    focus: "Core endurance",
    duration: "30 min",
    calories: 180,
    image: images.plank,
    equipment: "Mat",
    description:
      "A no-rush core session focused on bracing, alignment, and repeatable holds.",
    steps: [
      "Hold a forearm plank for 35 seconds.",
      "Rest for 25 seconds, then repeat 5 times.",
      "Add side planks and dead bugs.",
      "Stop each hold before your lower back drops."
    ]
  }
];

export const workoutPlans: WorkoutPlan[] = [
  {
    id: "massive-upper-body",
    title: "Massive Upper Body",
    goal: "Build Muscle",
    level: "Intermediate",
    durationWeeks: 5,
    sessionsPerWeek: 4,
    heroImage: images.gymDetail,
    summary:
      "A premium hypertrophy plan with AI-adjusted volume, progressive overload, and recovery prompts.",
    exercises
  },
  {
    id: "lean-reset",
    title: "Lean Reset",
    goal: "Lose Fat",
    level: "Beginner",
    durationWeeks: 4,
    sessionsPerWeek: 3,
    heroImage: images.groupTraining,
    summary:
      "A simple fat-loss structure that blends strength circuits, walking targets, and easy meal habits.",
    exercises: [exercises[1], exercises[3], exercises[2]]
  },
  {
    id: "mobility-pro",
    title: "Mobility Pro",
    goal: "Mobility",
    level: "Expert",
    durationWeeks: 6,
    sessionsPerWeek: 5,
    heroImage: images.trainerEmma,
    summary:
      "A high-control plan for better positions, tendon resilience, and active flexibility.",
    exercises: [exercises[2], exercises[0], exercises[3]]
  }
];

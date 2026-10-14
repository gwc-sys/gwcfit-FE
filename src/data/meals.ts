import type { Meal } from "../types/fitness";

export const meals: Meal[] = [
  {
    id: "breakfast",
    title: "Protein Oats Bowl",
    time: "08:00 AM",
    calories: 430,
    protein: 34,
    carbs: 48,
    fat: 12,
    items: ["Oats", "Greek yogurt", "Blueberries", "Whey protein"]
  },
  {
    id: "lunch",
    title: "Chicken Power Plate",
    time: "01:00 PM",
    calories: 610,
    protein: 52,
    carbs: 55,
    fat: 18,
    items: ["Grilled chicken", "Brown rice", "Avocado", "Greens"]
  },
  {
    id: "snack",
    title: "Recovery Smoothie",
    time: "04:30 PM",
    calories: 280,
    protein: 28,
    carbs: 26,
    fat: 8,
    items: ["Banana", "Milk", "Peanut butter", "Creatine"]
  },
  {
    id: "dinner",
    title: "Salmon Lean Dinner",
    time: "08:00 PM",
    calories: 520,
    protein: 45,
    carbs: 34,
    fat: 22,
    items: ["Salmon", "Sweet potato", "Asparagus", "Olive oil"]
  }
];

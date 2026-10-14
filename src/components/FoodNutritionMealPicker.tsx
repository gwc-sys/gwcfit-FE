import type * as React from "react";
import { FoodNutritionMealPickerView, MacroView } from "./FoodNutritionMealPicker.presentation";
import { stylesShared, createStyles } from "./FoodNutritionMealPicker.styles";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  foodNutritionCatalog,
  foodNutritionCategories,
  type FoodNutritionItem,
} from "../data/foodNutritionCatalog";
import { useAppTheme } from "../theme/AppThemeProvider";
import type { ThemeColors } from "../theme/theme";
import { showAlert } from "../utils/appAlert";

const mealTypes = ["Breakfast", "Lunch", "Dinner", "Snack"] as const;
type MealType = (typeof mealTypes)[number];

type PlanMeal = {
  food_id: string;
  food_name: string;
  meal_type: MealType;
  servings: number;
  serving_basis: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sugar_g: number;
  categories: string[];
  main_category?: string;
  subcategory?: string;
  primary_benefit?: string;
  data_note?: string;
};

type Props = {
  value: string;
  targetCalories?: number;
  onChange: (value: string) => void;
};

const round = (value: number) => Math.round(value * 100) / 100;

function mealFromFood(
  food: FoodNutritionItem,
  mealType: MealType,
  servings = 1,
): PlanMeal {
  return {
    food_id: food.id,
    food_name: food.name,
    meal_type: mealType,
    servings,
    serving_basis: food.nutritionBasis,
    calories: round(food.calories * servings),
    protein_g: round(food.proteinG * servings),
    carbs_g: round(food.carbsG * servings),
    fat_g: round(food.fatG * servings),
    fiber_g: round(food.fiberG * servings),
    sugar_g: round(food.sugarG * servings),
    categories: food.categories,
    main_category: food.mainCategory,
    subcategory: food.subcategory,
    primary_benefit: food.primaryBenefit,
    data_note: food.dataNote,
  };
}

function parseMeals(value: string): PlanMeal[] {
  try {
    const parsed: unknown = JSON.parse(value || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((item, index) => {
      if (!item || typeof item !== "object") return [];
      const record = item as Record<string, unknown>;
      const rawMealType = String(record.meal_type ?? record.meal ?? "Lunch");
      const normalizedMealType =
        mealTypes.find(
          (type) => type.toLowerCase() === rawMealType.toLowerCase(),
        ) ?? "Lunch";
      const categories = Array.isArray(record.categories)
        ? record.categories.filter(
            (category): category is string => typeof category === "string",
          )
        : ["Existing plan"];
      return [
        {
          food_id: String(
            record.food_id ?? record.id ?? `existing-meal-${index}`,
          ),
          food_name: String(
            record.food_name ??
              record.title ??
              record.name ??
              `Existing meal ${index + 1}`,
          ),
          meal_type: normalizedMealType,
          servings: Number(record.servings ?? 1) || 1,
          serving_basis: String(record.serving_basis ?? "Per 100 g"),
          calories: Number(record.calories ?? 0) || 0,
          protein_g: Number(record.protein_g ?? record.protein ?? 0) || 0,
          carbs_g: Number(record.carbs_g ?? record.carbs ?? 0) || 0,
          fat_g: Number(record.fat_g ?? record.fat ?? 0) || 0,
          fiber_g: Number(record.fiber_g ?? record.fiber ?? 0) || 0,
          sugar_g: Number(record.sugar_g ?? record.sugar ?? 0) || 0,
          categories,
          main_category:
            typeof record.main_category === "string"
              ? record.main_category
              : undefined,
          subcategory:
            typeof record.subcategory === "string"
              ? record.subcategory
              : undefined,
          primary_benefit:
            typeof record.primary_benefit === "string"
              ? record.primary_benefit
              : undefined,
          data_note:
            typeof record.data_note === "string" ? record.data_note : undefined,
        } satisfies PlanMeal,
      ];
    });
  } catch {
    return [];
  }
}

export function useFoodNutritionMealPickerPresentation({
  value,
  targetCalories = 2000,
  onChange,
}: Props) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Foods");
  const [categoryPanelOpen, setCategoryPanelOpen] = useState(false);
  // Kept in the saved payload for backwards compatibility; the UI is one simple food list.
  const mealType: MealType = "Lunch";
  const selected = useMemo(() => parseMeals(value), [value]);
  const normalizedSearch = search.trim().toLowerCase();
  const visibleFoods = useMemo(
    () =>
      foodNutritionCatalog
        .filter(
          (food) =>
            category === "All Foods" || food.categories.includes(category),
        )
        .filter(
          (food) =>
            !normalizedSearch ||
            `${food.name} ${food.categories.join(" ")}`
              .toLowerCase()
              .includes(normalizedSearch),
        )
        .slice(0, 30),
    [category, normalizedSearch],
  );
  const totals = selected.reduce(
    (sum, meal) => ({
      calories: sum.calories + Number(meal.calories || 0),
      protein: sum.protein + Number(meal.protein_g || 0),
      carbs: sum.carbs + Number(meal.carbs_g || 0),
      fat: sum.fat + Number(meal.fat_g || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  const save = (next: PlanMeal[]) => onChange(JSON.stringify(next, null, 2));

  const showCalorieLimitMessage = (attemptedCalories: number) => {
    const limit = targetCalories || 0;
    const remaining = Math.max(0, Math.round(limit - totals.calories));
    showAlert(
      "Daily calorie limit reached",
      `This food would make the plan ${Math.round(attemptedCalories)} kcal. Your daily target is ${Math.round(limit)} kcal. Current total: ${Math.round(totals.calories)} kcal. Remaining: ${remaining} kcal.`,
      [{ text: "OK" }],
    );
  };

  const canSaveCalories = (next: PlanMeal[]) => {
    const nextCalories = next.reduce(
      (sum, meal) => sum + Number(meal.calories || 0),
      0,
    );
    if (targetCalories > 0 && nextCalories > targetCalories) {
      showCalorieLimitMessage(nextCalories);
      return false;
    }
    return true;
  };

  const addFood = (food: FoodNutritionItem) => {
    const index = selected.findIndex(
      (item) => item.food_id === food.id && item.meal_type === mealType,
    );
    if (index < 0) {
      const next = [...selected, mealFromFood(food, mealType)];
      if (canSaveCalories(next)) save(next);
      return;
    }
    const next = [...selected];
    next[index] = mealFromFood(
      food,
      mealType,
      round(next[index].servings + 0.5),
    );
    if (canSaveCalories(next)) save(next);
  };

  const changeServings = (index: number, delta: number) => {
    const current = selected[index];
    const food = foodNutritionCatalog.find(
      (item) => item.id === current.food_id,
    );
    if (!food) return;
    const servings = Math.max(0.25, round(current.servings + delta));
    const next = [...selected];
    next[index] = mealFromFood(food, current.meal_type, servings);
    if (delta <= 0 || canSaveCalories(next)) save(next);
  };

  const buildDay = () => {
    const pool = foodNutritionCatalog.filter(
      (food) =>
        (category === "All Foods" || food.categories.includes(category)) &&
        food.calories > 20,
    );
    const ranked = [...pool].sort(
      (left, right) =>
        right.proteinG * 2 +
        right.fiberG -
        right.sugarG * 0.2 -
        (left.proteinG * 2 + left.fiberG - left.sugarG * 0.2),
    );
    const picks = ranked.slice(0, 8);
    if (!picks.length) return;
    const baseCalories = picks.reduce((sum, food) => sum + food.calories, 0);
    const scale = Math.min(
      3,
      Math.max(0.5, (targetCalories || 2000) / Math.max(baseCalories, 1)),
    );
    const slots: MealType[] = [
      "Breakfast",
      "Breakfast",
      "Lunch",
      "Lunch",
      "Dinner",
      "Dinner",
      "Snack",
      "Snack",
    ];
    save(
      picks.map((food, index) =>
        mealFromFood(food, slots[index], Math.round(scale * 4) / 4),
      ),
    );
  };

  return { kind: "view1" as const, props: { styles, buildDay, targetCalories, Macro, totals, round, colors, search, setSearch, category, setCategoryPanelOpen, categoryPanelOpen, setCategory, visibleFoods, addFood, selected, changeServings, save } };
}

export function FoodNutritionMealPicker(...args: Parameters<typeof useFoodNutritionMealPickerPresentation>): React.JSX.Element {
  return <FoodNutritionMealPickerView model={useFoodNutritionMealPickerPresentation(...args)} />;
}

export function useMacroPresentation({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return { kind: "view1" as const, props: { stylesShared, color, label, value } };
}

function Macro(...args: Parameters<typeof useMacroPresentation>): React.JSX.Element {
  return <MacroView model={useMacroPresentation(...args)} />;
}





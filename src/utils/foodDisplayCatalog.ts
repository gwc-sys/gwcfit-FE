import type { FoodNutritionItem } from "../data/foodNutritionCatalog";

/** Merge repeated display entries while preserving their first ID and every filter category. */
export function foodDisplayCatalog(foods: readonly FoodNutritionItem[]): FoodNutritionItem[] {
  const names = new Map<string, FoodNutritionItem>();
  for (const food of foods) {
    const key = food.name.trim().toLowerCase();
    const existing = names.get(key);
    if (!existing) names.set(key, { ...food, categories: [...food.categories] });
    else existing.categories = Array.from(new Set([...existing.categories, ...food.categories]));
  }
  return [...names.values()];
}

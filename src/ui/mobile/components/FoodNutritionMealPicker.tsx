import { Pressable } from "./NativePressable";
import { useReducedMotion } from "react-native-reanimated";
import { controlMetrics } from "../theme/theme";
import { Ionicons } from "@expo/vector-icons";
import { Modal, ScrollView, Text, TextInput, View } from "react-native";
import { foodNutritionCatalog, foodNutritionCategories } from "../../../data/foodNutritionCatalog";
import type * as React from "react";
import type { useFoodNutritionMealPickerPresentation, useMacroPresentation } from "../../../components/FoodNutritionMealPicker";

export function FoodNutritionMealPickerView({ model }: { model: ReturnType<typeof useFoodNutritionMealPickerPresentation> }): React.ReactNode {
  const reduceMotion = useReducedMotion();
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, buildDay, targetCalories, Macro, totals, round, colors, search, setSearch, category, setCategoryPanelOpen, categoryPanelOpen, setCategory, visibleFoods, addFood, selected, changeServings, save } = model.props;
      return ((
    <View style={styles.container}>
      <View style={styles.headingRow}>
        <View style={styles.headingCopy}>
          <Text style={styles.title}>Food nutrition library</Text>
          <Text style={styles.subtitle}>
            {foodNutritionCatalog.length} foods · nutrition values per 100 g
          </Text>
        </View>
        <Pressable accessibilityRole="button" onPress={buildDay} style={styles.generateButton}>
          <Ionicons name="sparkles" size={17} color="#FFFFFF" />
          <Text style={styles.generateText}>
            Build {targetCalories || 2000} kcal day
          </Text>
        </Pressable>
      </View>

      <View style={styles.summary}>
        <Macro
          label="Calories"
          value={`${Math.round(totals.calories)} kcal`}
          color="#F59E0B"
        />
        <Macro
          label="Protein"
          value={`${round(totals.protein)} g`}
          color="#22C55E"
        />
        <Macro
          label="Carbs"
          value={`${round(totals.carbs)} g`}
          color="#38BDF8"
        />
        <Macro label="Fat" value={`${round(totals.fat)} g`} color="#64D2FF" />
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={19} color={colors.muted} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search food, cuisine or diet type"
          placeholderTextColor={colors.subtle}
          style={styles.searchInput}
        />
        {search ? (
          <Pressable accessibilityRole="button" onPress={() => setSearch("")} accessibilityLabel={"Clear search"} style={{ minWidth: controlMetrics.minimumTouchSize, minHeight: controlMetrics.minimumTouchSize, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="close-circle" size={19} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Food category, ${category}`}
        onPress={() => setCategoryPanelOpen(true)}
        style={styles.categorySelector}
      >
        <View style={styles.categorySelectorIcon}>
          <Ionicons name="options-outline" size={18} color={colors.primary} />
        </View>
        <View style={styles.categorySelectorCopy}>
          <Text style={styles.categorySelectorLabel}>Food category</Text>
          <Text style={styles.categorySelectorValue}>{category}</Text>
        </View>
        <View style={styles.categoryCount}>
          <Text style={styles.categoryCountText}>
            {foodNutritionCategories.length + 1}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={18} color={colors.muted} />
      </Pressable>

      <Modal
        animationType={reduceMotion ? "none" : "fade"}
        transparent
        visible={categoryPanelOpen}
        onRequestClose={() => setCategoryPanelOpen(false)}
      >
        <Pressable accessibilityRole="button"
          style={styles.categoryBackdrop}
          onPress={() => setCategoryPanelOpen(false)}
        >
          <Pressable accessibilityRole="button" onPress={() => undefined} style={styles.categoryPanel}>
            <View style={styles.categoryPanelHeader}>
              <View style={styles.categoryPanelTitleRow}>
                <View style={styles.categoryPanelIcon}>
                  <Ionicons
                    name="restaurant-outline"
                    size={21}
                    color={colors.primary}
                  />
                </View>
                <View>
                  <Text style={styles.categoryPanelTitle}>
                    Choose food category
                  </Text>
                  <Text style={styles.categoryPanelSubtitle}>
                    Filter foods by cuisine or diet type
                  </Text>
                </View>
              </View>
              <Pressable accessibilityRole="button"
                accessibilityLabel="Close categories"
                onPress={() => setCategoryPanelOpen(false)}
                style={styles.categoryClose}
              >
                <Ionicons name="close" size={20} color={colors.ink} />
              </Pressable>
            </View>
            <ScrollView
              contentContainerStyle={styles.categoryGrid}
              showsVerticalScrollIndicator
            >
              {["All Foods", ...foodNutritionCategories].map((item) => {
                const active = category === item;
                return (
                  <Pressable accessibilityRole="button"
                    key={item}
                    onPress={() => {
                      setCategory(item);
                      setCategoryPanelOpen(false);
                    }}
                    style={[
                      styles.categoryOption,
                      active && styles.categoryOptionActive,
                    ]}
                  >
                    <View
                      style={[
                        styles.categoryRadio,
                        active && styles.categoryRadioActive,
                      ]}
                    >
                      {active ? (
                        <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                      ) : null}
                    </View>
                    <Text
                      style={[
                        styles.categoryOptionText,
                        active && styles.categoryOptionTextActive,
                      ]}
                    >
                      {item}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      <View style={styles.foodGrid}>
        {visibleFoods.map((food) => (
          <View key={food.id} style={styles.foodCard}>
            <View style={styles.foodTitleRow}>
              <Text numberOfLines={2} style={styles.foodName}>
                {food.name}
              </Text>
              <Pressable accessibilityRole="button"
                accessibilityLabel={`Add ${food.name}`}
                onPress={() => addFood(food)}
                style={styles.addButton}
              >
                <Ionicons name="add" size={19} color="#FFFFFF" />
              </Pressable>
            </View>
            <Text style={styles.calories}>{food.calories} kcal</Text>
            <Text style={styles.macros}>
              P {food.proteinG}g C {food.carbsG}g F {food.fatG}g
            </Text>
            <Text numberOfLines={1} style={styles.tags}>
              {food.mainCategory} · {food.subcategory}
            </Text>
            <Text numberOfLines={1} style={styles.benefit}>
              {food.primaryBenefit}
            </Text>
          </View>
        ))}
      </View>
      <Text style={styles.resultNote}>
        Showing {visibleFoods.length} matching foods. Refine the search to find
        any food in the full catalog.
      </Text>

      {selected.length ? (
        <View style={styles.planBlock}>
          <View style={styles.planHeader}>
            <Text style={styles.title}>Daily meal plan</Text>
            <Text style={styles.planCount}>{selected.length} foods</Text>
          </View>
          <View style={styles.mealGroup}>
            {selected.map((item, index) => (
              <View
                key={`${item.meal_type}-${item.food_id}-${index}`}
                style={styles.selectedRow}
              >
                <View style={styles.selectedCopy}>
                  <Text numberOfLines={1} style={styles.selectedName}>
                    {item.food_name}
                  </Text>
                  <Text style={styles.selectedMeta}>
                    {Math.round(item.calories)} kcal · {item.protein_g}g protein
                  </Text>
                </View>
                <View style={styles.stepper}>
                  <Pressable accessibilityRole="button"
                    onPress={() => changeServings(index, -0.25)}
                    style={styles.stepButton}
                   accessibilityLabel={"Decrease servings"}>
                    <Ionicons name="remove" size={15} color={colors.ink} />
                  </Pressable>
                  <Text style={styles.servings}>{item.servings}x</Text>
                  <Pressable accessibilityRole="button"
                    onPress={() => changeServings(index, 0.25)}
                    style={styles.stepButton}
                   accessibilityLabel={"Increase servings"}>
                    <Ionicons name="add" size={15} color={colors.ink} />
                  </Pressable>
                </View>
                <Pressable accessibilityRole="button"
                  accessibilityLabel={`Remove ${item.food_name}`}
                  onPress={() =>
                    save(
                      selected.filter(
                        (_, selectedIndex) => selectedIndex !== index,
                      ),
                    )
                  }
                  style={styles.removeButton}
                >
                  <Ionicons name="trash-outline" size={17} color="#F87171" />
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      ) : (
        <Text style={styles.empty}>
          Add foods or generate a full day automatically.
        </Text>
      )}
      <Text style={styles.basisNote}>
        Nutrition values are calculated per 100 g and scale with the serving
        multiplier.
      </Text>
    </View>
  ));
    }
  }
}

export function MacroView({ model }: { model: ReturnType<typeof useMacroPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { stylesShared, color, label, value } = model.props;
      return ((
    <View style={stylesShared.macro}>
      <View style={[stylesShared.dot, { backgroundColor: color }]} />
      <View>
        <Text style={stylesShared.macroLabel}>{label}</Text>
        <Text style={stylesShared.macroValue}>{value}</Text>
      </View>
    </View>
  ));
    }
  }
}

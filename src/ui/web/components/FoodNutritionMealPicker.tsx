import { useState } from "react";
import { createBasketStyles } from "../styles/components/FoodNutritionMealPicker.styles";
import { FoodIcon } from "../../../components/FoodIcon";
import { foodDisplayName } from "../../../utils/foodNames";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { foodNutritionCatalog, foodNutritionCategories } from "../../../data/foodNutritionCatalog";
import type * as React from "react";
import type { useFoodNutritionMealPickerPresentation, useMacroPresentation } from "../../../components/FoodNutritionMealPicker";

export function FoodNutritionMealPickerView({ model }: { model: ReturnType<typeof useFoodNutritionMealPickerPresentation> }): React.ReactNode {
  const [pickerWidth, setPickerWidth] = useState(0);
  const sideBySide = pickerWidth >= 800;
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { foodCount, simpleFoods, styles, buildDay, colors, search, setSearch, category, setCategory, visibleFoods, addFood, selected, changeServings, save } = model.props;
      const basketStyles = createBasketStyles(colors);
      return ((
    <View style={styles.container} onLayout={event => setPickerWidth(event.nativeEvent.layout.width)}>
      <View style={styles.headingRow}>
        <View style={styles.headingCopy}>
          <Text style={{ color: colors.muted, fontSize: 13, fontWeight: "600", letterSpacing: 0.8 }}>03 / DAILY NUTRITION</Text>
          <Text accessibilityRole="header" style={styles.title}>Choose your foods</Text>
          <Text style={styles.subtitle}>
            {foodCount} foods / choose foods to add
          </Text>
        </View>
        {!simpleFoods ? <Pressable accessibilityRole="button" onPress={buildDay} style={styles.generateButton}>
          <Ionicons name="sparkles" size={17} color="#FFFFFF" />
          <Text style={styles.generateText}>
            Auto-build day
          </Text>
        </Pressable> : null}
      </View>

      <View style={[basketStyles.browserLayout, { flexDirection: sideBySide ? "row" : "column-reverse" }]} >
      <View style={basketStyles.catalog}>
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={19} color={colors.muted} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search foods"
          accessibilityLabel="Search foods"
          placeholderTextColor={colors.subtle}
          style={styles.searchInput}
        />
        {search ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Clear food search" onPress={() => setSearch("")} style={styles.addButton}>
            <Ionicons name="close-circle" size={19} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
        {["All Foods", ...foodNutritionCategories].map(item => <Pressable key={item} accessibilityRole="button" accessibilityState={{ selected: category === item }} onPress={() => setCategory(item)} style={{ minHeight: 44, paddingHorizontal: 16, justifyContent: "center", borderRadius: 22, backgroundColor: category === item ? colors.ink : colors.surface }}><Text style={{ color: category === item ? colors.background : colors.muted, fontSize: 14, fontWeight: "600" }}>{item}</Text></Pressable>)}
      </ScrollView>

      <View style={styles.foodGrid}>
        {!visibleFoods.length ? <Text style={{ width: "100%", color: colors.muted, padding: 20, fontSize: 15 }}>No foods match. Try a different search or category.</Text> : null}
        {visibleFoods.map((food) => (
          <View key={food.id} style={styles.foodCard}>
            <FoodIcon name={food.name} category={food.mainCategory} subcategory={food.subcategory} />
            <Text style={styles.foodName}>{foodDisplayName(food.name)}</Text>
            <Pressable accessibilityRole="button" accessibilityLabel={`Add ${foodDisplayName(food.name)}`} onPress={() => addFood(food)} style={styles.addButton}>
              <Ionicons name="add-circle" size={26} color={colors.primary} />
            </Pressable>
          </View>
        ))}
      </View>
      <Text style={styles.resultNote}>
        Showing {visibleFoods.length} matching foods. Refine the search to find
        any food in the full catalog.
      </Text>

      </View>
      <View style={[basketStyles.basket, sideBySide && { width: 300, alignSelf: "flex-start" }]}>
        <View style={basketStyles.basketHeading}>
          <Ionicons name="basket-outline" size={24} color={colors.primary} />
          <Text accessibilityRole="header" style={basketStyles.basketTitle}>Food basket</Text>
        </View>
        <Text accessibilityLiveRegion="polite" style={basketStyles.basketCount}>
          {selected.length} {selected.length === 1 ? "food" : "foods"} added
        </Text>
        {selected.length ? (
          <View style={styles.mealGroup}>
            {selected.map((item, index) => (
              <View
                key={`${item.meal_type}-${item.food_id}-${index}`}
                style={styles.selectedRow}
              >
                <View style={styles.selectedCopy}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <FoodIcon name={item.food_name} category={item.main_category} subcategory={item.subcategory} size={36} />
                    <Text style={[styles.selectedName, { flex: 1 }]}>{foodDisplayName(item.food_name)}</Text>
                  </View>
                </View>
                <View style={styles.stepper}>
                  <Pressable accessibilityRole="button"
                    accessibilityLabel={`Decrease servings of ${item.food_name}`} onPress={() => changeServings(index, -0.25)}
                    style={styles.stepButton}
                  >
                    <Ionicons name="remove" size={15} color={colors.ink} />
                  </Pressable>
                  <Text style={styles.servings}>{item.servings}x</Text>
                  <Pressable accessibilityRole="button"
                    accessibilityLabel={`Increase servings of ${item.food_name}`} onPress={() => changeServings(index, 0.25)}
                    style={styles.stepButton}
                  >
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
      ) : (
        <Text style={styles.empty}>
          Your basket is empty. Tap + on a food to add it.
        </Text>
      )}
      </View>
      </View>
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
        <Text style={[stylesShared.macroValue, { color }]}>{value}</Text>
      </View>
    </View>
  ));
    }
  }
}

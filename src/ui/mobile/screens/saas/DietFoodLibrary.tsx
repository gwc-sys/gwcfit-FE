import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { foodNutritionCatalog, foodNutritionCategories } from "../../../../data/foodNutritionCatalog";
import { foodDisplayName } from "../../../../utils/foodNames";
import { useAppTheme } from "../../../../theme/AppThemeProvider";
import { Screen } from "../../components/Screen";
import { ScreenHeader } from "../../components/ScreenHeader";
import { Pressable } from "../../components/NativePressable";

export function DietFoodLibrary({ onPlans }: { onPlans: () => void }) {
  const { colors: c } = useAppTheme();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [expandedFood, setExpandedFood] = useState<string | null>(null);
  const foods = useMemo(() => {
    const term = search.trim().toLowerCase();
    return foodNutritionCatalog.filter(food => (category === "All" || food.mainCategory === category) && `${foodDisplayName(food.name)} ${food.mainCategory} ${food.subcategory}`.toLowerCase().includes(term));
  }, [search, category]);
  return <Screen noPadding reference={false} contentContainerStyle={s.screen}>
    <View style={{ gap: 4 }}><Text accessibilityRole="header" style={{ color: c.ink, fontSize: 34, lineHeight: 41, fontWeight: "700" }}>Nutrition</Text><Text style={{ color: c.muted, fontSize: 15, lineHeight: 22 }}>Find foods for your next plan.</Text></View>
    <View style={{ flexDirection: "row", gap: 4 }}><View style={[s.mode, { backgroundColor: c.surfaceStrong }]}><Text style={{ color: c.ink, fontSize: 15, fontWeight: "600" }}>Food library</Text></View><Pressable accessibilityRole="button" onPress={onPlans} style={[s.mode, { backgroundColor: c.surface }]}><Text style={{ color: c.muted, fontSize: 15 }}>Created plans</Text></Pressable></View>
    <View style={[s.search, { backgroundColor: c.surface }]}><Ionicons name="search" size={19} color={c.muted} /><TextInput accessibilityLabel="Search all foods" placeholder="Search foods" placeholderTextColor={c.muted} value={search} onChangeText={setSearch} autoCorrect={false} style={[s.input, { color: c.ink }]} />{search ? <Pressable accessibilityRole="button" accessibilityLabel="Clear food search" onPress={() => setSearch("")} style={s.clear}><Ionicons name="close-circle" size={19} color={c.muted} /></Pressable> : null}</View>
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}><Text accessibilityLiveRegion="polite" style={[s.hint, { color: c.muted }]}>{foods.length} foods / per 100 g</Text><Pressable accessibilityRole="button" accessibilityLabel="Choose food category" onPress={() => setCategoriesOpen(true)} style={s.plans}><Text style={{ color: c.primary, fontSize: 14 }}>{category === "All" ? "All categories" : category}</Text><Ionicons name="chevron-down" size={15} color={c.primary} /></Pressable></View>
    <Modal visible={categoriesOpen} transparent animationType="slide" onRequestClose={() => setCategoriesOpen(false)}><View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" }}><View accessibilityViewIsModal style={{ backgroundColor: c.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 32, maxHeight: "75%" }}><View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}><Text accessibilityRole="header" style={{ color: c.ink, fontSize: 22, fontWeight: "600" }}>Food category</Text><Pressable accessibilityRole="button" accessibilityLabel="Close food categories" onPress={() => setCategoriesOpen(false)} style={s.clear}><Ionicons name="close" size={23} color={c.primary} /></Pressable></View><ScrollView>{["All", ...foodNutritionCategories].map(value => <Pressable key={value} accessibilityRole="radio" accessibilityState={{ checked: category === value }} onPress={() => { setCategory(value); setCategoriesOpen(false); }} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14, minHeight: 48, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.border }}><Text style={{ color: c.ink, fontSize: 17 }}>{value}</Text>{category === value ? <Ionicons name="checkmark" size={21} color={c.primary} /> : null}</Pressable>)}</ScrollView></View></View></Modal>
    <FlatList key={`${category}:${search}`} data={foods} keyExtractor={food => food.id} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={s.list} renderItem={({ item }) => <View style={[s.food, { borderBottomColor: c.border }]}>
      <Pressable accessibilityRole="button" accessibilityLabel={`${foodDisplayName(item.name)}, ${item.calories} calories per 100 grams. Show nutrition`} accessibilityState={{ expanded: expandedFood === item.id }} onPress={() => setExpandedFood(expandedFood === item.id ? null : item.id)} style={s.row}>
        <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: c.primarySoft, justifyContent: "center", alignItems: "center" }}><Ionicons name="leaf-outline" size={19} color={c.primary} /></View>
        <View style={{ flex: 1, minWidth: 0, gap: 3 }}><Text style={[s.name, { color: c.ink }]}>{foodDisplayName(item.name)}</Text><Text style={[s.hint, { color: c.muted }]}>{item.subcategory}</Text></View>
        <View style={{ alignItems: "flex-end", gap: 2 }}><Text style={[s.calories, { color: c.ink }]}>{item.calories}</Text><Text style={{ color: c.muted, fontSize: 12 }}>kcal</Text></View><Ionicons name={expandedFood === item.id ? "chevron-up" : "chevron-down"} size={15} color={c.muted} />
      </Pressable>
      {expandedFood === item.id ? <View style={[s.macros, { borderTopColor: c.border }]}>{[["Protein", item.proteinG], ["Carbs", item.carbsG], ["Fat", item.fatG]].map(([label, value]) => <View key={label} style={s.macro}><Text style={{ color: c.ink, fontSize: 15, fontWeight: "500" }}>{value} g</Text><Text style={{ color: c.muted, fontSize: 12 }}>{label}</Text></View>)}</View> : null}
    </View>} ListEmptyComponent={<View style={s.empty}><Text style={[s.name, { color: c.ink }]}>No matching foods</Text><Text style={[s.hint, { color: c.muted }]}>Try another name or choose All.</Text></View>} ListFooterComponent={<Text style={[s.hint, { color: c.muted }]}>Nutrition values are approximate and vary by preparation.</Text>} />
  </Screen>;
}

const s = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 20, paddingTop: 16, gap: 12 },
  mode: { flex: 1, minHeight: 44, padding: 8, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  plans: { flexDirection: "row", alignItems: "center", gap: 6, minHeight: 44, alignSelf: "flex-start" },
  search: { flexDirection: "row", alignItems: "center", gap: 10, paddingLeft: 12, paddingRight: 4, borderRadius: 12 },
  input: { flex: 1, minWidth: 0, minHeight: 48, fontSize: 17, paddingVertical: 10 },
  clear: { minHeight: 44, minWidth: 44, alignItems: "center", justifyContent: "center" },
  categories: { gap: 8 },
  category: { minHeight: 44, paddingHorizontal: 16, paddingVertical: 10, justifyContent: "center", borderRadius: 22 },
  hint: { fontSize: 13, lineHeight: 19 },
  list: { paddingBottom: 28 },
  food: { paddingVertical: 14, gap: 6, borderBottomWidth: StyleSheet.hairlineWidth },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  name: { flex: 1, fontSize: 17, lineHeight: 23, fontWeight: "600" },
  calories: { fontSize: 14, fontWeight: "600" },
  macros: { flexDirection: "row", gap: 12, marginTop: 8, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth },
  macro: { flex: 1, gap: 3 },
  empty: { gap: 8, paddingVertical: 24 }
});

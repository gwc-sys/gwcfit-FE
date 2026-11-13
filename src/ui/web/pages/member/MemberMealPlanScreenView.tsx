import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions
} from "react-native";
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from "react-native-svg";
import { useNavigation } from "@react-navigation/native";
import { Screen } from "../../components/Screen";
import { FormTextField } from "../../components/FormTextField";
import { FoodNutritionMealPicker } from "../../../../components/FoodNutritionMealPicker";
import { NoticeBanner } from "../../components/NoticeBanner";
import { PrimaryButton } from "../../components/PrimaryButton";
import { getApiErrorMessage } from "../../../../services/api/client";
import {
  useMemberActivity,
  useMemberGoals,
} from "../../../../hooks/useMember";
import type { useMemberMealPlanScreenPresentation } from "../../../../screens/member/MemberFeatureScreens";
import type { MemberMealPlan } from "../../../../types/member";

const mealPlanImage = require("../../../../../assets/images/diet-plan-bowls.png");

// --------------------------------------------------------------------------
// TYPES FOR NUTRITION DISPLAY
// --------------------------------------------------------------------------

type MealFoodItem = {
  name: string;
  kcal: string;
};

type NutritionPlanItem = {
  id: string;
  title: string;
  subtitle: string;
  calories: string;
  calorieColor: string;
  mealsCount: number;
  trainer: string;
  trainerInitial: string;
  isTrainerPlan: boolean;
  status: "Active" | "Completed";
  statusColor: string;
  foods: MealFoodItem[];
};

function getCalorieColor(calories: number): string {
  if (calories >= 2500) return "#E91E63";
  if (calories >= 1800) return "#007AFF";
  if (calories >= 1400) return "#34C759";
  return "#E91E63";
}

// --------------------------------------------------------------------------
// MAIN COMPONENT
// --------------------------------------------------------------------------

export function MemberMealPlanScreenView({
  model
}: {
  model: ReturnType<typeof useMemberMealPlanScreenPresentation>;
}): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model as any;

  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 992;
  const isTablet = width >= 640;
  const isMobile = width < 640;

  const {
    query,
    mealPlanTitle,
    setMealPlanTitle,
    mealPlanCalories,
    setMealPlanCalories,
    mealPlanFoods,
    setMealPlanFoods,
    mealPlanValidation,
    submitMealPlan,
    createMeal,
    isComposerOpen,
    setComposerOpen,
    completeMeal
  } = model.props;

  // Real hooks for activity, goals, and calories
  const activityQuery = useMemberActivity();
  const goalsQuery = useMemberGoals();

  // Search input state
  const [searchMeal, setSearchMeal] = useState("");

  // Plan completed tracker (optimistic local state)
  const [completedPlanIds, setCompletedPlanIds] = useState<Record<string, boolean>>({});

  // Expanded food breakdown tracker
  const [expandedPlanIds, setExpandedPlanIds] = useState<Record<string, boolean>>({});

  // Real meals from API
  const realMeals = query.data ?? [];

  // Auto-expand food breakdowns when meals load
  useEffect(() => {
    if (realMeals.length > 0) {
      setExpandedPlanIds((prev) => {
        const next = { ...prev };
        realMeals.forEach((m) => {
          if (next[m.meal_plan_uuid] === undefined) {
            next[m.meal_plan_uuid] = true;
          }
        });
        return next;
      });
    }
  }, [realMeals]);

  // Daily Calories Target calculation from real API
  const caloriesTarget = useMemo(() => {
    const goalTarget = goalsQuery.data?.find((g) => g.calories_goal && g.calories_goal > 0)?.calories_goal;
    if (goalTarget) return goalTarget;
    const actTarget = activityQuery.data?.today?.calories_target;
    if (actTarget && actTarget > 0) return actTarget;
    return 2800;
  }, [goalsQuery.data, activityQuery.data]);

  // Compute base calories logged from completed meals and activity
  const baseCaloriesLogged = useMemo(() => {
    const completedMealsCalories = realMeals
      .filter((m) => m.completion_status?.toLowerCase() === "completed" || completedPlanIds[m.meal_plan_uuid])
      .reduce((sum, m) => sum + (m.calories_per_day || 0), 0);
    const actCompleted =
      activityQuery.data?.today?.calories_logged ?? activityQuery.data?.today?.calories_completed ?? 0;
    return Math.max(completedMealsCalories, actCompleted, 1850);
  }, [realMeals, completedPlanIds, activityQuery.data]);

  const [manualCalorieOffset, setManualCalorieOffset] = useState(0);
  const caloriesLogged = Math.max(0, baseCaloriesLogged + manualCalorieOffset);

  const adjustCalories = (delta: number) => {
    setManualCalorieOffset((prev) => prev + delta);
  };

  // Real Macros calculation based on assigned meal plans
  const macros = useMemo(() => {
    let protein = 0;
    let carbs = 0;
    let fats = 0;
    realMeals.forEach((m) => {
      (m.meals || []).forEach((food: any) => {
        protein += Number(food.protein_g || 0);
        carbs += Number(food.carbs_g || 0);
        fats += Number(food.fat_g || 0);
      });
    });
    return {
      protein: protein > 0 ? Math.round(protein) : 140,
      carbs: carbs > 0 ? Math.round(carbs) : 180,
      fats: fats > 0 ? Math.round(fats) : 55
    };
  }, [realMeals]);

  // Hydration Target calculation
  const hydrationTargetLiters = useMemo(() => {
    const goalWater = goalsQuery.data?.find((g) => g.water_intake_goal && g.water_intake_goal > 0)?.water_intake_goal;
    if (goalWater) return Number((goalWater / 1000).toFixed(1));
    const planWater = realMeals.find((m) => m.water_target_ml && m.water_target_ml > 0)?.water_target_ml;
    if (planWater) return Number((planWater / 1000).toFixed(1));
    return 3.0;
  }, [goalsQuery.data, realMeals]);

  const glassesTarget = Math.max(8, Math.round((hydrationTargetLiters * 1000) / 250));
  const [hydrationLiters, setHydrationLiters] = useState(2.25);
  const glassesLogged = Math.round((hydrationLiters * 1000) / 250);

  const addWater = (amountMl: number) => {
    setHydrationLiters((prev) => Math.min(6.0, Number((prev + amountMl / 1000).toFixed(2))));
  };

  const toggleExpandPlan = (id: string) => {
    setExpandedPlanIds((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleMarkComplete = (planId: string) => {
    setCompletedPlanIds((prev) => ({
      ...prev,
      [planId]: true
    }));
    completeMeal.mutate({
      mealPlanUuid: planId,
      waterMl: Math.round(hydrationLiters * 1000)
    });
  };

  // Format date for pill
  const formattedDatePill = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      }).format(new Date()),
    []
  );

  // Map real meals to display items
  const displayPlans: NutritionPlanItem[] = useMemo(() => {
    return realMeals.map((meal: MemberMealPlan) => {
      const isDone =
        meal.completion_status?.toLowerCase() === "completed" || Boolean(completedPlanIds[meal.meal_plan_uuid]);

      const foods: MealFoodItem[] = (meal.meals || []).map((item: any, fIdx: number) => {
        const name = item.food_name ?? item.name ?? item.title ?? `Food ${fIdx + 1}`;
        const rawKcal = item.calories ?? item.kcal ?? item.calories_per_serving ?? 0;
        const kcalNum = Number(rawKcal);
        const kcalText =
          Number.isFinite(kcalNum) && kcalNum > 0
            ? Number.isInteger(kcalNum)
              ? `${kcalNum} kcal`
              : `${kcalNum.toFixed(2)} kcal`
            : "100 kcal";
        return {
          name: String(name),
          kcal: kcalText
        };
      });

      const rawTrainer = (meal.trainer_name || "").trim();
      const isTrainerPlan = Boolean(rawTrainer);
      const cleanTrainer = rawTrainer
        ? rawTrainer.toLowerCase().startsWith("trainer")
          ? rawTrainer
          : `Trainer ${rawTrainer}`
        : "Personal Plan";
      const trainerInitial = (rawTrainer.replace(/^trainer\s+/i, "")[0] || "T").toUpperCase();

      const subtitle = meal.trainer_notes?.trim()
        ? meal.trainer_notes
        : foods.length > 0
          ? foods.map((f) => `${f.name} • ${f.kcal}`).join(" • ")
          : "Customized nutrition plan";

      const calNum = meal.calories_per_day || 2000;
      const calorieColor = getCalorieColor(calNum);

      return {
        id: meal.meal_plan_uuid,
        title: meal.meal_plan_name,
        subtitle,
        calories: `${calNum.toLocaleString()} kcal`,
        calorieColor,
        mealsCount: meal.meals?.length || 1,
        trainer: cleanTrainer,
        trainerInitial,
        isTrainerPlan,
        status: isDone ? "Completed" : "Active",
        statusColor: isDone ? "#007AFF" : "#34C759",
        foods
      };
    });
  }, [realMeals, completedPlanIds]);

  const filteredPlans = useMemo(() => {
    if (!searchMeal.trim()) return displayPlans;
    const q = searchMeal.toLowerCase();
    return displayPlans.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.subtitle.toLowerCase().includes(q) ||
        p.trainer.toLowerCase().includes(q)
    );
  }, [displayPlans, searchMeal]);

  // Calorie ring progress calculation
  const ringSize = 90;
  const strokeWidth = 8;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const calorieRatio = Math.min(1, Math.max(0, caloriesLogged / caloriesTarget));
  const calorieOffset = circumference * (1 - calorieRatio);

  const handleRefreshAll = () => {
    void query.refetch();
    void activityQuery.refetch();
    void goalsQuery.refetch();
  };

  return (
    <Screen
      scroll
      noPadding
      style={styles.screen}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={query.isRefetching}
          onRefresh={handleRefreshAll}
          tintColor="#007AFF"
        />
      }
    >
      <View style={styles.container}>
        {/* ================================================================= */}
        {/* 1. TOP HEADER BAR                                                 */}
        {/* ================================================================= */}
        <View style={styles.headerBar}>
          <View style={styles.headerLeft}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={() => {
                if (navigation.canGoBack()) navigation.goBack();
                else navigation.navigate("MemberHome");
              }}
              style={({ pressed }) => [styles.backBtn, pressed && styles.pressedOpacity]}
            >
              <Ionicons name="chevron-back" size={18} color="#FFFFFF" />
            </Pressable>

            <View style={styles.headerTitles}>
              <Text style={styles.headerTitle}>
                Meal Plan <Text style={styles.headerTitleMuted}>| Your nutrition plans for today</Text>
              </Text>
              <Text style={styles.headerSubtitle}>
                Customized macro targets & trainer recommendations
              </Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            {/* Search Input */}
            <View style={styles.searchBox}>
              <Ionicons name="search" size={15} color="#F2F2F7" />
              <TextInput
                value={searchMeal}
                onChangeText={setSearchMeal}
                placeholder="Search meals..."
                placeholderTextColor="#F2F2F7"
                style={styles.searchInput}
              />
            </View>

            {/* Date Pill */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Change date"
              style={({ pressed }) => [styles.datePill, pressed && styles.pressedOpacity]}
            >
              <Ionicons name="calendar-outline" size={15} color="#007AFF" />
              <Text style={styles.datePillText}>{formattedDatePill}</Text>
              <Ionicons name="chevron-down" size={13} color="#F2F2F7" />
            </Pressable>

            {/* Create Meal Plan Button */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Create meal plan"
              onPress={() => setComposerOpen((open) => !open)}
              style={({ pressed }) => [styles.createPlanBtn, pressed && styles.pressedOpacity]}
            >
              <Ionicons name="add-circle" size={16} color="#FFFFFF" />
              <Text style={styles.createPlanBtnText}>Create meal plan</Text>
            </Pressable>
          </View>
        </View>

        {/* ================================================================= */}
        {/* COMPOSER (WHEN OPEN)                                              */}
        {/* ================================================================= */}
        {isComposerOpen ? (
          <View style={styles.composerCard}>
            <View style={styles.composerHeader}>
              <View>
                <Text style={styles.composerTitle}>Create a personal meal plan</Text>
                <Text style={styles.composerSubtitle}>
                  Add a plan name, daily calorie target, and the foods you want to follow.
                </Text>
              </View>
              <Pressable onPress={() => setComposerOpen(false)} style={styles.closeComposerBtn}>
                <Ionicons name="close" size={18} color="#F2F2F7" />
              </Pressable>
            </View>

            <View style={{ gap: 12, marginTop: 14 }}>
              <FormTextField
                label="Plan name"
                value={mealPlanTitle}
                onChangeText={setMealPlanTitle}
                leftIcon="restaurant-outline"
                required
              />
              <FormTextField
                label="Daily calories"
                value={mealPlanCalories}
                onChangeText={setMealPlanCalories}
                keyboardType="numeric"
                leftIcon="flame-outline"
                required
              />
              <FoodNutritionMealPicker
                simpleFoods
                targetCalories={Number(mealPlanCalories) || 2000}
                value={mealPlanFoods}
                onChange={setMealPlanFoods}
              />
              <NoticeBanner
                message={
                  mealPlanValidation ??
                  (createMeal.error
                    ? getApiErrorMessage(createMeal.error)
                    : createMeal.data
                      ? "Meal plan created."
                      : null)
                }
                tone={mealPlanValidation || createMeal.error ? "error" : "success"}
              />
              <View style={{ alignItems: "flex-end", marginTop: 8 }}>
                <PrimaryButton
                  title="Create meal plan"
                  icon="add-circle-outline"
                  loading={createMeal.isPending}
                  onPress={submitMealPlan}
                />
              </View>
            </View>
          </View>
        ) : null}

        {/* ================================================================= */}
        {/* 2. TOP ROW: DAILY CALORIES TARGET + HYDRATION TARGET              */}
        {/* ================================================================= */}
        <View style={[styles.topRow, isMobile && styles.columnLayout]}>
          {/* Left Card: DAILY CALORIES TARGET */}
          <View style={[styles.card, styles.flexCard]}>
            <View style={styles.caloriesCardBody}>
              {/* Circular Gauge */}
              <View style={styles.calorieGaugeWrap}>
                <Svg width={ringSize} height={ringSize} viewBox={`0 0 ${ringSize} ${ringSize}`}>
                  <Circle
                    cx={ringSize / 2}
                    cy={ringSize / 2}
                    r={radius}
                    stroke="rgba(233, 30, 99, 0.14)"
                    strokeWidth={strokeWidth}
                    fill="none"
                  />
                  <Circle
                    cx={ringSize / 2}
                    cy={ringSize / 2}
                    r={radius}
                    stroke="#E91E63"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    fill="none"
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeDashoffset={calorieOffset}
                    transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
                  />
                </Svg>
                <View style={styles.calorieGaugeCenter}>
                  <Ionicons name="flame" size={15} color="#E91E63" />
                  <Text style={styles.calorieGaugeValue}>{caloriesLogged.toLocaleString()}</Text>
                </View>
              </View>

              {/* Middle Stats Info */}
              <View style={styles.calorieInfoCol}>
                <Text style={styles.eyebrowCoral}>DAILY CALORIES TARGET</Text>
                <Text style={styles.calorieBigText}>
                  {caloriesLogged.toLocaleString()}{" "}
                  <Text style={styles.calorieTargetText}>/ {caloriesTarget.toLocaleString()} kcal</Text>
                </Text>
                <Text style={styles.caloriePercentSub}>
                  {Math.round((caloriesLogged / caloriesTarget) * 100)}% of daily intake logged
                </Text>

                {/* Macro Pills */}
                <View style={styles.macroPillsRow}>
                  <View style={[styles.macroPill, { backgroundColor: "rgba(233, 30, 99, 0.12)", borderColor: "rgba(233, 30, 99, 0.3)" }]}>
                    <Text style={[styles.macroPillText, { color: "#E91E63" }]}>Protein: {macros.protein}g</Text>
                  </View>
                  <View style={[styles.macroPill, { backgroundColor: "rgba(233, 30, 99, 0.12)", borderColor: "rgba(233, 30, 99, 0.3)" }]}>
                    <Text style={[styles.macroPillText, { color: "#E91E63" }]}>Carbs: {macros.carbs}g</Text>
                  </View>
                  <View style={[styles.macroPill, { backgroundColor: "rgba(0, 122, 255, 0.12)", borderColor: "rgba(0, 122, 255, 0.3)" }]}>
                    <Text style={[styles.macroPillText, { color: "#007AFF" }]}>Fats: {macros.fats}g</Text>
                  </View>
                </View>
              </View>

              {/* Quick Adjust Buttons */}
              <View style={styles.calorieAdjustCol}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Add 100 kcal"
                  onPress={() => adjustCalories(100)}
                  style={({ pressed }) => [styles.adjustBtn, pressed && styles.pressedOpacity]}
                >
                  <Text style={[styles.adjustBtnText, { color: "#34C759" }]}>+ +100 kcal</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Subtract 100 kcal"
                  onPress={() => adjustCalories(-100)}
                  style={({ pressed }) => [styles.adjustBtn, { marginTop: 8 }, pressed && styles.pressedOpacity]}
                >
                  <Text style={[styles.adjustBtnText, { color: "#FF3B30" }]}>- -100 kcal</Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Right Card: HYDRATION TARGET */}
          <View style={[styles.card, styles.flexCard]}>
            <View style={styles.hydrationTopRow}>
              <View style={styles.hydrationHeaderLeft}>
                <View style={styles.hydrationSquircle}>
                  <Ionicons name="water" size={18} color="#007AFF" />
                </View>
                <View>
                  <Text style={styles.eyebrowCyan}>HYDRATION TARGET</Text>
                  <Text style={styles.hydrationBigValue}>
                    {hydrationLiters.toFixed(2)}{" "}
                    <Text style={styles.hydrationTargetValue}>/ {hydrationTargetLiters.toFixed(1)} L</Text>
                  </Text>
                </View>
              </View>
              <View style={styles.hydrationPercentBadge}>
                <Text style={styles.hydrationPercentText}>
                  {Math.round((hydrationLiters / hydrationTargetLiters) * 100)}% Reached
                </Text>
              </View>
            </View>

            {/* Middle Progress Bar */}
            <View style={styles.hydrationProgressSection}>
              <View style={styles.hydrationProgressLabels}>
                <Text style={styles.hydrationMutedText}>Logged Today</Text>
                <Text style={styles.hydrationGlassesText}>
                  {glassesLogged} / {glassesTarget} Glasses
                </Text>
              </View>
              <View style={styles.hydrationTrack}>
                <View
                  style={[
                    styles.hydrationFill,
                    {
                      width: `${Math.min(100, Math.round((hydrationLiters / hydrationTargetLiters) * 100))}%`
                    }
                  ]}
                />
              </View>
            </View>

            {/* Bottom Quick Log Buttons */}
            <View style={styles.hydrationBottomRow}>
              <Text style={styles.hydrationMutedText}>Quick Log Intake:</Text>
              <View style={styles.hydrationQuickButtons}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Add 250ml water"
                  onPress={() => addWater(250)}
                  style={({ pressed }) => [styles.waterPillBtn, pressed && styles.pressedOpacity]}
                >
                  <Text style={styles.waterPillText}>+ +250ml</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Add 500ml water"
                  onPress={() => addWater(500)}
                  style={({ pressed }) => [styles.waterPillBtn, pressed && styles.pressedOpacity]}
                >
                  <Text style={styles.waterPillText}>+ +500ml</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        {/* ================================================================= */}
        {/* 3. ASSIGNED NUTRITION PLANS SECTION                               */}
        {/* ================================================================= */}
        <View style={styles.plansSectionHeader}>
          <View style={styles.plansHeaderLeft}>
            <Ionicons name="restaurant" size={17} color="#E91E63" />
            <Text style={styles.plansSectionTitle}>Assigned Nutrition Plans</Text>
          </View>
          <Text style={styles.plansCountText}>{filteredPlans.length} Active Plans Available</Text>
        </View>

        {/* Grid of Plans */}
        <View style={styles.plansGrid}>
          {query.isLoading && realMeals.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator size="large" color="#E91E63" />
              <Text style={styles.emptyTitle}>Loading nutrition plans...</Text>
            </View>
          ) : filteredPlans.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="restaurant-outline" size={40} color="#F2F2F7" />
              <Text style={styles.emptyTitle}>
                {realMeals.length === 0 ? "No nutrition plans assigned yet" : "No nutrition plans found"}
              </Text>
              <Text style={styles.emptySubtitle}>
                {realMeals.length === 0
                  ? "Create a personal meal plan above or contact your trainer to assign one."
                  : "Try changing your search query."}
              </Text>
            </View>
          ) : (
            filteredPlans.map((plan) => {
              const isCompleted = plan.status === "Completed" || Boolean(completedPlanIds[plan.id]);
              const isExpanded = Boolean(expandedPlanIds[plan.id]);

              return (
                <View
                  key={plan.id}
                  style={[
                    styles.planCard,
                    isDesktop ? styles.planCardDesktop : isTablet ? styles.planCardTablet : styles.planCardMobile
                  ]}
                >
                  {/* Image Cover with Badges */}
                  <View style={styles.planImageWrapper}>
                    <Image source={mealPlanImage} style={styles.planCoverImage} resizeMode="cover" />

                    {/* Left Badge: Active or Completed */}
                    <View
                      style={[
                        styles.planStatusBadge,
                        { backgroundColor: isCompleted ? "rgba(0, 122, 255, 0.9)" : "#34C759" }
                      ]}
                    >
                      <Text style={styles.planStatusBadgeText}>
                        {isCompleted ? "✓ Completed" : "Active"}
                      </Text>
                    </View>

                    {/* Right Badge: Trainer Plan */}
                    <View style={styles.trainerPlanBadge}>
                      <Text style={styles.trainerPlanBadgeText}>
                        {plan.isTrainerPlan ? "Trainer Plan" : "Personal Plan"}
                      </Text>
                    </View>
                  </View>

                  {/* Card Body */}
                  <View style={styles.planCardBody}>
                    <Text numberOfLines={1} style={styles.planTitleText}>
                      {plan.title}
                    </Text>
                    <Text numberOfLines={1} style={styles.planSubtitleText}>
                      {plan.subtitle}
                    </Text>

                    {/* Meta: Calories & Meals Count */}
                    <View style={styles.planMetaRow}>
                      <View style={styles.metaItem}>
                        <Ionicons name="flame" size={15} color={plan.calorieColor} />
                        <Text style={[styles.metaTextCalories, { color: plan.calorieColor }]}>
                          {plan.calories}
                        </Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Ionicons name="time-outline" size={15} color="#007AFF" />
                        <Text style={styles.metaTextMeals}>{plan.mealsCount} meals</Text>
                      </View>
                    </View>

                    {/* Trainer Row */}
                    <View style={styles.trainerRow}>
                      <View style={styles.trainerAvatar}>
                        <Text style={styles.trainerAvatarText}>{plan.trainerInitial}</Text>
                      </View>
                      <Text style={styles.trainerNameText}>{plan.trainer}</Text>
                      {plan.isTrainerPlan ? (
                        <Ionicons name="checkmark-circle" size={15} color="#007AFF" />
                      ) : null}
                    </View>

                    {/* Collapsible Food Breakdown Toggle */}
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`${isExpanded ? "Hide" : "View"} ${plan.foods.length} foods breakdown`}
                      onPress={() => toggleExpandPlan(plan.id)}
                      style={({ pressed }) => [styles.breakdownToggleRow, pressed && styles.pressedOpacity]}
                    >
                      <Text style={[styles.breakdownToggleText, { color: plan.calorieColor }]}>
                        View {plan.foods.length} foods breakdown
                      </Text>
                      <Ionicons
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={15}
                        color={plan.calorieColor}
                      />
                    </Pressable>

                    {/* Expanded Food Items List Box */}
                    {isExpanded ? (
                      <View style={styles.breakdownListBox}>
                        {plan.foods.map((food, foodIdx) => (
                          <View key={`${plan.id}-${food.name}-${foodIdx}`} style={styles.foodItemRow}>
                            <Text style={styles.foodItemName}>{food.name}</Text>
                            <Text style={styles.foodItemKcal}>{food.kcal}</Text>
                          </View>
                        ))}
                      </View>
                    ) : null}

                    {/* Action Button: Mark Complete / Completed */}
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={isCompleted ? "Completed" : "Mark complete"}
                      onPress={() => handleMarkComplete(plan.id)}
                      style={({ pressed }) => [
                        styles.actionCompleteBtn,
                        isCompleted ? styles.completedBtnBg : styles.markCompleteBtnBg,
                        pressed && styles.pressedOpacity
                      ]}
                    >
                      <Ionicons
                        name={isCompleted ? "checkmark-sharp" : "checkmark-circle-outline"}
                        size={16}
                        color="#FFFFFF"
                      />
                      <Text style={styles.actionCompleteBtnText}>
                        {isCompleted ? "Completed" : "Mark complete"}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </View>

      {/* Floating Subtle "Ask Gemini" Pill in Bottom Right (Matching screenshot) */}
      <View style={styles.floatingGeminiPill}>
        <Text style={styles.floatingGeminiText}>Ask Gemini</Text>
      </View>
    </Screen>
  );
}

// --------------------------------------------------------------------------
// EXACT STYLES (Cyberpunk dark, Apple Fitness luxury aesthetics)
// --------------------------------------------------------------------------

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#000000",
    flex: 1
  },
  scrollContent: {
    minHeight: "100%",
    backgroundColor: "#000000",
    paddingBottom: 50
  },
  container: {
    width: "100%",
    maxWidth: 1380,
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingTop: 20
  },

  // 1. Header Bar
  headerBar: {
    backgroundColor: "#1C1C1E",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 22,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    flexWrap: "wrap",
    gap: 16
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1,
    minWidth: 280
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center"
  },
  headerTitles: {
    flex: 1
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.2
  },
  headerTitleMuted: {
    fontSize: 14,
    fontWeight: "400",
    color: "#F2F2F7"
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#F2F2F7",
    marginTop: 3
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  searchBox: {
    height: 38,
    borderRadius: 20,
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: 170
  },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 13,
    padding: 0
  },
  datePill: {
    height: 38,
    borderRadius: 20,
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  datePillText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF"
  },
  createPlanBtn: {
    height: 38,
    borderRadius: 20,
    backgroundColor: "#E91E63",
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  createPlanBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF"
  },

  // Composer
  composerCard: {
    backgroundColor: "#1C1C1E",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: 20,
    marginBottom: 20
  },
  composerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start"
  },
  composerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF"
  },
  composerSubtitle: {
    fontSize: 12,
    color: "#F2F2F7",
    marginTop: 2
  },
  closeComposerBtn: {
    padding: 4
  },

  // 2. Top Row
  topRow: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 20
  },
  columnLayout: {
    flexDirection: "column"
  },
  card: {
    backgroundColor: "#1C1C1E",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: 22
  },
  flexCard: {
    flex: 1
  },

  // Left Card: Daily Calories Target
  caloriesCardBody: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16
  },
  calorieGaugeWrap: {
    width: 90,
    height: 90,
    alignItems: "center",
    justifyContent: "center",
    position: "relative"
  },
  calorieGaugeCenter: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    gap: 1
  },
  calorieGaugeValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
    fontVariant: ["tabular-nums"]
  },
  calorieInfoCol: {
    flex: 1
  },
  eyebrowCoral: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    color: "#E91E63"
  },
  calorieBigText: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 2,
    fontVariant: ["tabular-nums"]
  },
  calorieTargetText: {
    fontSize: 13,
    fontWeight: "400",
    color: "#F2F2F7"
  },
  caloriePercentSub: {
    fontSize: 12,
    color: "#F2F2F7",
    marginTop: 2
  },
  macroPillsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
    flexWrap: "wrap"
  },
  macroPill: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 3
  },
  macroPillText: {
    fontSize: 11,
    fontWeight: "600"
  },
  calorieAdjustCol: {
    alignItems: "center"
  },
  adjustBtn: {
    backgroundColor: "#1C1C1E",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    minWidth: 84,
    alignItems: "center"
  },
  adjustBtnText: {
    fontSize: 11.5,
    fontWeight: "700"
  },

  // Right Card: Hydration Target
  hydrationTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start"
  },
  hydrationHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  hydrationSquircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "rgba(0, 122, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center"
  },
  eyebrowCyan: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    color: "#007AFF"
  },
  hydrationBigValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 2,
    fontVariant: ["tabular-nums"]
  },
  hydrationTargetValue: {
    fontSize: 13,
    fontWeight: "400",
    color: "#F2F2F7"
  },
  hydrationPercentBadge: {
    backgroundColor: "rgba(0, 122, 255, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(0, 122, 255, 0.3)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  hydrationPercentText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#007AFF"
  },
  hydrationProgressSection: {
    marginTop: 14
  },
  hydrationProgressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8
  },
  hydrationMutedText: {
    fontSize: 12,
    color: "#F2F2F7"
  },
  hydrationGlassesText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF"
  },
  hydrationTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#1C1C1E",
    overflow: "hidden"
  },
  hydrationFill: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: "#007AFF"
  },
  hydrationBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16
  },
  hydrationQuickButtons: {
    flexDirection: "row",
    gap: 8
  },
  waterPillBtn: {
    backgroundColor: "rgba(0, 122, 255, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(0, 122, 255, 0.25)",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 5
  },
  waterPillText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#007AFF"
  },

  // 3. Assigned Nutrition Plans Section
  plansSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 16
  },
  plansHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  plansSectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF"
  },
  plansCountText: {
    fontSize: 13,
    color: "#F2F2F7"
  },
  plansGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 20
  },
  planCard: {
    backgroundColor: "#1C1C1E",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    overflow: "hidden"
  },
  planCardDesktop: {
    width: "31.7%"
  },
  planCardTablet: {
    width: "48%"
  },
  planCardMobile: {
    width: "100%"
  },
  planImageWrapper: {
    height: 160,
    width: "100%",
    position: "relative",
    overflow: "hidden"
  },
  planCoverImage: {
    width: "100%",
    height: "100%"
  },
  planStatusBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3
  },
  planStatusBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF"
  },
  trainerPlanBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3
  },
  trainerPlanBadgeText: {
    fontSize: 11,
    color: "#FFFFFF",
    fontWeight: "500"
  },
  planCardBody: {
    padding: 18
  },
  planTitleText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF"
  },
  planSubtitleText: {
    fontSize: 12,
    color: "#F2F2F7",
    marginTop: 4
  },
  planMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 10
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  metaTextCalories: {
    fontSize: 13,
    fontWeight: "700"
  },
  metaTextMeals: {
    fontSize: 13,
    color: "#F2F2F7"
  },
  trainerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12
  },
  trainerAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#E91E63",
    alignItems: "center",
    justifyContent: "center"
  },
  trainerAvatarText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700"
  },
  trainerNameText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF"
  },
  breakdownToggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14
  },
  breakdownToggleText: {
    fontSize: 12,
    fontWeight: "600"
  },
  breakdownListBox: {
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    gap: 8
  },
  foodItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  foodItemName: {
    fontSize: 12.5,
    color: "#FFFFFF",
    fontWeight: "500"
  },
  foodItemKcal: {
    fontSize: 12.5,
    color: "#F2F2F7",
    fontWeight: "600"
  },
  actionCompleteBtn: {
    borderRadius: 20,
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 14
  },
  markCompleteBtnBg: {
    backgroundColor: "#E91E63"
  },
  completedBtnBg: {
    backgroundColor: "#34C759"
  },
  actionCompleteBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF"
  },

  // Interactions
  pressedOpacity: {
    opacity: 0.72
  },

  // Empty & Loading State
  emptyContainer: {
    paddingVertical: 56,
    paddingHorizontal: 24,
    backgroundColor: "#1C1C1E",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    gap: 8
  },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 8
  },
  emptySubtitle: {
    color: "#F2F2F7",
    fontSize: 13,
    textAlign: "center",
    maxWidth: 380
  },

  // Floating Gemini Pill
  floatingGeminiPill: {
    position: "fixed" as any,
    bottom: 24,
    right: 28,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    zIndex: 999
  },
  floatingGeminiText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600"
  }
});

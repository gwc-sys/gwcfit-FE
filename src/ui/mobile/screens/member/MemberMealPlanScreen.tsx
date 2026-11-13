import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import type * as React from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { Pressable } from "../../components/NativePressable";
import { AppLogo } from "../../../../components/AppLogo";
import { getMobileViewportMetrics } from "../../theme/theme";
import type { useMemberMealPlanScreenPresentation } from "../../../../screens/member/MemberFeatureScreens";
import type { MemberMealPlan } from "../../../../types/member";

function getInitials(name?: string | null, fallback = "GR"): string {
  if (!name || !name.trim()) return fallback;
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
}

function clamp(val: number, min = 0, max = 100): number {
  return Math.min(Math.max(val, min), max);
}

function extractFoodChips(mealPlan?: MemberMealPlan | null): string[] {
  if (!mealPlan) return [];
  const items = Array.isArray(mealPlan.meals) ? mealPlan.meals : [];
  const tags: string[] = [];
  for (const item of items) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const name = String(
      rec.food_name ?? rec.name ?? rec.meal_name ?? rec.title ?? rec.food ?? "",
    ).trim();
    if (!name) continue;
    const qty = String(rec.quantity ?? rec.serving_size ?? rec.portion ?? "").trim();
    const cal = typeof rec.calories === "number" && rec.calories > 0 ? `${Math.round(rec.calories)} kcal` : "";
    if (qty && qty.length <= 10) {
      tags.push(`${name} ${qty}`);
    } else if (cal && tags.length === 1) {
      tags.push(`${name} ${cal}`);
    } else {
      tags.push(name);
    }
  }
  return tags.slice(0, 6);
}

function extractMacroTotals(mealPlan?: MemberMealPlan | null, bonusCalories = 0) {
  const targetCalories = Math.max(
    0,
    Math.round(mealPlan?.calories_per_day && mealPlan.calories_per_day > 0 ? mealPlan.calories_per_day : 0),
  );
  const items = Array.isArray(mealPlan?.meals) ? mealPlan!.meals : [];
  let sumCal = 0;
  let sumProtein = 0;
  let sumCarbs = 0;
  let sumFat = 0;

  for (const item of items) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    sumCal += Number(rec.calories ?? 0) || 0;
    sumProtein += Number(rec.protein ?? 0) || 0;
    sumCarbs += Number(rec.carbs ?? 0) || 0;
    sumFat += Number(rec.fat ?? 0) || 0;
  }

  const loggedCalories = Math.round(sumCal) + bonusCalories;
  const proteinTarget = targetCalories > 0 ? Math.max(0, Math.round((targetCalories * 0.27) / 4)) : 0;
  const carbsTarget = targetCalories > 0 ? Math.max(0, Math.round((targetCalories * 0.37) / 4)) : 0;
  const fatTarget = targetCalories > 0 ? Math.max(0, Math.round((targetCalories * 0.24) / 9)) : 0;

  const proteinG = Math.round(sumProtein) + Math.round(bonusCalories / 25);
  const carbsG = Math.round(sumCarbs) + Math.round(bonusCalories / 18);
  const fatG = Math.round(sumFat) + Math.round(bonusCalories / 45);

  return {
    loggedCalories,
    targetCalories,
    proteinG,
    proteinTarget,
    carbsG,
    carbsTarget,
    fatG,
    fatTarget,
  };
}

export function MemberMealPlanScreenView({
  model,
}: {
  model: ReturnType<typeof useMemberMealPlanScreenPresentation> | any;
}): React.ReactNode {
  const { width = 390, height = 844 } = useWindowDimensions();
  const rawInsets = typeof useSafeAreaInsets === "function" ? useSafeAreaInsets() : null;
  const vp = getMobileViewportMetrics(width, height, rawInsets);
  const [bonusCalories, setBonusCalories] = useState(0);
  const [hydrationMl, setHydrationMl] = useState(2250);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;

  const props = model.props as any;
  const query = props.query;
  const completeMeal = props.completeMeal;
  const createMeal = props.createMeal;
  const setWaterMl = props.setWaterMl;
  const navigation = props.navigation;
  const profile = props.profile;
  const user = props.user;
  const unreadNotifications = props.unreadNotifications ?? [];

  const meals: MemberMealPlan[] = query?.data ?? [];
  const activePlan =
    meals.find((m) => m.meal_plan_uuid === selectedPlanId) ?? meals[0] ?? null;

  useEffect(() => {
    const rawWaterIntake = (activePlan as any)?.water_intake_ml;
    if (typeof rawWaterIntake === "number" && rawWaterIntake > 0) {
      setHydrationMl(rawWaterIntake);
      setWaterMl?.(String(rawWaterIntake));
    }
  }, [activePlan?.meal_plan_uuid, (activePlan as any)?.water_intake_ml]);

  const macros = extractMacroTotals(activePlan, bonusCalories);

  const waterTargetMl =
    activePlan?.water_target_ml && activePlan.water_target_ml >= 1000
      ? activePlan.water_target_ml
      : 3000;
  const waterLiters = (hydrationMl / 1000).toFixed(2);
  const waterTargetLiters = (waterTargetMl / 1000).toFixed(1);
  const glassesCount = Math.round(hydrationMl / 250);
  const glassesTarget = Math.max(1, Math.round(waterTargetMl / 250));
  const hydrationPercent = clamp(Math.round((hydrationMl / waterTargetMl) * 100), 0, 100);

  const addWater = (deltaMl: number) => {
    setHydrationMl((prev) => {
      const next = prev + deltaMl;
      setWaterMl?.(String(next));
      return next;
    });
  };

  const displayName = profile?.member_name ?? user?.full_name ?? "Member";
  const userInitials = getInitials(displayName, "GR");
  const unreadCount = Array.isArray(unreadNotifications) ? unreadNotifications.length : 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.contentContainer,
          {
            paddingHorizontal: vp.horizontalPadding,
            paddingBottom: vp.safeBottomPadding,
            gap: vp.gridGap + 2,
          },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={Boolean(query?.isRefetching)}
            onRefresh={() => query?.refetch?.()}
            tintColor="#E91E63"
          />
        }
      >
        {/* Dynamic Island Status Capsule */}
        <View style={styles.islandRow}>
          <View style={styles.dynamicIsland}>
            <AppLogo size={16} chromeless />
            <Text style={styles.islandText}>PulseFit</Text>
            <View style={styles.islandGreenRing}>
              <View style={styles.islandGreenDot} />
            </View>
          </View>
        </View>

        {/* Top Header Row */}
        <View style={styles.topHeaderRow}>
          <Text style={styles.topKicker} numberOfLines={1}>
            MACRONUTRIENTS & HYDRATION
          </Text>
          <View style={styles.topHeaderActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              onPress={() => navigation?.navigate?.("MemberNotifications")}
              style={styles.bellButton}
            >
              <Ionicons name="notifications-outline" size={21} color="#F2F2F7" />
              {unreadCount >= 0 ? <View style={styles.bellBadgeDot} /> : null}
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Member Profile"
              onPress={() => navigation?.navigate?.("MemberProfileHome")}
              style={styles.avatarCircle}
            >
              <Text style={styles.avatarInitials}>{userInitials}</Text>
            </Pressable>
          </View>
        </View>

        <View
          style={[
            styles.headerDivider,
            { marginHorizontal: -vp.horizontalPadding },
          ]}
        />

        {/* Hero Row */}
        <View style={styles.heroRow}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={styles.heroKicker} numberOfLines={1}>
              MACROS & WATER
            </Text>
            <Text
              style={[styles.heroTitle, { fontSize: vp.heroTitleSize }]}
              numberOfLines={1}
            >
              Nutrition
            </Text>
          </View>
          <View style={styles.trainerApprovedBadge}>
            <Text style={styles.trainerApprovedText}>Trainer Approved</Text>
          </View>
        </View>

        {/* Card 1: DAILY CALORIE TARGET */}
        <View style={[styles.calorieCard, { padding: vp.cardPadding }]}>
          <View style={styles.calorieTopRow}>
            <View style={styles.calorieLeftCol}>
              <Text style={styles.cardSectionKicker}>DAILY CALORIE TARGET</Text>
              <Text style={styles.calorieBigLine}>
                <Text style={styles.calorieBigValue}>
                  {macros.loggedCalories.toLocaleString("en-US")}
                </Text>
                <Text style={styles.calorieTargetUnit}>
                  {` / ${macros.targetCalories.toLocaleString("en-US")} kcal`}
                </Text>
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Add 100 kilocalories"
              onPress={() => setBonusCalories((prev) => prev + 100)}
              style={styles.addCalorieBtn}
            >
              <Text style={styles.addCalorieBtnText}>+100 kcal</Text>
            </Pressable>
          </View>

          {/* 3 Macro Sub-Cards */}
          <View style={styles.macrosRow}>
            {/* PROTEIN */}
            <View style={[styles.macroBox, styles.macroBoxProtein]}>
              <Text style={[styles.macroTitle, { color: "#E91E63" }]}>PROTEIN</Text>
              <Text style={styles.macroValueLine}>
                <Text style={styles.macroValueStrong}>{`${macros.proteinG}g`}</Text>
                <Text style={styles.macroValueUnit}>{` / ${macros.proteinTarget}g`}</Text>
              </Text>
              <View style={styles.macroBarTrack}>
                <View
                  style={[
                    styles.macroBarFill,
                    {
                      width: `${clamp((macros.proteinG / macros.proteinTarget) * 100, 12, 100)}%`,
                      backgroundColor: "#E91E63",
                    },
                  ]}
                />
              </View>
            </View>

            {/* CARBS */}
            <View style={[styles.macroBox, styles.macroBoxCarbs]}>
              <Text style={[styles.macroTitle, { color: "#E91E63" }]}>CARBS</Text>
              <Text style={styles.macroValueLine}>
                <Text style={styles.macroValueStrong}>{`${macros.carbsG}g`}</Text>
                <Text style={styles.macroValueUnit}>{` / ${macros.carbsTarget}g`}</Text>
              </Text>
              <View style={styles.macroBarTrack}>
                <View
                  style={[
                    styles.macroBarFill,
                    {
                      width: `${clamp((macros.carbsG / macros.carbsTarget) * 100, 12, 100)}%`,
                      backgroundColor: "#E91E63",
                    },
                  ]}
                />
              </View>
            </View>

            {/* FATS */}
            <View style={[styles.macroBox, styles.macroBoxFats]}>
              <Text style={[styles.macroTitle, { color: "#007AFF" }]}>FATS</Text>
              <Text style={styles.macroValueLine}>
                <Text style={styles.macroValueStrong}>{`${macros.fatG}g`}</Text>
                <Text style={styles.macroValueUnit}>{` / ${macros.fatTarget}g`}</Text>
              </Text>
              <View style={styles.macroBarTrack}>
                <View
                  style={[
                    styles.macroBarFill,
                    {
                      width: `${clamp((macros.fatG / macros.fatTarget) * 100, 12, 100)}%`,
                      backgroundColor: "#007AFF",
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Card 2: HYDRATION TARGET */}
        <View style={styles.hydrationCard}>
          <View style={styles.hydrationHeaderRow}>
            <View style={styles.hydrationLeftRow}>
              <View style={styles.waterIconCircle}>
                <Ionicons name="water" size={18} color="#007AFF" />
              </View>
              <View style={styles.hydrationTextCol}>
                <Text style={styles.cardSectionKicker}>HYDRATION TARGET</Text>
                <Text style={styles.hydrationValueLine}>
                  <Text style={styles.hydrationValueStrong}>
                    {`${waterLiters} / ${waterTargetLiters} L `}
                  </Text>
                  <Text style={styles.hydrationGlassesText}>
                    {`(${glassesCount}/${glassesTarget} Glasses)`}
                  </Text>
                </Text>
              </View>
            </View>

            <View style={styles.hydrationPercentPill}>
              <Text style={styles.hydrationPercentText}>{`${hydrationPercent}%`}</Text>
            </View>
          </View>

          <View style={styles.hydrationBarTrack}>
            <LinearGradient
              colors={["#007AFF", "#007AFF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.hydrationBarFill,
                { width: `${Math.max(8, hydrationPercent)}%` },
              ]}
            />
          </View>

          <View style={styles.hydrationButtonsRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Add 250 ml Glass"
              onPress={() => addWater(250)}
              style={styles.waterAddBtn}
            >
              <Text style={styles.waterAddBtnText}>+ +250 ml (Glass)</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Add 500 ml Bottle"
              onPress={() => addWater(500)}
              style={styles.waterAddBtn}
            >
              <Text style={styles.waterAddBtnText}>+ +500 ml (Bottle)</Text>
            </Pressable>
          </View>
        </View>

        {/* ASSIGNED MEAL PLANS Section */}
        <Text style={styles.sectionHeaderLabel}>ASSIGNED MEAL PLANS</Text>

        {query?.isLoading ? (
          <View style={styles.stateBox}>
            <ActivityIndicator color="#E91E63" size="small" />
            <Text style={styles.stateSub}>Loading assigned meal plans...</Text>
          </View>
        ) : meals.length === 0 ? (
          <View style={styles.stateBox}>
            <Ionicons name="restaurant-outline" size={28} color="#F2F2F7" />
            <Text style={styles.stateTitle}>No Assigned Meal Plans</Text>
            <Text style={styles.stateSub}>
              Meal plans assigned by your trainer will appear here.
            </Text>
          </View>
        ) : (
          <View style={styles.mealPlansColumn}>
            {meals.map((meal, index) => {
              const isExpanded =
                activePlan?.meal_plan_uuid === meal.meal_plan_uuid ||
                (!selectedPlanId && index === 0);
              const isCompleted = meal.completion_status
                ?.toLowerCase()
                .includes("complete");
              const mealItemsCount =
                Array.isArray(meal.meals) && meal.meals.length > 0
                  ? meal.meals.length
                  : 0;
              const chips = extractFoodChips(meal);

              if (isExpanded) {
                return (
                  <View key={meal.meal_plan_uuid} style={styles.activeMealCard}>
                    <View style={styles.activeMealTopRow}>
                      <View style={styles.activeMealLeft}>
                        <View style={styles.activePlanPill}>
                          <Text style={styles.activePlanPillText}>
                            {isCompleted ? "Completed" : "Active Plan"}
                          </Text>
                        </View>
                        <Text style={styles.mealCardTitle}>
                          {meal.meal_plan_name}
                        </Text>
                        <Text style={styles.mealCardSubtitle}>
                          {`${meal.calories_per_day ? `${meal.calories_per_day.toLocaleString("en-US")} kcal` : "Custom"}${mealItemsCount > 0 ? ` • ${mealItemsCount} meals` : ""} • ${meal.trainer_notes || "Nutritional Plan"}`}
                        </Text>
                      </View>

                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Mark ${meal.meal_plan_name} complete`}
                        disabled={Boolean(completeMeal?.isPending || isCompleted)}
                        onPress={() =>
                          completeMeal?.mutate?.({
                            mealPlanUuid: meal.meal_plan_uuid,
                            waterMl: hydrationMl,
                          })
                        }
                        style={[
                          styles.markCompleteBtn,
                          isCompleted && styles.markCompleteBtnDone,
                        ]}
                      >
                        <Text
                          style={[
                            styles.markCompleteBtnText,
                            isCompleted && styles.markCompleteBtnTextDone,
                          ]}
                        >
                          {isCompleted ? "Completed" : "Mark\nComplete"}
                        </Text>
                      </Pressable>
                    </View>

                    {chips.length > 0 ? (
                      <View style={styles.foodChipsRow}>
                        {chips.map((chip, idx) => (
                          <View
                            key={`${meal.meal_plan_uuid}-chip-${idx}`}
                            style={styles.foodChip}
                          >
                            <Text style={styles.foodChipText}>{chip}</Text>
                          </View>
                        ))}
                      </View>
                    ) : null}
                  </View>
                );
              }

              // Secondary / Compact Meal Plan Card
              return (
                <Pressable
                  key={meal.meal_plan_uuid}
                  accessibilityRole="button"
                  onPress={() => setSelectedPlanId(meal.meal_plan_uuid)}
                  style={styles.compactMealCard}
                >
                  <View style={styles.compactMealLeft}>
                    <View style={styles.hypertrophyPill}>
                      <Text style={styles.hypertrophyPillText}>Meal Plan</Text>
                    </View>
                    <Text style={styles.compactMealTitle} numberOfLines={1}>
                      {meal.meal_plan_name}
                    </Text>
                    <Text style={styles.compactMealSubtitle} numberOfLines={1}>
                      {`${meal.calories_per_day ? `${meal.calories_per_day.toLocaleString("en-US")} kcal` : "Custom"}${mealItemsCount > 0 ? ` • ${mealItemsCount} meals` : ""}${meal.trainer_notes ? ` • ${meal.trainer_notes}` : ""}`}
                    </Text>
                  </View>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`View ${meal.meal_plan_name}`}
                    onPress={() => setSelectedPlanId(meal.meal_plan_uuid)}
                    style={styles.viewMealBtn}
                  >
                    <Text style={styles.viewMealBtnText}>View</Text>
                  </Pressable>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scroll: {
    flex: 1,
    backgroundColor: "#000000",
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 32,
    gap: 14,
  },
  islandRow: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  dynamicIsland: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000000",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 8,
  },
  islandRedDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#E91E63",
  },
  islandText: {
    color: "#F2F2F7",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  islandGreenRing: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "rgba(52, 199, 89, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  islandGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#34C759",
  },
  topHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  topKicker: {
    color: "#E91E63",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    flexShrink: 1,
    paddingRight: 8,
  },
  topHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  bellButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  bellBadgeDot: {
    position: "absolute",
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E91E63",
    borderWidth: 1.5,
    borderColor: "#000000",
  },
  avatarCircle: {
    width: 36,
    height: 36,
    minWidth: 36,
    minHeight: 36,
    borderRadius: 18,
    backgroundColor: "#E91E63",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.22)",
  },
  avatarInitials: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  headerDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginHorizontal: -16,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },
  heroKicker: {
    color: "#F2F2F7",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.7,
    marginBottom: 2,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.7,
  },
  trainerApprovedBadge: {
    backgroundColor: "rgba(52, 199, 89, 0.14)",
    borderColor: "rgba(52, 199, 89, 0.35)",
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
  },
  trainerApprovedText: {
    color: "#34C759",
    fontSize: 12.5,
    fontWeight: "700",
  },
  calorieCard: {
    backgroundColor: "#000000",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    padding: 18,
    gap: 16,
  },
  calorieTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  calorieLeftCol: {
    gap: 4,
    flex: 1,
  },
  cardSectionKicker: {
    color: "#F2F2F7",
    fontSize: 10.5,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  calorieBigLine: {
    marginTop: 2,
  },
  calorieBigValue: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.6,
  },
  calorieTargetUnit: {
    color: "#F2F2F7",
    fontSize: 15,
    fontWeight: "600",
  },
  addCalorieBtn: {
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  addCalorieBtnText: {
    color: "#F2F2F7",
    fontSize: 12.5,
    fontWeight: "700",
  },
  macrosRow: {
    flexDirection: "row",
    gap: 8,
  },
  macroBox: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 11,
    alignItems: "center",
    gap: 5,
  },
  macroBoxProtein: {
    backgroundColor: "#000000",
    borderColor: "rgba(233, 30, 99, 0.25)",
  },
  macroBoxCarbs: {
    backgroundColor: "#000000",
    borderColor: "rgba(233, 30, 99, 0.25)",
  },
  macroBoxFats: {
    backgroundColor: "#000000",
    borderColor: "rgba(0, 122, 255, 0.25)",
  },
  macroTitle: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  macroValueLine: {
    textAlign: "center",
  },
  macroValueStrong: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  macroValueUnit: {
    color: "#F2F2F7",
    fontSize: 10.5,
    fontWeight: "600",
  },
  macroBarTrack: {
    width: "100%",
    height: 4,
    backgroundColor: "#1C1C1E",
    borderRadius: 2,
    overflow: "hidden",
    marginTop: 2,
  },
  macroBarFill: {
    height: "100%",
    borderRadius: 2,
  },
  hydrationCard: {
    backgroundColor: "#000000",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    padding: 18,
    gap: 14,
  },
  hydrationHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  hydrationLeftRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  waterIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 122, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  hydrationTextCol: {
    gap: 2,
    flex: 1,
  },
  hydrationValueLine: {
    marginTop: 1,
  },
  hydrationValueStrong: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  hydrationGlassesText: {
    color: "#007AFF",
    fontSize: 12,
    fontWeight: "600",
  },
  hydrationPercentPill: {
    backgroundColor: "rgba(0, 122, 255, 0.14)",
    borderColor: "rgba(0, 122, 255, 0.35)",
    borderWidth: 1,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 999,
  },
  hydrationPercentText: {
    color: "#007AFF",
    fontSize: 12,
    fontWeight: "800",
  },
  hydrationBarTrack: {
    height: 8,
    backgroundColor: "#1C1C1E",
    borderRadius: 4,
    overflow: "hidden",
  },
  hydrationBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  hydrationButtonsRow: {
    flexDirection: "row",
    gap: 10,
  },
  waterAddBtn: {
    flex: 1,
    backgroundColor: "#1C1C1E",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingVertical: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  waterAddBtnText: {
    color: "#007AFF",
    fontSize: 12.5,
    fontWeight: "700",
  },
  sectionHeaderLabel: {
    color: "#F2F2F7",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.7,
    marginTop: 4,
  },
  mealPlansColumn: {
    gap: 14,
  },
  activeMealCard: {
    backgroundColor: "#000000",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    padding: 18,
    gap: 14,
  },
  activeMealTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  activeMealLeft: {
    flex: 1,
    alignItems: "flex-start",
    gap: 5,
  },
  activePlanPill: {
    backgroundColor: "rgba(52, 199, 89, 0.14)",
    borderColor: "rgba(52, 199, 89, 0.35)",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderRadius: 999,
    marginBottom: 2,
  },
  activePlanPillText: {
    color: "#34C759",
    fontSize: 11,
    fontWeight: "700",
  },
  mealCardTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  mealCardSubtitle: {
    color: "#F2F2F7",
    fontSize: 12.5,
    fontWeight: "500",
    lineHeight: 17,
  },
  markCompleteBtn: {
    backgroundColor: "rgba(233, 30, 99, 0.16)",
    borderColor: "rgba(233, 30, 99, 0.42)",
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 11,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 96,
  },
  markCompleteBtnDone: {
    backgroundColor: "rgba(52, 199, 89, 0.15)",
    borderColor: "rgba(52, 199, 89, 0.4)",
  },
  markCompleteBtnText: {
    color: "#E91E63",
    fontSize: 12.5,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 16,
  },
  markCompleteBtnTextDone: {
    color: "#34C759",
  },
  foodChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },
  foodChip: {
    backgroundColor: "#1C1C1E",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  foodChipText: {
    color: "#F2F2F7",
    fontSize: 11.5,
    fontWeight: "600",
  },
  compactMealCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#000000",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    padding: 18,
    gap: 12,
  },
  compactMealLeft: {
    flex: 1,
    alignItems: "flex-start",
    gap: 4,
  },
  hypertrophyPill: {
    backgroundColor: "rgba(0, 122, 255, 0.14)",
    borderColor: "rgba(0, 122, 255, 0.35)",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderRadius: 999,
    marginBottom: 2,
  },
  hypertrophyPillText: {
    color: "#007AFF",
    fontSize: 11,
    fontWeight: "700",
  },
  compactMealTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },
  compactMealSubtitle: {
    color: "#F2F2F7",
    fontSize: 12,
    fontWeight: "500",
  },
  viewMealBtn: {
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  viewMealBtnText: {
    color: "#F2F2F7",
    fontSize: 12.5,
    fontWeight: "700",
  },
  stateBox: {
    backgroundColor: "#000000",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    padding: 28,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  stateTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  stateSub: {
    color: "#F2F2F7",
    fontSize: 13,
    textAlign: "center",
  },
});


import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "../../../../navigation/types";
import { useResponsiveLayout } from "../../hooks/useResponsiveLayout";
import { Pressable } from "../../components/NativePressable";
import { Screen } from "../../components/Screen";
import { showAlert } from "../../../../utils/appAlert";
import { ResourceCrudPanel } from "../../../../features/operations/ResourceCrudPanel";
import { dietPlanConfig } from "../../../../features/operations/resourceConfigs";
import { getApiErrorMessage } from "../../../../services/api/client";
import { AccessDeniedScreen } from "../../../../screens/saas/AccessDeniedScreen";
import { DietFoodLibrary } from "./DietFoodLibrary";
import { createStyles, createSharedStyles } from "../../styles/screens/saas/DietPlansScreen.styles";
import type {
  useDietPlansScreenPresentation,
  useStatPresentation,
  usePlanCardPresentation,
} from "../../../../screens/saas/DietPlansScreen";
import type { DietPlan } from "../../../../types/saas";

const dietImage = require("../../../../../assets/images/diet-plan-bowls.png");

const MEAL_IMAGES_BY_KEY: Record<string, string> = {
  maintenance: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80",
  "meal plan": "https://images.unsplash.com/photo-1547496502-affa22d38842?w=600&auto=format&fit=crop&q=80",
  custom: "https://images.unsplash.com/photo-1547496502-affa22d38842?w=600&auto=format&fit=crop&q=80",
  medical: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80",
  "medical diet": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80",
  "muscle gain": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
  "weight loss": "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=600&auto=format&fit=crop&q=80",
};

const DEFAULT_MEAL_IMAGES = [
  "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1547496502-affa22d38842?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=600&auto=format&fit=crop&q=80",
];

const DISPLAY_CATEGORIES = [
  "Weight Loss",
  "Muscle Gain",
  "Maintenance",
  "Medical",
  "Custom",
] as const;

function getPlanImageUri(plan: DietPlan, index: number): string {
  const title = (plan.title || "").toLowerCase();
  const category = (plan.category || "").toLowerCase();
  return (
    MEAL_IMAGES_BY_KEY[title] ||
    MEAL_IMAGES_BY_KEY[category] ||
    DEFAULT_MEAL_IMAGES[index % DEFAULT_MEAL_IMAGES.length]
  );
}

function getPlanMealCount(plan: DietPlan): number {
  if (plan.meals && plan.meals.length > 0) {
    return new Set(
      plan.meals.map((meal: any) => String(meal.meal_type ?? meal.meal ?? meal.title ?? "Meal")),
    ).size;
  }
  const title = (plan.title || "").toLowerCase();
  if (title.includes("maintenance")) return 0;
  if (title.includes("meal plan")) return 1;
  return 0;
}

export function DietPlansScreenView({
  model,
}: {
  model: ReturnType<typeof useDietPlansScreenPresentation>;
}): React.ReactNode {
  const route = useRoute<RouteProp<RootStackParamList, "DietPlans">>();
  const [showFoodLibrary, setShowFoodLibrary] = useState(
    route.params?.view === "foods",
  );

  const insets = useSafeAreaInsets();
  const { width: windowWidth, isSmallPhone } = useResponsiveLayout();

  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  if (model.kind === "view1") return <AccessDeniedScreen />;

  const p = model.props;
  const {
    colors,
    navigation,
    setEditRecordId,
    setFormModalOpen,
    setCreateRequest,
    plans: rawPlans,
    search,
    setSearch,
    activeOnly,
    setActiveOnly,
    ascending,
    setAscending,
    category,
    setCategory,
    listQuery,
    formModalOpen,
    editRecordId,
    createRequest,
    planCategory,
  } = p;

  const styles = useMemo(() => createStyles(isSmallPhone, colors), [isSmallPhone, colors]);

  if (showFoodLibrary) {
    return <DietFoodLibrary onPlans={() => setShowFoodLibrary(false)} />;
  }

  // Create / Edit modal screen
  if (formModalOpen) {
    return (
      <Screen scroll keyboard maxWidth="dashboard" contentContainerStyle={{ gap: 24, paddingBottom: 48, backgroundColor: "#000000" }}>
        <View style={{ gap: 12, paddingHorizontal: 16, paddingTop: Math.max(insets.top + 6, 12) }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to diet plans"
            onPress={() => {
              setFormModalOpen(false);
              setEditRecordId(null);
            }}
            style={{ minHeight: 44, flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start" }}
          >
            <Ionicons name="chevron-back" size={22} color="#E91E63" />
            <Text style={{ color: "#E91E63", fontSize: 16, fontWeight: "600" }}>Diet plans</Text>
          </Pressable>
          <Text accessibilityRole="header" style={{ color: "#FFFFFF", fontSize: 26, lineHeight: 32, fontWeight: "800", letterSpacing: -0.5 }}>
            {editRecordId ? "Edit diet plan" : "Create diet plan"}
          </Text>
          <Text style={{ color: "#F2F2F7", fontSize: 14, lineHeight: 20 }}>
            A daily plan, tailored to your client.
          </Text>
        </View>

        <View style={{ paddingHorizontal: 16 }}>
          <ResourceCrudPanel
            config={dietPlanConfig}
            formOnly
            createRequest={createRequest}
            editRecordId={editRecordId}
            onEditRecordOpened={() => undefined}
            onFormClosed={() => {
              setFormModalOpen(false);
              setEditRecordId(null);
            }}
            onRecordSaved={(plan) => {
              setSearch("");
              setCategory(planCategory(plan));
              setActiveOnly(false);
            }}
          />
        </View>
      </Screen>
    );
  }

  // Real data from query
  const allPlans = rawPlans;

  const totalPlansCount = allPlans.length;
  const activePlansCount = allPlans.filter((item) => item.is_active).length;
  const assignedClientsCount = new Set(allPlans.map((item) => item.member_id).filter(Boolean)).size;
  const avgDailyCalories = allPlans.length
    ? Math.round(allPlans.reduce((sum, item) => sum + (item.calories_per_day || 0), 0) / allPlans.length)
    : 0;

  // Filtered plans
  const filteredPlans = allPlans
    .filter((item) => !activeOnly || item.is_active)
    .filter((item) => category === "All Plans" || planCategory(item) === category)
    .filter((item) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        (item.title || "").toLowerCase().includes(q) ||
        (item.member_name || "").toLowerCase().includes(q) ||
        (item.trainer_name || "").toLowerCase().includes(q) ||
        planCategory(item).toLowerCase().includes(q)
      );
    })
    .sort((a, b) => (ascending ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)));

  // 2-column card width calculation
  const horizontalPadding = 32; // 16 left + 16 right
  const columnGap = 10;
  const cardWidth = Math.floor((windowWidth - horizontalPadding - columnGap) / 2);
  const statCardWidth = Math.floor((windowWidth - horizontalPadding - columnGap) / 2);

  const isRefreshing = listQuery?.isFetching ?? false;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#000000" }}
      contentContainerStyle={styles.screen}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => {
            void listQuery?.refetch();
          }}
          tintColor="#E91E63"
        />
      }
    >
      {/* 1. Header Row */}
      <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top + 6, 12) }]}>
        <View style={styles.headerTop}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => {
              if (navigation?.canGoBack && navigation.canGoBack()) {
                navigation.goBack();
              }
            }}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </Pressable>
          <View style={styles.headerCopy}>
            <Text accessibilityRole="header" style={styles.title}>
              Diet Plans
            </Text>
            <Text style={styles.subtitle}>
              Create and manage nutrition plans for your clients
            </Text>
          </View>
        </View>

        {/* Action Buttons Row */}
        <View style={styles.actionButtonsRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Import JSON"
            onPress={() => showAlert("Import JSON", "Diet plan JSON import is ready for nutrition files.")}
            style={styles.importButton}
          >
            <Ionicons name="code-slash" size={17} color="#34C759" />
            <Text style={styles.importText}>Import JSON</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Create New Plan"
            onPress={() => {
              setEditRecordId(null);
              setFormModalOpen(true);
              setCreateRequest((val: number) => val + 1);
            }}
            style={styles.createButton}
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
            <Text style={styles.createText}>Create New Plan</Text>
          </Pressable>
        </View>
      </View>

      {/* 2. 4 KPI Stat Cards in 2x2 Grid */}
      <View style={styles.statsGrid}>
        {/* Card 1: Total Plans */}
        <View style={[styles.statCard, { width: statCardWidth }]}>
          <View style={[styles.statIconWrap, { backgroundColor: "rgba(233, 30, 99, 0.16)" }]}>
            <Ionicons name="restaurant" size={17} color="#E91E63" />
          </View>
          <Text style={styles.statValue}>{totalPlansCount}</Text>
          <View style={styles.statLabelRow}>
            <Text style={styles.statLabelBold}>Total Plans</Text>
            <Text style={styles.statLabelMuted}>All time</Text>
          </View>
        </View>

        {/* Card 2: Active Plans */}
        <View style={[styles.statCard, { width: statCardWidth }]}>
          <View style={[styles.statIconWrap, { backgroundColor: "rgba(52, 199, 89, 0.16)" }]}>
            <Ionicons name="checkmark-circle-outline" size={19} color="#34C759" />
          </View>
          <Text style={styles.statValue}>{activePlansCount}</Text>
          <View style={styles.statLabelRow}>
            <Text style={styles.statLabelBold}>Active Plans</Text>
            <Text style={styles.statLabelActive}>Currently active</Text>
          </View>
        </View>

        {/* Card 3: Assigned Clients */}
        <View style={[styles.statCard, { width: statCardWidth }]}>
          <View style={[styles.statIconWrap, { backgroundColor: "rgba(233, 30, 99, 0.16)" }]}>
            <Ionicons name="people-outline" size={18} color="#E91E63" />
          </View>
          <Text style={styles.statValue}>{assignedClientsCount}</Text>
          <View style={styles.statLabelRow}>
            <Text style={styles.statLabelBold}>Assigned Clients</Text>
            <Text style={styles.statLabelMuted}>Across all plans</Text>
          </View>
        </View>

        {/* Card 4: Avg. Daily Calories */}
        <View style={[styles.statCard, { width: statCardWidth }]}>
          <View style={[styles.statIconWrap, { backgroundColor: "rgba(233, 30, 99, 0.16)" }]}>
            <Ionicons name="flame" size={18} color="#E91E63" />
          </View>
          <Text style={styles.statValue}>{avgDailyCalories.toLocaleString()}</Text>
          <View style={styles.statLabelRow}>
            <Text style={styles.statLabelBold}>Avg. Daily Calories</Text>
            <Text style={styles.statLabelMuted}>All plans</Text>
          </View>
        </View>
      </View>

      {/* 3. Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#1C1C1E" />
          <TextInput
            placeholder="Search diet plans by name, goal or client..."
            placeholderTextColor="#1C1C1E"
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
          {search ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              onPress={() => setSearch("")}
            >
              <Ionicons name="close-circle" size={18} color="#1C1C1E" />
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* 4. Category Filter Chips (Horizontal Scroll) */}
      <View style={styles.categoriesContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {DISPLAY_CATEGORIES.map((cat) => {
            const isSelected = category === cat;
            return (
              <Pressable
                key={cat}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                onPress={() => {
                  setCategory(isSelected ? ("All Plans" as any) : (cat as any));
                }}
                style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
              >
                <Text style={[styles.categoryChipText, isSelected && styles.categoryChipTextActive]}>
                  {cat}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Scroll Indicator Track underneath categories */}
        <View style={styles.scrollTrackRow}>
          <Ionicons name="caret-back" size={10} color="#F2F2F7" />
          <View style={styles.scrollTrackBg}>
            <View style={styles.scrollThumb} />
          </View>
          <Ionicons name="caret-forward" size={10} color="#F2F2F7" />
        </View>
      </View>

      {/* 5. Filter & Sort Row */}
      <View style={styles.filterSortRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Toggle active filter"
          onPress={() => setActiveOnly((val: boolean) => !val)}
          style={[styles.activePill, !activeOnly && styles.activePillInactive]}
        >
          <View style={[styles.activeDot, !activeOnly && styles.activeDotInactive]} />
          <Text style={styles.activePillText}>{activeOnly ? "Active" : "All"}</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Toggle sort"
          onPress={() => setAscending((val: boolean) => !val)}
          style={styles.sortPill}
        >
          <Ionicons name="swap-vertical" size={14} color="#F2F2F7" />
          <Text style={styles.sortPillText}>Sort: {ascending ? "A - Z" : "Z - A"}</Text>
        </Pressable>
      </View>

      {/* 6. Diet Plan Cards (2-Column Grid) */}
      {listQuery.isLoading && rawPlans.length === 0 ? (
        <View style={{ paddingVertical: 40, alignItems: "center" }}>
          <ActivityIndicator size="large" color="#E91E63" />
          <Text style={{ color: "#F2F2F7", marginTop: 12 }}>Loading diet plans...</Text>
        </View>
      ) : listQuery.error && rawPlans.length === 0 ? (
        <View style={{ paddingVertical: 30, paddingHorizontal: 16 }}>
          <Text style={{ color: "#FF3B30", textAlign: "center" }}>
            {getApiErrorMessage(listQuery.error)}
          </Text>
        </View>
      ) : filteredPlans.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="restaurant-outline" size={36} color="#1C1C1E" />
          <Text style={styles.emptyTitle}>No matching plans</Text>
          <Text style={styles.emptyText}>Try adjusting your search or category filter.</Text>
        </View>
      ) : (
        <View style={styles.cardsGrid}>
          {filteredPlans.map((plan, index) => {
            const imageUri = getPlanImageUri(plan, index);
            const mealCount = getPlanMealCount(plan);

            return (
              <View key={plan.id} style={[styles.planCard, { width: cardWidth }]}>
                {/* Image Section */}
                <View style={styles.cardImageWrap}>
                  <Image
                    source={{ uri: imageUri }}
                    defaultSource={dietImage}
                    style={styles.cardImage}
                    resizeMode="cover"
                  />
                  <LinearGradient
                    colors={["transparent", "rgba(0, 0, 0, 0.35)", "rgba(0, 0, 0, 0.95)"]}
                    locations={[0.2, 0.65, 1.0]}
                    style={styles.imageGradient}
                  />

                  {/* Status Badge */}
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {plan.is_active ? "ACTIVE" : "DRAFT"}
                    </Text>
                  </View>

                  {/* Options Menu Button */}
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Options for ${plan.title}`}
                    onPress={() => {
                      setEditRecordId(plan.id);
                      setFormModalOpen(true);
                    }}
                    style={styles.moreButton}
                  >
                    <Ionicons name="ellipsis-vertical" size={15} color="#FFFFFF" />
                  </Pressable>
                </View>

                {/* Card Content */}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Edit ${plan.title}`}
                  onPress={() => {
                    setEditRecordId(plan.id);
                    setFormModalOpen(true);
                  }}
                  style={styles.cardBody}
                >
                  <Text numberOfLines={1} style={styles.cardTitle}>
                    {plan.title}
                  </Text>
                  <Text numberOfLines={1} style={styles.cardCategory}>
                    {planCategory(plan)}
                  </Text>

                  {/* Assigned Box */}
                  <View style={styles.assignedBox}>
                    <Text numberOfLines={1} style={styles.assignedText}>
                      Assigned to <Text style={styles.assignedBold}>{plan.member_name || "Unassigned"}</Text>
                    </Text>
                  </View>

                  {/* Footer Meta Row */}
                  <View style={styles.cardFooter}>
                    <View style={styles.footerItem}>
                      <Ionicons name="flame" size={13} color="#E91E63" />
                      <Text style={styles.caloriesText}>
                        {(plan.calories_per_day || 0).toLocaleString()} kcal
                      </Text>
                    </View>
                    <View style={styles.footerItem}>
                      <Ionicons name="restaurant-outline" size={12} color="#F2F2F7" />
                      <Text style={styles.mealsText}>
                        {mealCount} {mealCount === 1 ? "meal" : "meals"}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

export function StatView({
  model,
}: {
  model: ReturnType<typeof useStatPresentation>;
}): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { shared, tone, icon, value, label, note } = model.props;
      const isActive = note === "Currently active";
      return (
        <View style={shared.stat}>
          <View style={[shared.statIcon, { backgroundColor: `${tone}22` }]}>
            <Ionicons name={icon} size={18} color={tone} />
          </View>
          <Text style={shared.statValue}>{value}</Text>
          <View style={shared.statSubRow}>
            <Text style={shared.statLabel}>{label}</Text>
            <Text style={isActive ? shared.statNoteActive : shared.statNote}>{note}</Text>
          </View>
        </View>
      );
    }
  }
}

export function PlanCardView({
  model,
}: {
  model: ReturnType<typeof usePlanCardPresentation>;
}): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { shared, index, plan, onEdit, planCategory, mealCount } = model.props;
      const imageUri = getPlanImageUri(plan, index);

      return (
        <View style={shared.card}>
          <View style={shared.imageWrap}>
            <Image
              source={{ uri: imageUri }}
              defaultSource={dietImage}
              style={shared.cardImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={["transparent", "rgba(0, 0, 0, 0.35)", "rgba(0, 0, 0, 0.95)"]}
              locations={[0.2, 0.65, 1.0]}
              style={shared.imageOverlay}
            />
            <View style={shared.statusBadge}>
              <Text style={shared.statusText}>{plan.is_active ? "ACTIVE" : "DRAFT"}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="More options"
              onPress={onEdit}
              style={shared.moreButton}
            >
              <Ionicons name="ellipsis-vertical" size={15} color="#FFFFFF" />
            </Pressable>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Edit ${plan.title}`}
            onPress={onEdit}
            style={shared.cardBody}
          >
            <Text numberOfLines={1} style={shared.cardTitle}>
              {plan.title}
            </Text>
            <Text numberOfLines={1} style={shared.category}>
              {planCategory(plan)}
            </Text>
            <View style={shared.assignedBox}>
              <Text numberOfLines={1} style={shared.assignedText}>
                Assigned to <Text style={shared.assignedBold}>{plan.member_name || "Unassigned"}</Text>
              </Text>
            </View>
            <View style={shared.cardFooter}>
              <View style={shared.footerItem}>
                <Ionicons name="flame" size={13} color="#E91E63" />
                <Text style={shared.caloriesText}>
                  {(plan.calories_per_day || 0).toLocaleString()} kcal
                </Text>
              </View>
              <View style={shared.footerItem}>
                <Ionicons name="restaurant-outline" size={12} color="#F2F2F7" />
                <Text style={shared.mealsText}>
                  {mealCount} {mealCount === 1 ? "meal" : "meals"}
                </Text>
              </View>
            </View>
          </Pressable>
        </View>
      );
    }
  }
}

import { showAlert } from "../../../../utils/appAlert";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Image, Pressable, Text, TextInput, View } from "react-native";
import { Screen } from "../../components/Screen";
import { NutritionAppearance } from "../../components/NutritionAppearance";
import { ResourceCrudPanel } from "../../../../features/operations/ResourceCrudPanel";
import { dietPlanConfig } from "../../../../features/operations/resourceConfigs";
import { getApiErrorMessage } from "../../../../services/api/client";
import { AccessDeniedScreen } from "../../../../screens/saas/AccessDeniedScreen";
import type * as React from "react";
import type { useDietPlansScreenPresentation, useStatPresentation, usePlanCardPresentation } from "../../../../screens/saas/DietPlansScreen";

const MEAL_IMAGES_BY_KEY: Record<string, string> = {
  maintenance: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80",
  "meal plan": "https://images.unsplash.com/photo-1547496502-affa22d38842?w=600&auto=format&fit=crop&q=80",
  custom: "https://images.unsplash.com/photo-1547496502-affa22d38842?w=600&auto=format&fit=crop&q=80",
  medical: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80",
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

export function DietPlansScreenView({ model }: { model: ReturnType<typeof useDietPlansScreenPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      return <AccessDeniedScreen />;
    }
    case "view2": {
      const {
        styles,
        colors,
        navigation,
        setEditRecordId,
        setFormModalOpen,
        setCreateRequest,
        Stat,
        plans,
        activePlans,
        assignedClients,
        averageCalories,
        search,
        setSearch,
        setPage,
        setActiveOnly,
        activeOnly,
        setAscending,
        ascending,
        categories,
        setCategory,
        category,
        listQuery,
        visiblePlans,
        PlanCard,
        formModalOpen,
        editRecordId,
        createRequest,
        planCategory,
        filteredPlans,
        safePage,
        pageSize,
        pageCount,
      } = model.props;

      if (formModalOpen)
        return (
          <NutritionAppearance>
            {(colors) => (
              <Screen scroll keyboard maxWidth="dashboard" contentContainerStyle={{ gap: 24, paddingBottom: 48 }}>
                <View style={{ gap: 12 }}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Back to diet plans"
                    onPress={() => {
                      setFormModalOpen(false);
                      setEditRecordId(null);
                    }}
                    style={{ minHeight: 44, flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start" }}
                  >
                    <Ionicons name="chevron-back" size={22} color={colors.primary} />
                    <Text style={{ color: colors.primary, fontSize: 17 }}>Diet plans</Text>
                  </Pressable>
                  <Text accessibilityRole="header" style={{ color: colors.ink, fontSize: 28, lineHeight: 34, fontWeight: "700", letterSpacing: -0.7 }}>
                    {editRecordId ? "Edit diet plan" : "Create diet plan"}
                  </Text>
                  <Text style={{ color: colors.muted, fontSize: 17, lineHeight: 24 }}>A daily plan, tailored to your client.</Text>
                </View>
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
                    setPage(0);
                  }}
                />
              </Screen>
            )}
          </NutritionAppearance>
        );

      return (
        <Screen scroll maxWidth="none" contentContainerStyle={styles.screen}>
          {/* Header Card */}
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Go back"
                onPress={() => navigation.goBack()}
                style={styles.backIcon}
              >
                <Ionicons name="chevron-back" size={20} color="#F2F2F7" />
              </Pressable>
              <View>
                <Text style={styles.title}>Diet Plans</Text>
                <Text style={styles.subtitle}>Create and manage nutrition plans for your clients</Text>
              </View>
            </View>
            <View style={styles.headerActions}>
              <Pressable
                accessibilityRole="button"
                onPress={() => showAlert("Import JSON", "JSON import is ready for file-picker integration.")}
                style={styles.importButton}
              >
                <Ionicons name="document-text-outline" size={17} color="#34C759" />
                <Text style={styles.importText}>Import JSON</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setEditRecordId(null);
                  setFormModalOpen(true);
                  setCreateRequest((value) => value + 1);
                }}
                style={styles.createButton}
              >
                <Ionicons name="add" size={18} color="#FFFFFF" />
                <Text style={styles.createText}>Create New Plan</Text>
              </Pressable>
            </View>
          </View>

          {/* 4 KPI Stat Cards */}
          <View style={styles.statsGrid}>
            <Stat icon="restaurant" tone="#E91E63" value={String(plans.length)} label="Total Plans" note="All time" />
            <Stat icon="checkmark-circle-outline" tone="#34C759" value={String(activePlans.length)} label="Active Plans" note="Currently active" />
            <Stat icon="people-outline" tone="#E91E63" value={String(assignedClients)} label="Assigned Clients" note="Across all plans" />
            <Stat icon="flame" tone="#E91E63" value={averageCalories.toLocaleString()} label="Avg. Daily Calories" note="All plans average" />
          </View>

          {/* Search & Filter Toolbar */}
          <View style={styles.toolbar}>
            <View style={styles.searchBox}>
              <Ionicons name="search" size={18} color="#F2F2F7" />
              <TextInput
                value={search}
                onChangeText={(value) => {
                  setSearch(value);
                  setPage(0);
                }}
                placeholder="Search diet plans by name, goal or client..."
                placeholderTextColor="#F2F2F7"
                style={styles.searchInput}
              />
              {search ? (
                <Pressable accessibilityRole="button" onPress={() => setSearch("")}>
                  <Ionicons name="close-circle" size={18} color="#F2F2F7" />
                </Pressable>
              ) : null}
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => setActiveOnly((value) => !value)}
              style={styles.filterButton}
            >
              <View style={[styles.statusDot, { backgroundColor: activeOnly ? "#34C759" : "#F2F2F7" }]} />
              <Text style={styles.filterText}>{activeOnly ? "Active" : "All Status"}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => setAscending((value) => !value)}
              style={styles.filterButton}
            >
              <Ionicons name="swap-vertical" size={16} color="#F2F2F7" />
              <Text style={styles.filterText}>Sort: {ascending ? "A - Z" : "Z - A"}</Text>
            </Pressable>
          </View>

          {/* Category Filter Tabs */}
          <View style={styles.tabs}>
            {categories.map((item) => (
              <Pressable
                accessibilityRole="button"
                key={item}
                onPress={() => {
                  setCategory(item);
                  setPage(0);
                }}
                style={[styles.tab, category === item && styles.tabActive]}
              >
                <Text style={[styles.tabText, category === item && styles.tabTextActive]}>{item}</Text>
              </Pressable>
            ))}
          </View>

          {/* Diet Plan Cards Grid */}
          {listQuery.isLoading ? (
            <View style={styles.state}>
              <ActivityIndicator size="large" color="#E91E63" />
              <Text style={styles.stateText}>Loading diet plans...</Text>
            </View>
          ) : listQuery.error ? (
            <View style={styles.state}>
              <Ionicons name="alert-circle-outline" size={30} color="#FF3B30" />
              <Text style={styles.stateText}>{getApiErrorMessage(listQuery.error)}</Text>
            </View>
          ) : visiblePlans.length ? (
            <View style={styles.cardGrid}>
              {visiblePlans.map((plan, index) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  index={index}
                  onEdit={() => {
                    setEditRecordId(plan.id);
                    setFormModalOpen(true);
                  }}
                />
              ))}
            </View>
          ) : (
            <View style={styles.state}>
              <Ionicons name="restaurant-outline" size={34} color="#E91E63" />
              <Text style={styles.stateTitle}>No diet plans found</Text>
              <Text style={styles.stateText}>Change the filters or create a new nutrition plan.</Text>
            </View>
          )}

          {/* Pagination Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {filteredPlans.length
                ? `Showing ${safePage * pageSize + 1} to ${Math.min((safePage + 1) * pageSize, filteredPlans.length)} of ${filteredPlans.length} plans`
                : "Showing 0 plans"}
            </Text>
            <View style={styles.pagination}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Previous"
                disabled={safePage === 0}
                onPress={() => setPage((value) => Math.max(0, value - 1))}
                style={[styles.pageButton, safePage === 0 && styles.disabled]}
              >
                <Ionicons name="chevron-back" size={16} color="#F2F2F7" />
              </Pressable>
              {Array.from({ length: Math.min(3, pageCount) }, (_, index) => index).map((number) => (
                <Pressable
                  accessibilityRole="button"
                  key={number}
                  onPress={() => setPage(number)}
                  style={[styles.pageButton, safePage === number && styles.pageButtonActive]}
                >
                  <Text style={[styles.pageText, safePage === number && styles.pageTextActive]}>{number + 1}</Text>
                </Pressable>
              ))}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Next"
                disabled={safePage >= pageCount - 1}
                onPress={() => setPage((value) => Math.min(pageCount - 1, value + 1))}
                style={[styles.pageButton, safePage >= pageCount - 1 && styles.disabled]}
              >
                <Ionicons name="chevron-forward" size={16} color="#F2F2F7" />
              </Pressable>
            </View>
          </View>
        </Screen>
      );
    }
  }
}

export function StatView({ model }: { model: ReturnType<typeof useStatPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { shared, tone, icon, value, label, note } = model.props;
      return (
        <View style={shared.stat}>
          <View style={[shared.statIcon, { backgroundColor: `${tone}20` }]}>
            <Ionicons name={icon} size={22} color={tone} />
          </View>
          <Text style={shared.statValue}>{value}</Text>
          <View style={shared.statSubRow}>
            <Text style={shared.statLabel}>{label}</Text>
            <Text style={[shared.statNote, note === "Currently active" && { color: "#34C759", fontWeight: "600" }]}>
              {note}
            </Text>
          </View>
        </View>
      );
    }
  }
}

export function PlanCardView({ model }: { model: ReturnType<typeof usePlanCardPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { shared, dietImage, index, plan, onEdit, planCategory, mealCount } = model.props;
      const lowerTitle = plan.title.toLowerCase();
      const lowerCategory = planCategory(plan).toLowerCase();
      const matchedImageUri =
        MEAL_IMAGES_BY_KEY[lowerTitle] ||
        MEAL_IMAGES_BY_KEY[lowerCategory] ||
        DEFAULT_MEAL_IMAGES[index % DEFAULT_MEAL_IMAGES.length];
      const imageSource = matchedImageUri ? { uri: matchedImageUri } : dietImage;

      return (
        <View style={shared.card}>
          <View style={shared.imageWrap}>
            <Image
              source={imageSource}
              defaultSource={dietImage}
              style={shared.cardImage}
              resizeMode="cover"
            />
            <View style={shared.imageOverlay} />
            <View style={shared.statusBadge}>
              <Text style={shared.statusText}>{plan.is_active ? "ACTIVE" : "DRAFT"}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="More options"
              onPress={onEdit}
              style={shared.moreButton}
            >
              <Ionicons name="ellipsis-vertical" size={16} color="#FFFFFF" />
            </Pressable>
          </View>
          <View style={shared.cardBody}>
            <Text numberOfLines={1} style={shared.cardTitle}>
              {plan.title}
            </Text>
            <Text style={shared.category}>{planCategory(plan)}</Text>
            <View style={shared.assignedBox}>
              <Text numberOfLines={1} style={shared.assignedText}>
                Assigned to <Text style={shared.assignedBold}>{plan.member_name || "Unassigned"}</Text>
              </Text>
            </View>
            <View style={shared.cardFooter}>
              <View style={shared.footerItem}>
                <Ionicons name="flame" size={15} color="#E91E63" />
                <Text style={shared.caloriesText}>{plan.calories_per_day.toLocaleString()} kcal</Text>
              </View>
              <View style={shared.footerItem}>
                <Ionicons name="restaurant-outline" size={14} color="#F2F2F7" />
                <Text style={shared.mealsText}>{mealCount} meals</Text>
              </View>
            </View>
          </View>
        </View>
      );
    }
  }
}

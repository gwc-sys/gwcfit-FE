import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { AppHeader } from "../../components/AppHeader";
import { EmptyState } from "../../components/EmptyState";
import { InfoRow } from "../../components/InfoRow";
import { ProgressRing } from "../../components/ProgressRing";
import { Screen } from "../../components/Screen";
import { SectionHeader } from "../../components/SectionHeader";
import { StatusBadge } from "../../components/StatusBadge";
import { SurfacePanel } from "../../components/SurfacePanel";
import { meals } from "../../data/meals";
import { colors, radius, shadows, spacing, typography } from "../../theme/theme";

const macroSummary = meals.reduce(
  (summary, meal) => ({
    calories: summary.calories + meal.calories,
    protein: summary.protein + meal.protein,
    carbs: summary.carbs + meal.carbs,
    fat: summary.fat + meal.fat
  }),
  { calories: 0, protein: 0, carbs: 0, fat: 0 }
);

export function DietPlanScreen() {
  const [search, setSearch] = useState("");
  const visibleMeals = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) {
      return meals;
    }

    return meals.filter((meal) =>
      `${meal.title} ${meal.time} ${meal.items.join(" ")}`.toLowerCase().includes(normalizedSearch)
    );
  }, [search]);

  return (
    <Screen scroll contentContainerStyle={styles.screen}>
      <AppHeader title="Meal Plan" subtitle="Daily nutrition" rightIcon="calendar-outline" />

      <View style={styles.summary}>
        <View style={styles.summaryCopy}>
          <StatusBadge label="Today" tone="success" />
          <Text style={styles.summaryValue}>{macroSummary.calories}</Text>
          <Text style={styles.summaryMeta}>kcal target</Text>
        </View>
        <ProgressRing size={112} strokeWidth={12} progress={0.72} value="72%" label="On track" />
      </View>

      <View style={styles.macroGrid}>
        <Macro icon="fitness-outline" value={`${macroSummary.protein}g`} label="Protein" />
        <Macro icon="leaf-outline" value={`${macroSummary.carbs}g`} label="Carbs" />
        <Macro icon="water-outline" value={`${macroSummary.fat}g`} label="Fats" />
      </View>

      <SurfacePanel title="Meals" kicker={`${visibleMeals.length} scheduled`} icon="restaurant-outline">
        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={20} color={colors.muted} />
          <TextInput
            autoCapitalize="none"
            onChangeText={setSearch}
            placeholder="Search meals or ingredients"
            placeholderTextColor={colors.subtle}
            style={styles.searchInput}
            value={search}
          />
          {search ? (
            <Pressable accessibilityRole="button" onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={20} color={colors.muted} />
            </Pressable>
          ) : null}
        </View>

        <View style={styles.mealList}>
          {visibleMeals.map((meal) => (
            <View key={meal.id} style={styles.mealCard}>
              <View style={styles.mealIcon}>
                <Ionicons name="restaurant" size={22} color={colors.primaryDark} />
              </View>
              <View style={styles.mealBody}>
                <View style={styles.mealTop}>
                  <Text style={styles.mealName}>{meal.title}</Text>
                  <StatusBadge label={meal.time} tone="info" />
                </View>
                <Text style={styles.mealMeta}>{meal.calories} kcal</Text>
                <View style={styles.tags}>
                  {meal.items.map((tag) => (
                    <Text key={tag} style={styles.tag}>{tag}</Text>
                  ))}
                </View>
              </View>
            </View>
          ))}
          {visibleMeals.length === 0 ? (
            <EmptyState title="No meals match" message="Clear the search or try another ingredient." actionLabel="Clear Search" onAction={() => setSearch("")} />
          ) : null}
        </View>
      </SurfacePanel>

      <SectionHeader title="Suggestions" />
      <SurfacePanel title="Next best actions" icon="sparkles">
        <InfoRow icon="sparkles" label="Add 20g protein after training" value="Smart swap" />
        <InfoRow icon="water-outline" label="Raise hydration before cardio" value="+2 cups" />
        <InfoRow icon="time-outline" label="Move dinner earlier on workout days" value="7:30 PM" />
      </SurfacePanel>
    </Screen>
  );
}

function Macro({ icon, value, label }: { icon: keyof typeof Ionicons.glyphMap; value: string; label: string }) {
  return (
    <View style={styles.macro}>
      <Ionicons name={icon} size={22} color={colors.primaryDark} />
      <Text style={styles.macroValue}>{value}</Text>
      <Text style={styles.macroLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 112
  },
  summary: {
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...shadows.card
  },
  summaryCopy: {
    gap: spacing.xs
  },
  summaryValue: {
    ...typography.title,
    color: colors.ink,
    marginTop: spacing.xs
  },
  summaryMeta: {
    ...typography.small,
    color: colors.muted
  },
  macroGrid: {
    flexDirection: "row",
    gap: spacing.md
  },
  macro: {
    flex: 1,
    alignItems: "center",
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white
  },
  macroValue: {
    ...typography.h3,
    color: colors.ink
  },
  macroLabel: {
    ...typography.small,
    color: colors.muted
  },
  searchWrap: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white
  },
  searchInput: {
    flex: 1,
    color: colors.ink,
    ...typography.body
  },
  mealList: {
    gap: spacing.md
  },
  mealCard: {
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border
  },
  mealIcon: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft
  },
  mealBody: {
    flex: 1
  },
  mealTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  mealName: {
    ...typography.body,
    flex: 1,
    color: colors.ink,
    fontWeight: "800"
  },
  mealMeta: {
    ...typography.small,
    color: colors.muted,
    marginTop: 2
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.sm
  },
  tag: {
    ...typography.small,
    color: colors.primaryDark,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    overflow: "hidden"
  }
});

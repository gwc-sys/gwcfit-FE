import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Beef, Leaf, Wheat } from "./icons";

import type { Meal } from "../types/fitness";
import { useAppTheme } from "../theme/AppThemeProvider";
import { radius, spacing, typography } from "../theme/theme";
import type { ThemeColors } from "../theme/theme";

type MealCardProps = {
  meal: Meal;
};

export function MealCard({ meal }: MealCardProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.copy}>
          <Text style={styles.time}>{meal.time}</Text>
          <Text style={styles.title}>{meal.title}</Text>
        </View>
        <View style={styles.calories}>
          <Text style={styles.calorieValue}>{meal.calories}</Text>
          <Text style={styles.calorieLabel}>kcal</Text>
        </View>
      </View>
      <View style={styles.macroRow}>
        <View style={styles.macro}>
          <Beef size={18} color={colors.success} />
          <Text style={styles.macroText}>{meal.protein}g protein</Text>
        </View>
        <View style={styles.macro}>
          <Wheat size={18} color={colors.info} />
          <Text style={styles.macroText}>{meal.carbs}g carbs</Text>
        </View>
        <View style={styles.macro}>
          <Leaf size={18} color={colors.warning} />
          <Text style={styles.macroText}>{meal.fat}g fat</Text>
        </View>
      </View>
      <Text style={styles.items}>{meal.items.join(" | ")}</Text>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: spacing.lg,
      gap: spacing.md
    },
    topRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: spacing.md
    },
    copy: {
      flex: 1,
      minWidth: 0
    },
    time: {
      color: colors.success,
      ...typography.small,
      fontWeight: "900",
      marginBottom: 6
    },
    title: {
      color: colors.ink,
      ...typography.h3,
      fontWeight: "900"
    },
    calories: {
      alignItems: "flex-end"
    },
    calorieValue: {
      color: colors.ink,
      ...typography.h3,
      fontWeight: "900"
    },
    calorieLabel: {
      color: colors.muted,
      fontWeight: "700"
    },
    macroRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10
    },
    macro: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: radius.pill,
      backgroundColor: colors.surfaceMuted
    },
    macroText: {
      color: colors.muted,
      fontWeight: "800"
    },
    items: {
      color: colors.muted,
      ...typography.body
    }
  });

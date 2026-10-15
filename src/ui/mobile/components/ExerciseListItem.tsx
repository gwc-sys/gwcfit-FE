import { Pressable } from "./NativePressable";
import { useMemo } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { Clock, Flame } from "./icons";
import type { Exercise } from "../../../types/fitness";
import { useAppTheme } from "../../../theme/AppThemeProvider";
import { radius, shadows, spacing, typography } from "../theme/theme";
import type { ThemeColors } from "../theme/theme";

type ExerciseListItemProps = {
  exercise: Exercise;
  onPress?: () => void;
};

export function ExerciseListItem({ exercise, onPress }: ExerciseListItemProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <Image source={exercise.image} style={styles.image} />
      <View style={styles.content}>
        <Text numberOfLines={1} style={styles.title}>
          {exercise.title}
        </Text>
        <View style={styles.metaRow}>
          <Clock size={17} color={colors.muted} />
          <Text style={styles.meta}>{exercise.duration}</Text>
          <Text style={styles.dot}>-</Text>
          <Flame size={17} color={colors.muted} />
          <Text style={styles.meta}>{exercise.calories} kcal</Text>
        </View>
      </View>
    </Pressable>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      minHeight: 106,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      backgroundColor: colors.surface,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      ...shadows.subtle
    },
    image: {
      width: 74,
      height: 74,
      borderRadius: radius.sm,
      backgroundColor: colors.surfaceStrong
    },
    content: {
      flex: 1,
      gap: 10
    },
    title: {
      color: colors.ink,
      ...typography.h3,
      fontWeight: "900"
    },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      flexWrap: "wrap"
    },
    meta: {
      color: colors.muted,
      ...typography.body,
      fontWeight: "600"
    },
    dot: {
      color: colors.muted
    },
    pressed: {
      opacity: 0.82
    }
  });

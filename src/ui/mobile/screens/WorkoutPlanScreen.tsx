import { Pressable } from "../components/NativePressable";
import { ScrollView, Text, View } from "react-native";
import { CalendarDays, Dumbbell, MoreVertical } from "../components/icons";
import { AppScreen } from "../components/AppScreen";
import { ExerciseListItem } from "../components/ExerciseListItem";
import { Header } from "../components/Header";
import { PrimaryButton } from "../components/PrimaryButton";
import { WorkoutCard } from "../components/WorkoutCard";
import { palette } from "../theme/theme";
import type * as React from "react";
import type { useWorkoutPlanScreenPresentation } from "../../../screens/WorkoutPlanScreen";

export function WorkoutPlanScreenView({ model }: { model: ReturnType<typeof useWorkoutPlanScreenPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { plan, styles, weeks, navigation } = model.props;
      return ((
    <AppScreen>
      <Header title={plan.title} right={<MoreVertical color={palette.text} size={30} />} />
      <WorkoutCard plan={plan} />
      <Text style={styles.summary}>{plan.summary}</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.weekRow}>
        {weeks.map((week, index) => (
          <Pressable accessibilityRole="button" key={week} style={[styles.weekChip, index === 0 && styles.weekActive]}>
            <Text style={[styles.weekText, index === 0 && styles.weekTextActive]}>{week}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.planStats}>
        <View style={styles.stat}>
          <Dumbbell color={palette.green} size={24} />
          <Text style={styles.statValue}>{plan.sessionsPerWeek}x</Text>
          <Text style={styles.statLabel}>per week</Text>
        </View>
        <View style={styles.stat}>
          <CalendarDays color={palette.green} size={24} />
          <Text style={styles.statValue}>{plan.durationWeeks}</Text>
          <Text style={styles.statLabel}>weeks</Text>
        </View>
      </View>

      <Text style={styles.date}>Today, 20 December</Text>
      <View style={styles.list}>
        {plan.exercises.map((exercise) => (
          <ExerciseListItem
            key={exercise.id}
            exercise={exercise}
            onPress={() => navigation.navigate("ExerciseDetail", { exerciseId: exercise.id })}
          />
        ))}
      </View>
      <PrimaryButton
        label="Start Now"
        style={styles.cta}
        onPress={() => navigation.navigate("ExerciseDetail", { exerciseId: plan.exercises[0].id })}
      />
    </AppScreen>
  ));
    }
  }
}

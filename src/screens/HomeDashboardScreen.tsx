import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { Bell, Bot, Droplets, Flame, Footprints, Sparkles } from "../components/icons";

import { AppScreen } from "../components/AppScreen";
import { ExerciseListItem } from "../components/ExerciseListItem";
import { MetricBarChart } from "../components/MetricBarChart";
import { PrimaryButton } from "../components/PrimaryButton";
import { WorkoutCard } from "../components/WorkoutCard";
import { images } from "../assets/images";
import { weekBars } from "../data/progress";
import { useFitnessStore } from "../store/useFitnessStore";
import { useAppTheme } from "../theme/AppThemeProvider";
import { radius, shadows, spacing, typography } from "../theme/theme";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList>;

export function HomeDashboardScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  const { profile, plans, setSelectedPlan } = useFitnessStore();
  const selectedPlan = plans[0];

  return (
    <AppScreen>
      <View style={styles.topRow}>
        <View>
          <Text style={[styles.date, { color: colors.muted }]}>Friday, 20 May</Text>
          <Text style={[styles.greeting, { color: colors.ink }]}>Good morning</Text>
        </View>
        <Pressable style={[styles.bell, { borderColor: colors.border }]}> 
          <Bell size={28} color={colors.ink} />
          <View style={styles.dot} />
        </Pressable>
      </View>

      <LinearGradient colors={["#1E3A8A", "#6366F1"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.calorieCard}>
        <View style={styles.cardHeader}>
          <View style={styles.metricTitle}>
            <Flame size={27} color={colors.success} />
            <Text style={[styles.metricTitleText, { color: colors.white }]}>Calories</Text>
          </View>
          <Text style={[styles.week, { color: colors.white }]}>Week</Text>
        </View>
        <MetricBarChart bars={weekBars} height={140} />
      </LinearGradient>

      <View style={[styles.aiCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}> 
        <View style={[styles.aiIcon, { backgroundColor: colors.primary }]}> 
          <Bot size={30} color={colors.white} />
        </View>
        <View style={styles.aiCopy}>
          <Text style={[styles.aiTitle, { color: colors.ink }]}>AI plan is ready</Text>
          <Text style={[styles.aiSubtitle, { color: colors.muted }]}>Generate a plan around your goal, equipment, and time.</Text>
        </View>
        <PrimaryButton label="Generate" style={styles.aiButton} onPress={() => navigation.navigate("AIWorkoutGenerator")} />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.ink }]}>Featured plan</Text>
        <Pressable onPress={() => navigation.navigate("WorkoutPlan")}>
          <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
        {plans.map((plan) => (
          <WorkoutCard
            key={plan.id}
            plan={plan}
            onPress={() => {
              setSelectedPlan(plan.id);
              navigation.navigate("WorkoutPlan");
            }}
          />
        ))}
      </ScrollView>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.ink }]}>Today</Text>
        <Text style={[styles.seeAll, { color: colors.primary }]}>3 sessions</Text>
      </View>
      <View style={styles.statsRow}>
        <View style={[styles.statPill, { backgroundColor: colors.primarySoft }]}> 
          <Footprints color={colors.primary} size={22} />
          <Text style={[styles.statValue, { color: colors.ink }]}>{profile.stepsKm} km</Text>
        </View>
        <View style={[styles.statPill, { backgroundColor: colors.successSoft }]}> 
          <Droplets color={colors.success} size={22} />
          <Text style={[styles.statValue, { color: colors.ink }]}>{profile.waterCups} cups</Text>
        </View>
        <View style={[styles.statPill, { backgroundColor: colors.warningSoft }]}> 
          <Sparkles color={colors.warning} size={22} />
          <Text style={[styles.statValue, { color: colors.ink }]}>{profile.goal}</Text>
        </View>
      </View>

      <View style={[styles.nextCard, { backgroundColor: colors.surface, borderColor: colors.border, ...shadows.subtle }]}> 
        <Image source={images.strengthCategory} style={styles.nextImage} />
        <View style={styles.nextContent}>
          <Text style={[styles.nextKicker, { color: colors.primary }]}>Next workout</Text>
          <Text style={[styles.nextTitle, { color: colors.ink }]}>{selectedPlan.exercises[0].title}</Text>
          <ExerciseListItem
            exercise={selectedPlan.exercises[0]}
            onPress={() =>
              navigation.navigate("ExerciseDetail", {
                exerciseId: selectedPlan.exercises[0].id
              })
            }
          />
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  topRow: {
    paddingTop: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  date: {
    ...typography.body,
    fontWeight: "700",
    marginBottom: 6
  },
  greeting: {
    ...typography.title
  },
  bell: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  dot: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#F43F5E",
    top: 14,
    right: 14
  },
  calorieCard: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    ...shadows.soft
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md
  },
  metricTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  metricTitleText: {
    ...typography.h3,
    fontWeight: "900"
  },
  week: {
    ...typography.body,
    fontWeight: "800"
  },
  aiCard: {
    marginTop: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  aiIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center"
  },
  aiCopy: {
    flex: 1
  },
  aiTitle: {
    ...typography.body,
    fontWeight: "900"
  },
  aiSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4
  },
  aiButton: {
    minHeight: 44,
    width: 112,
    borderRadius: radius.sm,
    ...shadows.none
  },
  sectionHeader: {
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  sectionTitle: {
    ...typography.h2,
    fontWeight: "900"
  },
  seeAll: {
    ...typography.body,
    fontWeight: "800"
  },
  carousel: {
    gap: spacing.md,
    paddingRight: 24
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  statPill: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: radius.pill,
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  statValue: {
    fontWeight: "800"
  },
  nextCard: {
    marginTop: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: "hidden"
  },
  nextImage: {
    width: "100%",
    height: 150,
    backgroundColor: "#94A3B8"
  },
  nextContent: {
    padding: spacing.lg,
    gap: spacing.md
  },
  nextKicker: {
    fontWeight: "900"
  },
  nextTitle: {
    ...typography.h2,
    fontWeight: "900"
  }
});

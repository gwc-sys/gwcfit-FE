import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useMemo } from "react";

import { BarChart } from "../../components/BarChart";
import { MetricCard } from "../../components/MetricCard";
import { PhotoCard } from "../../components/PhotoCard";
import { Pill } from "../../components/Pill";
import { QuickAction } from "../../components/QuickAction";
import { Screen } from "../../components/Screen";
import { SectionHeader } from "../../components/SectionHeader";
import { StatusBadge } from "../../components/StatusBadge";
import { weeklyBars } from "../../data/metrics";
import { reportsApi } from "../../services/api/reports";
import { useAuthStore } from "../../store/useAuthStore";
import { useFitnessStore } from "../../store/useFitnessStore";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { radius, shadows, spacing, typography } from "../../theme/theme";
import type { ThemeColors } from "../../theme/theme";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

function formatDate() {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric"
  }).format(new Date());
}

export function HomeDashboardScreen() {
  const navigation = useNavigation<any>();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const user = useAuthStore((state) => state.user);
  const canViewReports = useAuthStore((state) => state.hasPermission("manage_reports"));
  const { profile, plans, setSelectedPlan } = useFitnessStore();
  const featuredPlan = plans[0];
  const categories = Array.from(new Set(plans.map((plan) => plan.goal)));
  const { data: stats } = useQuery({
    queryKey: ["reports", "dashboard", "home"],
    queryFn: reportsApi.dashboard,
    enabled: canViewReports
  });

  const displayName = user?.full_name ?? profile.name;

  const openPlan = (planId: string) => {
    setSelectedPlan(planId);
    navigation.navigate("WorkoutPlan", { planId });
  };

  return (
    <Screen scroll contentContainerStyle={styles.screen}>
      <View style={styles.hero}>
        <View style={styles.topRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.heroTextWrap}>
            <Text style={styles.date}>{formatDate()}</Text>
            <Text style={styles.greeting} numberOfLines={1}>
              Hi, {displayName.split(" ")[0]}
            </Text>
          </View>
          <View style={styles.bell}>
            <Ionicons name="notifications-outline" size={24} color={colors.ink} />
            <View style={styles.dot} />
          </View>
        </View>
        <View style={styles.heroFooter}>
          <StatusBadge label={(user?.role ?? "member").replace("_", " ")} tone="info" />
          <Text style={styles.heroCopy}>Training, nutrition, and gym operations in one clean workspace.</Text>
        </View>
      </View>

      <View style={styles.quickGrid}>
        <QuickAction
          icon="sparkles"
          title="Generate Plan"
          subtitle="AI workout"
          tone="primary"
          onPress={() => navigation.navigate("AI")}
        />
        <QuickAction
          icon="restaurant-outline"
          title="Today's Meals"
          subtitle={`${profile.waterCups} cups logged`}
          tone="accent"
          onPress={() => navigation.navigate("Meals")}
        />
        <QuickAction
          icon="stats-chart-outline"
          title="Progress"
          subtitle="Weekly trend"
          tone="info"
          onPress={() => navigation.navigate("Progress")}
        />
      </View>

      {stats ? (
        <View style={styles.metricRow}>
          <MetricCard label="Members" value={String(stats.active_members)} icon="people-outline" footer="Active" />
          <MetricCard
            label="Revenue"
            value={currency.format(stats.revenue_cents_this_month / 100)}
            icon="card-outline"
            footer="This month"
          />
        </View>
      ) : (
        <View style={styles.metricRow}>
          <MetricCard label="Calories" value="2,430" suffix="kcal" icon="flame-outline" footer="Today" />
          <MetricCard label="Workouts" value="4" suffix="days" icon="barbell-outline" footer="This week" />
        </View>
      )}

      <View style={styles.calorieCard}>
        <View style={styles.cardTitleRow}>
          <View style={styles.cardTitleLeft}>
            <Ionicons name="analytics-outline" size={24} color={colors.primaryDark} />
            <Text style={styles.cardTitle}>Weekly Activity</Text>
          </View>
          <Text style={styles.week}>7 days</Text>
        </View>
        <BarChart data={weeklyBars} />
      </View>

      <SectionHeader title="Featured Plan" action="Open" onAction={() => openPlan(featuredPlan.id)} />
      <PhotoCard
        image={featuredPlan.heroImage}
        title={featuredPlan.title}
        meta={`${featuredPlan.durationWeeks} weeks - ${featuredPlan.sessionsPerWeek}x/week`}
        buttonLabel="Start Now"
        onPress={() => openPlan(featuredPlan.id)}
      />

      <SectionHeader title="Workout Programs" action="Browse" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillRow}>
        {categories.map((category, index) => (
          <Pill key={category} label={category} selected={index === 0} />
        ))}
      </ScrollView>

      <View style={styles.programGrid}>
        {plans.map((plan) => (
          <PhotoCard
            key={plan.id}
            compact
            image={plan.heroImage}
            title={plan.title}
            meta={plan.level}
            badge={plan.goal}
            onPress={() => openPlan(plan.id)}
          />
        ))}
      </View>

      <View style={styles.aiStrip}>
        <View style={styles.aiIcon}>
          <Ionicons name="sparkles" size={22} color={colors.white} />
        </View>
        <View style={styles.aiCopy}>
          <Text style={styles.aiTitle}>AI coach is tuned for {profile.level.toLowerCase()}</Text>
          <Text style={styles.aiText}>{profile.goal}</Text>
        </View>
      </View>
    </Screen>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  screen: {
    paddingTop: spacing.md,
    paddingBottom: 112
  },
  hero: {
    gap: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceElevated,
    padding: spacing.md,
    ...shadows.card
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  avatar: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    backgroundColor: colors.ink
  },
  avatarText: {
    ...typography.h3,
    color: colors.white
  },
  heroTextWrap: {
    flex: 1
  },
  date: {
    ...typography.small,
    color: colors.muted
  },
  greeting: {
    ...typography.h2,
    color: colors.ink,
    marginTop: 2
  },
  bell: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.surfaceMuted
  },
  dot: {
    position: "absolute",
    top: 13,
    right: 13,
    width: 10,
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.danger
  },
  heroFooter: {
    gap: spacing.sm
  },
  heroCopy: {
    ...typography.body,
    color: colors.muted
  },
  quickGrid: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.lg
  },
  metricRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.lg
  },
  calorieCard: {
    marginTop: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.surfaceMuted,
    backgroundColor: colors.surfaceElevated,
    padding: spacing.lg,
    ...shadows.card
  },
  cardTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  cardTitleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  cardTitle: {
    ...typography.h3,
    color: colors.ink
  },
  week: {
    ...typography.body,
    color: colors.muted
  },
  pillRow: {
    gap: spacing.sm,
    paddingRight: spacing.lg
  },
  programGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginTop: spacing.lg
  },
  aiStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginTop: spacing.xl,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.surfaceMuted
  },
  aiIcon: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    backgroundColor: colors.primary
  },
  aiCopy: {
    flex: 1
  },
  aiTitle: {
    ...typography.body,
    color: colors.ink,
    fontWeight: "800"
  },
  aiText: {
    ...typography.small,
    color: colors.muted,
    marginTop: 2
  }
});

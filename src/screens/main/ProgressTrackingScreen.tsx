import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppHeader } from "../../components/AppHeader";
import { BarChart } from "../../components/BarChart";
import { MetricCard } from "../../components/MetricCard";
import { Pill } from "../../components/Pill";
import { ProgressRing } from "../../components/ProgressRing";
import { Screen } from "../../components/Screen";
import { StatusBadge } from "../../components/StatusBadge";
import { SurfacePanel } from "../../components/SurfacePanel";
import { dailyMetrics, weeklyBars } from "../../data/metrics";
import { colors, radius, spacing, typography } from "../../theme/theme";

type ViewMode = "Daily" | "Calendar";

export function ProgressTrackingScreen() {
  const [mode, setMode] = useState<ViewMode>("Daily");

  return (
    <Screen scroll contentContainerStyle={styles.screen}>
      <AppHeader title="Activity" subtitle="Progress tracking" rightIcon="ellipsis-vertical" />

      <View style={styles.segment}>
        {(["Daily", "Calendar"] as ViewMode[]).map((item) => (
          <Pill key={item} label={item} selected={item === mode} onPress={() => setMode(item)} />
        ))}
      </View>

      <View style={styles.metricRow}>
        <MetricCard label="Calories" value={dailyMetrics.calories.toLocaleString()} suffix="kcal" icon="flame-outline" footer={mode} />
        <MetricCard label="Weight" value={dailyMetrics.weight.toString()} suffix="kg" icon="scale-outline" footer="Latest" />
      </View>

      <SurfacePanel title="Workout Load" kicker="This week" icon="bar-chart-outline">
        <View style={styles.chartHeader}>
          <StatusBadge label="7 day trend" tone="info" />
          <Text style={styles.chartMeta}>Week</Text>
        </View>
        <BarChart data={weeklyBars} />
      </SurfacePanel>

      <View style={styles.ringRow}>
        <View style={styles.ringCard}>
          <Text style={styles.ringTitle}>Steps</Text>
          <ProgressRing progress={0.72} value="72" label="Goal" />
        </View>
        <View style={styles.ringCard}>
          <Text style={styles.ringTitle}>Water</Text>
          <ProgressRing progress={0.7} value={dailyMetrics.water.toString()} label="Cups" />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 112
  },
  segment: {
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted
  },
  metricRow: {
    flexDirection: "row",
    gap: spacing.md
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  chartMeta: {
    ...typography.body,
    color: colors.muted
  },
  ringRow: {
    flexDirection: "row",
    gap: spacing.md
  },
  ringCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white
  },
  ringTitle: {
    ...typography.body,
    color: colors.muted,
    marginBottom: spacing.md
  }
});

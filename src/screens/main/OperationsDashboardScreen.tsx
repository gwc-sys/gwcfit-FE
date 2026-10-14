import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { StyleSheet, Text, View } from "react-native";

import { MetricCard } from "../../components/MetricCard";
import { PermissionGate } from "../../components/PermissionGate";
import { QuickAction } from "../../components/QuickAction";
import { Screen } from "../../components/Screen";
import { StatusBadge } from "../../components/StatusBadge";
import { SurfacePanel } from "../../components/SurfacePanel";
import { GymManagementPanel, MyGymPanel } from "../../features/operations/GymPanels";
import { ResourceCrudPanel } from "../../features/operations/ResourceCrudPanel";
import {
  attendanceConfig,
  dietPlanConfig,
  membershipPlanConfig,
  paymentConfig,
  trainerConfig,
  workoutPlanConfig
} from "../../features/operations/resourceConfigs";
import { CreateGymAdminPanel } from "../../features/rbac/CreateGymAdminPanel";
import { MemberManagementPanel } from "../../features/rbac/MemberManagementPanel";
import { reportsApi } from "../../services/api/reports";
import { useAuthStore } from "../../store/useAuthStore";
import { colors, radius, shadows, spacing, typography } from "../../theme/theme";
import type { PermissionCode } from "../../types/saas";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

const operationalPermissions: PermissionCode[] = [
  "manage_reports",
  "manage_gyms",
  "configure_gym",
  "manage_members",
  "manage_trainers",
  "manage_attendance",
  "manage_payments",
  "manage_membership_plans",
  "manage_workouts",
  "manage_diet_plans"
];

export function OperationsDashboardScreen() {
  const user = useAuthStore((state) => state.user);
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const isSuperAdmin = user?.role === "super_admin";
  const isGymAdmin = user?.role === "gym_owner";
  const availableModules = operationalPermissions.filter((permission) => hasPermission(permission));
  const { data, isLoading, error } = useQuery({
    queryKey: ["reports", "dashboard"],
    queryFn: reportsApi.dashboard,
    enabled: hasPermission("manage_reports")
  });

  return (
    <Screen scroll contentContainerStyle={styles.screen}>
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons name="business-outline" size={24} color={colors.white} />
        </View>
        <View style={styles.heroBody}>
          <Text style={styles.kicker}>{(user?.role ?? "member").replace("_", " ").toUpperCase()}</Text>
          <Text style={styles.title}>Gym Operations</Text>
          <Text style={styles.copy}>Manage the workflows your role is allowed to run.</Text>
        </View>
      </View>

      <View style={styles.quickGrid}>
        <QuickAction icon="key-outline" title={`${availableModules.length} Modules`} subtitle="Enabled" tone="info" />
        <QuickAction icon="shield-checkmark-outline" title="RBAC Ready" subtitle="Backend driven" tone="primary" />
        <QuickAction icon="sync-outline" title="Live Data" subtitle="React Query" tone="accent" />
      </View>

      <PermissionGate permission="manage_reports" fallback={<Text style={styles.message}>Reports are not enabled for this role.</Text>}>
        {isLoading ? <Text style={styles.message}>Loading dashboard statistics...</Text> : null}
        {error ? <Text style={styles.message}>Unable to load dashboard statistics.</Text> : null}
        {data ? (
          <View style={styles.metricGrid}>
            <MetricCard label="Active members" value={String(data.active_members)} icon="people-outline" footer="Membership" />
            <MetricCard label="Trainers" value={String(data.trainers)} icon="barbell-outline" footer="Staff" />
            <MetricCard label="Check-ins" value={String(data.checkins_today)} icon="qr-code-outline" footer="Today" />
            <MetricCard
              label="Revenue"
              value={currency.format(data.revenue_cents_this_month / 100)}
              icon="card-outline"
              footer="This month"
            />
          </View>
        ) : null}
      </PermissionGate>

      <SurfacePanel title="Role Access" kicker="Permissions" icon="lock-open-outline">
        <View style={styles.badgeWrap}>
          {availableModules.map((permission) => (
            <StatusBadge key={permission} label={permission.replace("manage_", "").replace("_", " ")} tone="info" />
          ))}
        </View>
      </SurfacePanel>

      {isSuperAdmin ? <CreateGymAdminPanel /> : null}
      <GymManagementPanel />
      {isGymAdmin ? <MyGymPanel /> : null}
      {isGymAdmin ? <MemberManagementPanel /> : null}
      <ResourceCrudPanel config={trainerConfig} />
      <ResourceCrudPanel config={attendanceConfig} />
      <ResourceCrudPanel config={paymentConfig} />
      <ResourceCrudPanel config={membershipPlanConfig} />
      <ResourceCrudPanel config={workoutPlanConfig} />
      <ResourceCrudPanel config={dietPlanConfig} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 112
  },
  hero: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    padding: spacing.md,
    ...shadows.card
  },
  heroIcon: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    backgroundColor: colors.ink
  },
  heroBody: {
    flex: 1
  },
  kicker: {
    ...typography.small,
    color: colors.muted,
    marginBottom: spacing.xs
  },
  title: {
    ...typography.h1,
    color: colors.ink
  },
  copy: {
    ...typography.body,
    color: colors.muted,
    marginTop: spacing.xs
  },
  quickGrid: {
    flexDirection: "row",
    gap: spacing.sm
  },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md
  },
  badgeWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  message: {
    ...typography.body,
    color: colors.muted
  }
});

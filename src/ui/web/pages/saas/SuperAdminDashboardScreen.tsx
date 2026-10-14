import { Ionicons } from "@expo/vector-icons";
import { Pressable, RefreshControl, Text, View } from "react-native";
import { DataState } from "../../components/DataState";
import { MetricCard } from "../../components/MetricCard";
import { QuickAction } from "../../components/QuickAction";
import { SectionHeader } from "../../components/SectionHeader";
import { StatusBadge } from "../../components/StatusBadge";
import { SurfacePanel } from "../../components/SurfacePanel";
import { PulseDashboardHeader, PulseDashboardLayout, getWelcomeTitle } from "../../../../components/dashboard/PulseDashboardLayout";
import { getApiErrorMessage } from "../../../../services/api/client";
import { formatRole } from "../../../../utils/formatters";
import type * as React from "react";
import type { useSuperAdminDashboardScreenPresentation } from "../../../../screens/saas/SuperAdminDashboardScreen";

export function SuperAdminDashboardScreenView({ model }: { model: ReturnType<typeof useSuperAdminDashboardScreenPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { user, gymsQuery, navigation, styles, stats, recentGyms, colors, healthItems } = model.props;
      return ((
    <PulseDashboardLayout
      activeLabel="Overview"
      roleLabel={user ? formatRole(user.role) : "Super Admin"}
      refreshControl={<RefreshControl refreshing={gymsQuery.isFetching} onRefresh={() => gymsQuery.refetch()} />}
    >
      <PulseDashboardHeader
        title={getWelcomeTitle(user?.full_name)}
        subtitle="Invite gym owners, monitor tenants, and keep platform access clean."
        onNotifications={() => navigation.navigate("Notifications")}
        onMessages={() => navigation.navigate("Notifications")}
      />

      <View style={styles.metrics}>
        <MetricCard label="Gyms" value={String(stats.total)} icon="business-outline" trend="Visible tenants" tone="primary" />
        <MetricCard label="Active" value={String(stats.active)} icon="checkmark-circle-outline" trend="Operating" tone="success" />
        <MetricCard label="Suspended" value={String(stats.suspended)} icon="pause-circle-outline" trend="Restricted" tone="warning" />
      </View>

      <SectionHeader title="Quick Actions" action="Manage shortcuts" onAction={() => navigation.navigate("Settings")} />
      <View style={styles.quickGrid}>
        <QuickAction icon="person-add-outline" title="Invite Owner" subtitle="Secure one-time token" tone="primary" onPress={() => navigation.navigate("Invitations")} />
        <QuickAction icon="business-outline" title="Manage Gyms" subtitle={`${stats.total} loaded`} tone="info" onPress={() => navigation.navigate("ManageGyms")} />
        <QuickAction icon="analytics-outline" title="Reports" subtitle="Platform health" tone="accent" onPress={() => navigation.navigate("Reports")} />
        <QuickAction icon="person-circle-outline" title="Profile" subtitle="Account" tone="warning" onPress={() => navigation.navigate("Profile")} />
      </View>

      <DataState
        loading={gymsQuery.isLoading}
        error={gymsQuery.error ? getApiErrorMessage(gymsQuery.error) : null}
        empty={!gymsQuery.isLoading && recentGyms.length === 0}
        emptyTitle="No gyms found"
        emptyMessage="Invite a gym owner to provision the first tenant."
        emptyActionLabel="Invite Gym Owner"
        onEmptyAction={() => navigation.navigate("Invitations")}
      />

      <View style={styles.lowerGrid}>
        {recentGyms.length > 0 ? (
          <SurfacePanel title="Recent gyms" kicker="Tenant directory" icon="business-outline" actionLabel="View all" onAction={() => navigation.navigate("ManageGyms")} style={styles.recentPanel}>
          <View style={styles.gymList}>
            {recentGyms.map((gym) => (
              <View key={gym.id} style={styles.gymRow}>
                <View style={styles.gymIcon}>
                  <Ionicons name="business-outline" size={20} color={colors.primaryDark} />
                </View>
                <View style={styles.gymBody}>
                  <Text style={styles.gymName}>{gym.name}</Text>
                  <Text style={styles.gymMeta}>{gym.code}</Text>
                </View>
                <StatusBadge label={gym.status} tone={gym.status === "active" ? "success" : "warning"} />
              </View>
            ))}
          </View>
          </SurfacePanel>
        ) : null}
        <SurfacePanel title="Platform health" kicker="Live checks" icon="pulse-outline" style={styles.healthPanel}>
          <View style={styles.healthList}>
            {healthItems.map((item) => (
              <View key={item.label} style={styles.healthRow}>
                <View style={[styles.healthDot, { backgroundColor: colors[item.tone] }]} />
                <Text style={styles.healthLabel}>{item.label}</Text>
                <Text style={[styles.healthValue, { color: colors[item.tone] }]}>{item.value}</Text>
              </View>
            ))}
          </View>
          <Pressable style={styles.healthLink} onPress={() => navigation.navigate("Reports")} accessibilityRole="button">
            <Text style={styles.healthLinkText}>Open system report</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.primary} />
          </Pressable>
        </SurfacePanel>
      </View>
    </PulseDashboardLayout>
  ));
    }
  }
}

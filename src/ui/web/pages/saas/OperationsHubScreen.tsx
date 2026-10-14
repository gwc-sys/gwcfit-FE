import { View } from "react-native";
import { QuickAction } from "../../components/QuickAction";
import { Screen } from "../../components/Screen";
import { ScreenHeader } from "../../components/ScreenHeader";
import { SurfacePanel } from "../../components/SurfacePanel";
import type * as React from "react";
import type { useOperationsHubScreenPresentation } from "../../../../screens/saas/OperationsHubScreen";

export function OperationsHubScreenView({ model }: { model: ReturnType<typeof useOperationsHubScreenPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, hasPermission, navigation, canManageStaff } = model.props;
      return ((
    <Screen scroll contentContainerStyle={styles.screen}>
      <ScreenHeader
        title="Operations"
        subtitle="Daily gym workflows"
        icon="grid-outline"
      />

      <SurfacePanel
        title="Quick actions"
        kicker="Gym tools"
        icon="flash-outline"
      >
        <View style={styles.grid}>
          {hasPermission("manage_members") ? (
            <QuickAction
              icon="people-outline"
              title="Members"
              subtitle="Search and manage"
              tone="primary"
              onPress={() => navigation.navigate("MemberList")}
            />
          ) : null}
          {hasPermission("manage_attendance") ? (
            <QuickAction
              icon="qr-code-outline"
              title="Attendance"
              subtitle="Check-in records"
              tone="info"
              onPress={() => navigation.navigate("Attendance")}
            />
          ) : null}
          {hasPermission("manage_payments") ? (
            <QuickAction
              icon="card-outline"
              title="Payments"
              subtitle="Dues and receipts"
              tone="accent"
              onPress={() => navigation.navigate("Payments")}
            />
          ) : null}
          {hasPermission("manage_membership_plans") ? (
            <QuickAction
              icon="pricetag-outline"
              title="Plans"
              subtitle="Packages"
              tone="primary"
              onPress={() => navigation.navigate("MembershipPlans")}
            />
          ) : null}
          {hasPermission("manage_trainers") ? (
            <QuickAction
              icon="barbell-outline"
              title="Trainers"
              subtitle="Coaches"
              tone="info"
              onPress={() => navigation.navigate("Trainers")}
            />
          ) : null}
          {canManageStaff ? (
            <QuickAction
              icon="people-circle-outline"
              title="Gym Users"
              subtitle="All account roles"
              tone="accent"
              onPress={() => navigation.navigate("Staff")}
            />
          ) : null}
          {hasPermission("manage_workouts") ? (
            <QuickAction
              icon="fitness-outline"
              title="Workouts"
              subtitle="Programs"
              tone="primary"
              onPress={() => navigation.navigate("WorkoutPlans")}
            />
          ) : null}
          {hasPermission("manage_diet_plans") ? (
            <QuickAction
              icon="restaurant-outline"
              title="Diet Plans"
              subtitle="Nutrition"
              tone="warning"
              onPress={() => navigation.navigate("DietPlans")}
            />
          ) : null}
          {hasPermission("manage_reports") ? (
            <QuickAction
              icon="analytics-outline"
              title="Reports"
              subtitle="Tenant metrics"
              tone="info"
              onPress={() => navigation.navigate("Reports")}
            />
          ) : null}
          {hasPermission("configure_gym") ? (
            <QuickAction
              icon="settings-outline"
              title="Settings"
              subtitle="Gym profile"
              tone="accent"
              onPress={() => navigation.navigate("Settings")}
            />
          ) : null}
        </View>
      </SurfacePanel>
    </Screen>
  ));
    }
  }
}

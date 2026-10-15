import { Pressable } from "../../components/NativePressable";
import { useState } from "react";
import { Text, View } from "react-native";
import { OperationCard } from "../../components/OperationCard";
import { Screen } from "../../components/Screen";
import { ScreenHeader } from "../../components/ScreenHeader";
import { pulseStyles } from "../../components/PulseReference";
import { useAppTheme } from "../../../../theme/AppThemeProvider";
import type * as React from "react";
import type { useOperationsHubScreenPresentation } from "../../../../screens/saas/OperationsHubScreen";

export function OperationsHubScreenView({ model }: { model: ReturnType<typeof useOperationsHubScreenPresentation> }): React.ReactNode {
  const [moreOpen, setMoreOpen] = useState(false);
  const { colors } = useAppTheme();
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  const { hasPermission, navigation, canManageStaff } = model.props;
  const s = pulseStyles(colors);
  return <Screen reference scroll contentContainerStyle={s.screen}>
    <ScreenHeader title="Operations" />
    <View style={s.grid}>
      {hasPermission("manage_members") && <OperationCard title="Add Member" icon="person-add" accent="blue" onPress={() => navigation.navigate("AddMember")} />}
      {hasPermission("manage_attendance") && <OperationCard title="Check-In" icon="qr-code" accent="green" onPress={() => navigation.navigate("Attendance")} />}
      {hasPermission("manage_membership_plans") && <OperationCard title="Manage Plans" icon="document-text" accent="purple" onPress={() => navigation.navigate("MembershipPlans")} />}
      {hasPermission("manage_payments") && <OperationCard title="Payments" icon="card" accent="orange" onPress={() => navigation.navigate("Payments")} />}
      {hasPermission("manage_attendance") && <OperationCard title="Attendance" icon="calendar" accent="blue" onPress={() => navigation.navigate("Attendance")} />}
      <OperationCard title="Announcements" icon="megaphone" accent="pink" onPress={() => navigation.navigate("Notifications")} />
      {hasPermission("manage_workouts") && <OperationCard title="Equipment" hint="Browse workout plans and their equipment." icon="barbell" accent="purple" onPress={() => navigation.navigate("WorkoutPlans")} />}
      {hasPermission("manage_reports") && <OperationCard title="Reports" icon="bar-chart" accent="orange" onPress={() => navigation.navigate("Reports")} />}
    </View>
    <Pressable accessibilityRole="button" accessibilityState={{ expanded: moreOpen }} onPress={() => setMoreOpen(value => !value)} style={{ minHeight: 48, justifyContent: "center" }}><Text style={{ color: colors.primary }}>{moreOpen ? "Fewer tools" : "More tools"}</Text></Pressable>
    {moreOpen && <View style={s.grid}>
      {hasPermission("manage_members") && <OperationCard title="Members" icon="people" accent="blue" onPress={() => navigation.navigate("MemberList")} />}
      {hasPermission("manage_trainers") && <OperationCard title="Trainers" icon="people-circle" accent="green" onPress={() => navigation.navigate("Trainers")} />}
      {canManageStaff && <OperationCard title="Gym Users" icon="person-circle" accent="blue" onPress={() => navigation.navigate("Staff")} />}
      {hasPermission("manage_diet_plans") && <OperationCard title="Diet Plans" icon="restaurant" accent="orange" onPress={() => navigation.navigate("DietPlans")} />}
      {hasPermission("configure_gym") && <OperationCard title="Settings" icon="settings" accent="blue" onPress={() => navigation.navigate("Settings")} />}
    </View>}
  </Screen>;
}

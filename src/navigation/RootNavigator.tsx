import type * as React from "react";
import { MainTabsView, MemberTabsNavigatorView, MemberAppTabsScreenView, OwnerSettingsScreenView, RoleFeaturePlaceholderScreenView, RootNavigatorView } from "./RootNavigator.presentation";
import { createStyles, createMemberTabStyles } from "./RootNavigator.styles";
import { Ionicons } from "@expo/vector-icons";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { BottomTabBar, createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useEffect, useMemo, useState } from "react";
import type { ComponentType } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SplashScreen } from "../screens/auth/SplashScreen";
import { OnboardingScreen } from "../screens/auth/OnboardingScreen";
import { LoginScreen } from "../screens/auth/LoginScreen";
import { InvitationSignUpScreen } from "../screens/auth/InvitationSignUpScreen";
import { AccountRecoveryScreen } from "../screens/auth/AccountRecoveryScreen";
import { RoleDashboardScreen } from "../screens/saas/RoleDashboardScreen";
import { ManageGymsScreen } from "../screens/saas/ManageGymsScreen";
import { CreateGymAdminScreen } from "../screens/saas/CreateGymAdminScreen";
import { InvitationManagementScreen } from "../screens/saas/InvitationManagementScreen";
import { MemberListScreen } from "../screens/saas/MemberListScreen";
import { MemberFormScreen } from "../screens/saas/MemberFormScreen";
import { MemberProfileScreen as AdminMemberProfileScreen } from "../screens/saas/MemberProfileScreen";
import { StaffScreen } from "../screens/saas/StaffScreen";
import { AttendanceScreen } from "../screens/saas/AttendanceScreen";
import { PaymentScreen } from "../screens/saas/PaymentScreen";
import { MembershipPlanScreen } from "../screens/saas/MembershipPlanScreen";
import { TrainersScreen } from "../screens/saas/TrainersScreen";
import { WorkoutPlansScreen } from "../screens/saas/WorkoutPlansScreen";
import { DietPlansScreen } from "../screens/saas/DietPlansScreen";
import { ReportsScreen } from "../screens/saas/ReportsScreen";
import { NotificationsScreen } from "../screens/saas/NotificationsScreen";
import { GymOwnerSettingsScreen, SettingsScreen } from "../screens/saas/SettingsScreen";
import { ProfileScreen } from "../screens/saas/ProfileScreen";
import { OperationsHubScreen } from "../screens/saas/OperationsHubScreen";
import { AIWorkoutGeneratorScreen } from "../screens/AIWorkoutGeneratorScreen";
import { WorkoutPlanScreen } from "../screens/WorkoutPlanScreen";
import { ExerciseDetailScreen } from "../screens/ExerciseDetailScreen";
import { FeaturePlaceholderScreen } from "../screens/saas/FeaturePlaceholderScreen";
import { AccessDeniedScreen } from "../screens/saas/AccessDeniedScreen";
import { MemberDashboardScreen } from "../screens/member/MemberDashboardScreen";
import { MemberProfileScreen } from "../screens/member/MemberProfileScreen";
import { MemberMembershipScreen } from "../screens/member/MemberMembershipScreen";
import { MemberPaymentsScreen } from "../screens/member/MemberPaymentsScreen";
import { MemberAttendanceScreen } from "../screens/member/MemberAttendanceScreen";
import { MemberWorkoutScreen } from "../screens/member/MemberWorkoutScreen";
import { MemberWorkoutDetailScreen } from "../screens/member/MemberWorkoutDetailScreen";
import { MemberExerciseDetailScreen } from "../screens/member/MemberExerciseDetailScreen";
import { MemberWorkoutSessionScreen } from "../screens/member/MemberWorkoutCoachScreen";
import { MemberMealPlanScreen } from "../screens/member/MemberMealPlanScreen";
import { MemberProgressScreen } from "../screens/member/MemberProgressScreen";
import { MemberTrainerScreen } from "../screens/member/MemberTrainerScreen";
import { MemberClassesScreen } from "../screens/member/MemberClassesScreen";
import { MemberNotificationsScreen } from "../screens/member/MemberNotificationsScreen";
import { MemberGoalsScreen } from "../screens/member/MemberGoalsScreen";
import { MemberRewardsScreen } from "../screens/member/MemberRewardsScreen";
import { MemberSupportScreen } from "../screens/member/MemberSupportScreen";
import { MemberSettingsScreen } from "../screens/member/MemberSettingsScreen";
import { MemberDesktopLayout } from "../components/member/MemberDesktopLayout";
import { PulseDashboardLayout, type PulseNavItem } from "../components/dashboard/PulseDashboardLayout";
import { useAuthStore } from "../store/useAuthStore";
import { useAppTheme } from "../theme/AppThemeProvider";
import { getFloatingTabBarMetrics, radius, shadows } from "../theme/theme";
import type { ThemeColors } from "../theme/theme";
import type { MainTabParamList, MemberTabParamList, RootStackParamList } from "./types";

type TabIconName = keyof typeof Ionicons.glyphMap;

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<MainTabParamList>();
const MemberTabs = createBottomTabNavigator<MemberTabParamList>();
const memberTabNames: Array<keyof MemberTabParamList> = [
  "MemberHome",
  "MemberAttendance",
  "MemberWorkout",
  "MemberProgress",
  "MemberProfileHome"
];

function getTabIcon(routeName: keyof MainTabParamList, focused: boolean, isSuperAdmin: boolean, isMember: boolean): TabIconName {
  if (routeName === "Dashboard") {
    return focused ? "speedometer" : "speedometer-outline";
  }
  if (routeName === "Directory") {
    if (isSuperAdmin) {
      return focused ? "business" : "business-outline";
    }
    if (isMember) {
      return focused ? "id-card" : "id-card-outline";
    }
    return focused ? "people" : "people-outline";
  }
  if (routeName === "Workflows") {
    if (isSuperAdmin) {
      return focused ? "person-add" : "person-add-outline";
    }
    if (isMember) {
      return focused ? "notifications" : "notifications-outline";
    }
    return focused ? "grid" : "grid-outline";
  }
  if (routeName === "Reports") {
    return focused ? "analytics" : "analytics-outline";
  }
  return focused ? "person" : "person-outline";
}

export function useMainTabsPresentation() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const styles = useMemo(() => createStyles(colors, width, insets.bottom), [colors, insets.bottom, width]);
  const user = useAuthStore((state) => state.user);
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const isSuperAdmin = user?.role === "super_admin";
  const isPlatformAdmin = isSuperAdmin;
  const isSubAdmin = user?.role === "sub_admin";
  const isGymOwner = user?.role === "gym_owner";
  const isTrainer = user?.role === "trainer";
  const isMember = user?.role === "member";
  const usesDesktopSidebar = (isGymOwner || isSubAdmin || isPlatformAdmin || isTrainer) && width >= 1100;
  const canManageMembers = isGymOwner || hasPermission("manage_members");
  const canViewReports = isSuperAdmin || isGymOwner || hasPermission("manage_reports");

  return { kind: "view1" as const, props: { Tabs, colors, styles, usesDesktopSidebar, getTabIcon, isPlatformAdmin, isMember, user, SuperAdminManageGymsScreen, canManageMembers, OwnerMembersScreen, SuperAdminCreateGymAdminScreen, canViewReports, OwnerReportsScreen, OwnerProfileScreen } };
}

function MainTabs(...args: Parameters<typeof useMainTabsPresentation>): React.JSX.Element {
  return <MainTabsView model={useMainTabsPresentation(...args)} />;
}

function getMemberTabIcon(routeName: keyof MemberTabParamList, focused: boolean): TabIconName {
  if (routeName === "MemberHome") {
    return focused ? "speedometer" : "speedometer-outline";
  }
  if (routeName === "MemberProfileHome") {
    return focused ? "id-card" : "id-card-outline";
  }
  if (routeName === "MemberAttendance") {
    return focused ? "walk" : "walk-outline";
  }
  if (routeName === "MemberWorkout") {
    return focused ? "barbell" : "barbell-outline";
  }
  if (routeName === "MemberProgress") {
    return focused ? "trending-up" : "trending-up-outline";
  }
  return focused ? "person" : "person-outline";
}

export function useMemberTabsNavigatorPresentation({ onActiveRouteChange }: { onActiveRouteChange?: (routeName: keyof MemberTabParamList) => void }) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const styles = useMemo(() => createMemberTabStyles(colors, width, insets.bottom), [colors, insets.bottom, width]);

  return { kind: "view1" as const, props: { MemberTabs, width, onActiveRouteChange, memberTabNames, colors, styles, getMemberTabIcon } };
}

function MemberTabsNavigator(...args: Parameters<typeof useMemberTabsNavigatorPresentation>): React.JSX.Element {
  return <MemberTabsNavigatorView model={useMemberTabsNavigatorPresentation(...args)} />;
}

function withMemberDesktopLayout(Component: ComponentType<any>) {
  return function MemberLayoutScreen(props: any) {
    return <MemberDesktopLayout activeRouteName={props.route?.name}><Component {...props} /></MemberDesktopLayout>;
  };
}

export function useMemberAppTabsScreenPresentation({ route }: any) {
  const [activeTab, setActiveTab] = useState<keyof MemberTabParamList>("MemberHome");
  const requestedTab = route?.params?.screen as keyof MemberTabParamList | undefined;

  useEffect(() => {
    if (requestedTab && memberTabNames.includes(requestedTab)) {
      setActiveTab(requestedTab);
    }
  }, [requestedTab]);

  return { kind: "view1" as const, props: { activeTab, MemberTabsNavigator, setActiveTab } };
}

function MemberAppTabsScreen(...args: Parameters<typeof useMemberAppTabsScreenPresentation>): React.JSX.Element {
  return <MemberAppTabsScreenView model={useMemberAppTabsScreenPresentation(...args)} />;
}
const MemberMembershipLayoutScreen = withMemberDesktopLayout(MemberMembershipScreen);
const MemberPaymentsLayoutScreen = withMemberDesktopLayout(MemberPaymentsScreen);
const MemberWorkoutLayoutScreen = withMemberDesktopLayout(MemberWorkoutScreen);
const MemberWorkoutDetailLayoutScreen = withMemberDesktopLayout(MemberWorkoutDetailScreen);
const MemberExerciseDetailLayoutScreen = withMemberDesktopLayout(MemberExerciseDetailScreen);
const MemberWorkoutSessionLayoutScreen = withMemberDesktopLayout(MemberWorkoutSessionScreen);
const MemberMealPlanLayoutScreen = withMemberDesktopLayout(MemberMealPlanScreen);
const MemberTrainerLayoutScreen = withMemberDesktopLayout(MemberTrainerScreen);
const MemberClassesLayoutScreen = withMemberDesktopLayout(MemberClassesScreen);
const MemberNotificationsLayoutScreen = withMemberDesktopLayout(MemberNotificationsScreen);
const MemberGoalsLayoutScreen = withMemberDesktopLayout(MemberGoalsScreen);
const MemberRewardsLayoutScreen = withMemberDesktopLayout(MemberRewardsScreen);
const MemberSupportLayoutScreen = withMemberDesktopLayout(MemberSupportScreen);
const MemberSettingsLayoutScreen = withMemberDesktopLayout(MemberSettingsScreen);

const superAdminPanelNav: PulseNavItem[] = [
  { label: "Overview", icon: "home-outline", route: "AppTabs", params: { screen: "Dashboard" } },
  { label: "Gyms", icon: "business-outline", route: "ManageGyms" },
  { label: "Invitations", icon: "ticket-outline", route: "Invitations" },
  { label: "Members", icon: "people-outline", route: "MemberList" },
  { label: "Staff", icon: "person-outline", route: "Staff" },
  { label: "Membership plans", icon: "pricetag-outline", route: "MembershipPlans" },
  { label: "Payments", icon: "card-outline", route: "Payments" },
  { label: "Reports", icon: "bar-chart-outline", route: "Reports" },
  { label: "Settings", icon: "settings-outline", route: "Settings" },
  { label: "Profile", icon: "person-circle-outline", route: "Profile" }
];

function withOwnerPanelLayout(Component: ComponentType<any>, activeLabel: string) {
  return function OwnerPanelScreen(props: any) {
    const role = useAuthStore((state) => state.user?.role);
    if (role === "super_admin") {
      return (
        <PulseDashboardLayout
          activeLabel={activeLabel}
          roleLabel="Super Admin"
          navItems={superAdminPanelNav}
        >
          <Component {...props} />
        </PulseDashboardLayout>
      );
    }
    if (role === "trainer") {
      return <PulseDashboardLayout activeLabel={activeLabel} roleLabel="Trainer"><Component {...props} /></PulseDashboardLayout>;
    }
    if (role !== "gym_owner" && role !== "sub_admin") return <Component {...props} />;
    const ownerActiveLabel = activeLabel === "Staff" ? "Receptionists" : activeLabel === "Diets" ? "Nutrition" : activeLabel;
    return <PulseDashboardLayout activeLabel={ownerActiveLabel} roleLabel="Gym Owner"><Component {...props} /></PulseDashboardLayout>;
  };
}

const OwnerMembersScreen = withOwnerPanelLayout(MemberListScreen, "Members");
const OwnerStaffScreen = withOwnerPanelLayout(StaffScreen, "Staff");
const OwnerTrainersScreen = withOwnerPanelLayout(TrainersScreen, "Trainers");
const OwnerAttendanceScreen = withOwnerPanelLayout(AttendanceScreen, "Attendance");
const OwnerWorkoutPlansScreen = withOwnerPanelLayout(WorkoutPlansScreen, "Workouts");
const OwnerPaymentsScreen = withOwnerPanelLayout(PaymentScreen, "Payments");
const OwnerReportsScreen = withOwnerPanelLayout(ReportsScreen, "Reports");
const RoleInvitationsScreen = withOwnerPanelLayout(InvitationManagementScreen, "Invitations");
const SuperAdminSettingsScreen = withOwnerPanelLayout(SettingsScreen, "Settings");
const SuperAdminManageGymsScreen = withOwnerPanelLayout(ManageGymsScreen, "Gyms");
const SuperAdminCreateGymAdminScreen = withOwnerPanelLayout(CreateGymAdminScreen, "Invitations");
export function useOwnerSettingsScreenPresentation(props: any) {
  const role = useAuthStore((state) => state.user?.role);
  if (role === "trainer") return { kind: "view1" as const, props: {  } };
  return { kind: "view2" as const, props: { role, props, SuperAdminSettingsScreen } };
}

function OwnerSettingsScreen(...args: Parameters<typeof useOwnerSettingsScreenPresentation>): React.JSX.Element {
  return <OwnerSettingsScreenView model={useOwnerSettingsScreenPresentation(...args)} />;
}
const OwnerProfileScreen = withOwnerPanelLayout(ProfileScreen, "Profile");
const OwnerMemberFormScreen = withOwnerPanelLayout(MemberFormScreen, "Members");
const OwnerMemberProfileScreen = withOwnerPanelLayout(AdminMemberProfileScreen, "Members");
const OwnerFeatureModuleScreen = withOwnerPanelLayout(FeaturePlaceholderScreen, "");
const RoleDietPlansScreen = withOwnerPanelLayout(DietPlansScreen, "Diets");
const RoleNotificationsScreen = withOwnerPanelLayout(NotificationsScreen, "Messages");
const RoleAIWorkoutGeneratorScreen = withOwnerPanelLayout(AIWorkoutGeneratorScreen, "AI Coach");
const RoleWorkoutPlanScreen = withOwnerPanelLayout(WorkoutPlanScreen, "Workouts");
const RoleExerciseDetailScreen = withOwnerPanelLayout(ExerciseDetailScreen, "Workouts");

export function useRoleFeaturePlaceholderScreenPresentation(props: any) {
  const role = useAuthStore((state) => state.user?.role);
  if (role === "trainer") {
    const requestedLabel = props.route?.params?.title;
    const activeLabel = requestedLabel === "Goals" ? "Goals" : requestedLabel === "AI Coach" ? "AI Coach" : "";
    return { kind: "view1" as const, props: { activeLabel, props } };
  }
  return { kind: "view2" as const, props: { OwnerFeatureModuleScreen, props } };
}

function RoleFeaturePlaceholderScreen(...args: Parameters<typeof useRoleFeaturePlaceholderScreenPresentation>): React.JSX.Element {
  return <RoleFeaturePlaceholderScreenView model={useRoleFeaturePlaceholderScreenPresentation(...args)} />;
}

export function useRootNavigatorPresentation() {
  const { colorScheme, colors } = useAppTheme();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const isHydrating = useAuthStore((state) => state.isHydrating);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const hydrateSession = useAuthStore((state) => state.hydrateSession);
  const navigationState = !hasHydrated || isHydrating ? "loading" : isAuthenticated ? "app" : "auth";
  const isMember = user?.role === "member";

  useEffect(() => {
    if (!hasHydrated) {
      void hydrateSession();
    }
  }, [hasHydrated, hydrateSession]);

  const navTheme = {
    ...(colorScheme === "dark" ? DarkTheme : DefaultTheme),
    colors: {
      ...(colorScheme === "dark" ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.background,
      border: colors.border,
      card: colors.surface,
      notification: colors.danger,
      primary: colors.primary,
      text: colors.ink
    }
  };

  return { kind: "view1" as const, props: { navTheme, Stack, navigationState, user, isMember, MemberAppTabsScreen, MemberMembershipLayoutScreen, MemberPaymentsLayoutScreen, MemberWorkoutLayoutScreen, MemberWorkoutDetailLayoutScreen, MemberExerciseDetailLayoutScreen, MemberWorkoutSessionLayoutScreen, MemberMealPlanLayoutScreen, MemberTrainerLayoutScreen, MemberClassesLayoutScreen, MemberNotificationsLayoutScreen, MemberGoalsLayoutScreen, MemberRewardsLayoutScreen, MemberSupportLayoutScreen, MemberSettingsLayoutScreen, MainTabs, SuperAdminManageGymsScreen, SuperAdminCreateGymAdminScreen, RoleInvitationsScreen, OwnerStaffScreen, OwnerMembersScreen, OwnerMemberFormScreen, OwnerMemberProfileScreen, OwnerAttendanceScreen, OwnerPaymentsScreen, OwnerTrainersScreen, OwnerWorkoutPlansScreen, RoleDietPlansScreen, OwnerReportsScreen, RoleNotificationsScreen, OwnerSettingsScreen, OwnerProfileScreen, RoleAIWorkoutGeneratorScreen, RoleWorkoutPlanScreen, RoleExerciseDetailScreen, RoleFeaturePlaceholderScreen } };
}

export function RootNavigator(...args: Parameters<typeof useRootNavigatorPresentation>): React.JSX.Element {
  return <RootNavigatorView model={useRootNavigatorPresentation(...args)} />;
}





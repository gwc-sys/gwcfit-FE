import { Ionicons } from "@expo/vector-icons";
import { NavigationContainer } from "@react-navigation/native";
import { BottomTabBar } from "@react-navigation/bottom-tabs";
import { View } from "react-native";
import { SplashScreen } from "../../../screens/auth/SplashScreen";
import { OnboardingScreen } from "../../../screens/auth/OnboardingScreen";
import { LoginScreen } from "../../../screens/auth/LoginScreen";
import { InvitationSignUpScreen } from "../../../screens/auth/InvitationSignUpScreen";
import { AccountRecoveryScreen } from "../../../screens/auth/AccountRecoveryScreen";
import { RoleDashboardScreen } from "../../../screens/saas/RoleDashboardScreen";
import { MemberProfileScreen as AdminMemberProfileScreen } from "../../../screens/saas/MemberProfileScreen";
import { MembershipPlanScreen } from "../../../screens/saas/MembershipPlanScreen";
import { NotificationsScreen } from "../../../screens/saas/NotificationsScreen";
import { GymOwnerSettingsScreen } from "../../../screens/saas/SettingsScreen";
import { OperationsHubScreen } from "../../../screens/saas/OperationsHubScreen";
import { FeaturePlaceholderScreen } from "../../../screens/saas/FeaturePlaceholderScreen";
import { AccessDeniedScreen } from "../../../screens/saas/AccessDeniedScreen";
import { MemberDashboardScreen } from "../../../screens/member/MemberDashboardScreen";
import { MemberProfileScreen } from "../../../screens/member/MemberProfileScreen";
import { MemberAttendanceScreen } from "../../../screens/member/MemberAttendanceScreen";
import { MemberWorkoutScreen } from "../../../screens/member/MemberWorkoutScreen";
import { MemberProgressScreen } from "../../../screens/member/MemberProgressScreen";
import { MemberDesktopLayout } from "../../../components/member/MemberDesktopLayout";
import { PulseDashboardLayout } from "../../../components/dashboard/PulseDashboardLayout";
import type { MemberTabParamList } from "../../../navigation/types";
import type * as React from "react";
import type { useMainTabsPresentation, useMemberTabsNavigatorPresentation, useMemberAppTabsScreenPresentation, useOwnerSettingsScreenPresentation, useRoleFeaturePlaceholderScreenPresentation, useRootNavigatorPresentation } from "../../../navigation/RootNavigator";

export function MainTabsView({ model }: { model: ReturnType<typeof useMainTabsPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { Tabs, colors, styles, usesDesktopSidebar, getTabIcon, isPlatformAdmin, isMember, user, SuperAdminManageGymsScreen, canManageMembers, OwnerMembersScreen, SuperAdminCreateGymAdminScreen, canViewReports, OwnerReportsScreen, OwnerProfileScreen } = model.props;
      return ((
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.subtle,
        tabBarHideOnKeyboard: true,
        tabBarItemStyle: styles.tabBarItem,
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: usesDesktopSidebar ? { display: "none" } : styles.tabBar,
        tabBarIcon: ({ color, focused, size }) => {
          if (route.name === "Dashboard" && focused) {
            return (
              <View style={styles.activeTab}>
                <Ionicons name="speedometer" size={size + 2} color={colors.white} />
              </View>
            );
          }

          return <Ionicons name={getTabIcon(route.name, focused, isPlatformAdmin, isMember)} size={size + 2} color={color} />;
        }
      })}
    >
      <Tabs.Screen
        name="Dashboard"
        component={RoleDashboardScreen}
        options={user?.role === "receptionist" ? { tabBarStyle: { display: "none" } } : undefined}
      />
      {isPlatformAdmin ? (
        <Tabs.Screen name="Directory" component={SuperAdminManageGymsScreen} options={{ title: "Gyms" }} />
      ) : isMember ? (
        <Tabs.Screen name="Directory" component={AdminMemberProfileScreen} options={{ title: "Card" }} />
      ) : canManageMembers ? (
        <Tabs.Screen name="Directory" component={OwnerMembersScreen} options={{ title: "Members" }} />
      ) : (
        <Tabs.Screen name="Directory" component={OperationsHubScreen} options={{ title: "Tools" }} />
      )}

      {isPlatformAdmin ? (
        <Tabs.Screen name="Workflows" component={SuperAdminCreateGymAdminScreen} options={{ title: "Admins" }} />
      ) : isMember ? (
        <Tabs.Screen name="Workflows" component={NotificationsScreen} options={{ title: "Alerts" }} />
      ) : (
        <Tabs.Screen name="Workflows" component={OperationsHubScreen} options={{ title: "Tools" }} />
      )}

      {canViewReports ? <Tabs.Screen name="Reports" component={OwnerReportsScreen} /> : null}
      <Tabs.Screen name="Profile" component={OwnerProfileScreen} />
    </Tabs.Navigator>
  ));
    }
  }
}

export function MemberTabsNavigatorView({ model }: { model: ReturnType<typeof useMemberTabsNavigatorPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { MemberTabs, width, onActiveRouteChange, memberTabNames, colors, styles, getMemberTabIcon } = model.props;
      return ((
    <MemberTabs.Navigator
      tabBar={(props) => width >= 1180 ? null : <BottomTabBar {...props} />}
      screenListeners={({ route }) => ({
        focus: () => onActiveRouteChange?.(route.name),
        state: (event) => {
          const tabState = event.data.state;
          const focusedRoute = tabState.routes[tabState.index];
          if (focusedRoute && memberTabNames.includes(focusedRoute.name as keyof MemberTabParamList)) {
            onActiveRouteChange?.(focusedRoute.name as keyof MemberTabParamList);
          }
        }
      })}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.subtle,
        tabBarHideOnKeyboard: true,
        tabBarItemStyle: styles.memberTabItem,
        tabBarLabelStyle: route.name === "MemberWorkout" ? styles.centerTabLabel : styles.memberTabLabel,
        tabBarStyle: styles.tabBar,
        tabBarIcon: ({ color, focused, size }) => {
          if (route.name === "MemberWorkout") {
            return (
              <View style={styles.centerWorkoutTab}>
                <Ionicons name={getMemberTabIcon(route.name, focused)} size={size + 8} color={colors.white} />
              </View>
            );
          }

          return focused ? (
            <View style={styles.memberActiveTab}>
              <Ionicons name={getMemberTabIcon(route.name, focused)} size={size + 4} color={colors.primary} />
            </View>
          ) : (
            <Ionicons name={getMemberTabIcon(route.name, focused)} size={size + 2} color={color} />
          );
        }
      })}
    >
      <MemberTabs.Screen name="MemberHome" component={MemberDashboardScreen} options={{ title: "Dashboard" }} />
      <MemberTabs.Screen name="MemberAttendance" component={MemberAttendanceScreen} options={{ title: "Check-in" }} />
      <MemberTabs.Screen name="MemberWorkout" component={MemberWorkoutScreen} options={{ title: "Workout" }} />
      <MemberTabs.Screen name="MemberProgress" component={MemberProgressScreen} options={{ title: "Progress" }} />
      <MemberTabs.Screen name="MemberProfileHome" component={MemberProfileScreen} options={{ title: "Profile" }} />
    </MemberTabs.Navigator>
  ));
    }
  }
}

export function MemberAppTabsScreenView({ model }: { model: ReturnType<typeof useMemberAppTabsScreenPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { activeTab, MemberTabsNavigator, setActiveTab } = model.props;
      return ((
    <MemberDesktopLayout activeRouteName={activeTab}>
      <MemberTabsNavigator onActiveRouteChange={setActiveTab} />
    </MemberDesktopLayout>
  ));
    }
  }
}

export function OwnerSettingsScreenView({ model }: { model: ReturnType<typeof useOwnerSettingsScreenPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      
      return (<AccessDeniedScreen />);
    }
    case "view2": {
      const { role, props, SuperAdminSettingsScreen } = model.props;
      return (role === "gym_owner" || role === "sub_admin" ? <GymOwnerSettingsScreen {...props} /> : <SuperAdminSettingsScreen {...props} />);
    }
  }
}

export function RoleFeaturePlaceholderScreenView({ model }: { model: ReturnType<typeof useRoleFeaturePlaceholderScreenPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { activeLabel, props } = model.props;
      return (<PulseDashboardLayout activeLabel={activeLabel} roleLabel="Trainer"><FeaturePlaceholderScreen {...props} /></PulseDashboardLayout>);
    }
    case "view2": {
      const { OwnerFeatureModuleScreen, props } = model.props;
      return (<OwnerFeatureModuleScreen {...props} />);
    }
  }
}

export function RootNavigatorView({ model }: { model: ReturnType<typeof useRootNavigatorPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { navTheme, Stack, navigationState, user, isMember, MemberAppTabsScreen, MemberMembershipLayoutScreen, MemberPaymentsLayoutScreen, MemberWorkoutLayoutScreen, MemberWorkoutDetailLayoutScreen, MemberExerciseDetailLayoutScreen, MemberWorkoutSessionLayoutScreen, MemberMealPlanLayoutScreen, MemberTrainerLayoutScreen, MemberClassesLayoutScreen, MemberNotificationsLayoutScreen, MemberGoalsLayoutScreen, MemberRewardsLayoutScreen, MemberSupportLayoutScreen, MemberSettingsLayoutScreen, MainTabs, SuperAdminManageGymsScreen, SuperAdminCreateGymAdminScreen, RoleInvitationsScreen, OwnerStaffScreen, OwnerMembersScreen, OwnerMemberFormScreen, OwnerMemberProfileScreen, OwnerAttendanceScreen, OwnerPaymentsScreen, OwnerTrainersScreen, OwnerWorkoutPlansScreen, RoleDietPlansScreen, OwnerReportsScreen, RoleNotificationsScreen, OwnerSettingsScreen, OwnerProfileScreen, RoleAIWorkoutGeneratorScreen, RoleWorkoutPlanScreen, RoleExerciseDetailScreen, RoleFeaturePlaceholderScreen } = model.props;
      return ((
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator key={`${navigationState}:${user?.id ?? "guest"}:${user?.role ?? "none"}`} screenOptions={{ headerShown: false }}>
        {navigationState === "loading" ? (
          <Stack.Screen name="Splash" component={SplashScreen} />
        ) : navigationState === "app" ? (
          isMember ? (
          <>
            <Stack.Screen name="AppTabs" component={MemberAppTabsScreen} />
            <Stack.Screen name="MemberMembership" component={MemberMembershipLayoutScreen} />
            <Stack.Screen name="MemberPayments" component={MemberPaymentsLayoutScreen} />
            <Stack.Screen name="MemberWorkout" component={MemberWorkoutLayoutScreen} />
            <Stack.Screen name="MemberWorkoutDetail" component={MemberWorkoutDetailLayoutScreen} />
            <Stack.Screen name="MemberExerciseDetail" component={MemberExerciseDetailLayoutScreen} />
            <Stack.Screen name="MemberWorkoutSession" component={MemberWorkoutSessionLayoutScreen} />
            <Stack.Screen name="MemberMealPlan" component={MemberMealPlanLayoutScreen} />
            <Stack.Screen name="MemberTrainer" component={MemberTrainerLayoutScreen} />
            <Stack.Screen name="MemberClasses" component={MemberClassesLayoutScreen} />
            <Stack.Screen name="MemberNotifications" component={MemberNotificationsLayoutScreen} />
            <Stack.Screen name="MemberGoals" component={MemberGoalsLayoutScreen} />
            <Stack.Screen name="MemberRewards" component={MemberRewardsLayoutScreen} />
            <Stack.Screen name="MemberSupport" component={MemberSupportLayoutScreen} />
            <Stack.Screen name="MemberSettings" component={MemberSettingsLayoutScreen} />
            <Stack.Screen name="AccessDenied" component={AccessDeniedScreen} />
          </>
          ) : (
          <>
            <Stack.Screen name="AppTabs" component={MainTabs} />
            <Stack.Screen name="ManageGyms" component={SuperAdminManageGymsScreen} />
            <Stack.Screen name="CreateGymAdmin" component={SuperAdminCreateGymAdminScreen} />
            <Stack.Screen name="Invitations" component={RoleInvitationsScreen} />
            <Stack.Screen name="Staff" component={OwnerStaffScreen} />
            <Stack.Screen name="MemberList" component={OwnerMembersScreen} />
            <Stack.Screen name="AddMember" component={OwnerMemberFormScreen} />
            <Stack.Screen name="EditMember" component={OwnerMemberFormScreen} />
            <Stack.Screen name="MemberProfile" component={OwnerMemberProfileScreen} />
            <Stack.Screen name="Attendance" component={OwnerAttendanceScreen} />
            <Stack.Screen name="Payments" component={OwnerPaymentsScreen} />
            <Stack.Screen name="MembershipPlans" component={MembershipPlanScreen} />
            <Stack.Screen name="Trainers" component={OwnerTrainersScreen} />
            <Stack.Screen name="WorkoutPlans" component={OwnerWorkoutPlansScreen} />
            <Stack.Screen name="DietPlans" component={RoleDietPlansScreen} />
            <Stack.Screen name="Reports" component={OwnerReportsScreen} />
            <Stack.Screen name="Notifications" component={RoleNotificationsScreen} />
            <Stack.Screen name="Settings" component={OwnerSettingsScreen} />
            <Stack.Screen name="Profile" component={OwnerProfileScreen} />
            <Stack.Screen name="AIWorkoutGenerator" component={RoleAIWorkoutGeneratorScreen} />
            <Stack.Screen name="WorkoutPlan" component={RoleWorkoutPlanScreen} />
            <Stack.Screen name="ExerciseDetail" component={RoleExerciseDetailScreen} />
            <Stack.Screen name="FeaturePlaceholder" component={RoleFeaturePlaceholderScreen} />
            <Stack.Screen name="AccessDenied" component={AccessDeniedScreen} />
          </>
          )
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={InvitationSignUpScreen} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="AccountRecovery" component={AccountRecoveryScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  ));
    }
  }
}

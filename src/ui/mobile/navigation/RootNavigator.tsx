import { Ionicons } from "@expo/vector-icons";
import { NavigationContainer } from "@react-navigation/native";
import { BottomTabBar } from "@react-navigation/bottom-tabs";
import { useState } from "react";
import { View, useWindowDimensions } from "react-native";
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
import { MemberMealPlanScreen } from "../../../screens/member/MemberMealPlanScreen";
import { MemberProgressScreen } from "../../../screens/member/MemberProgressScreen";
import { AttendanceScreen } from "../../../screens/saas/AttendanceScreen";
import { PaymentScreen } from "../../../screens/saas/PaymentScreen";
import { MemberDesktopLayout } from "../../../components/member/MemberDesktopLayout";
import { PulseDashboardLayout } from "../../../components/dashboard/PulseDashboardLayout";
import type { MemberTabParamList } from "../../../navigation/types";
import type * as React from "react";
import type { useMainTabsPresentation, useMemberTabsNavigatorPresentation, useMemberAppTabsScreenPresentation, useOwnerSettingsScreenPresentation, useRoleFeaturePlaceholderScreenPresentation, useRootNavigatorPresentation } from "../../../navigation/RootNavigator";

export function MainTabsView({ model }: { model: ReturnType<typeof useMainTabsPresentation> }): React.ReactNode {
  const { fontScale = 1 } = useWindowDimensions();
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { Tabs, colors, styles, usesDesktopSidebar, getTabIcon, isPlatformAdmin, isMember, user, SuperAdminManageGymsScreen, canManageMembers, OwnerMembersScreen, SuperAdminCreateGymAdminScreen, canViewReports, OwnerReportsScreen, OwnerProfileScreen } = model.props;
      const isOwnerOrStaff = !isPlatformAdmin && !isMember;
      return ((
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.subtle,
        tabBarHideOnKeyboard: true,
        tabBarItemStyle: styles.tabBarItem,
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: [styles.tabBar, { height: styles.tabBar.height + Math.ceil(Math.max(0, fontScale - 1) * 24) }],
        tabBarIcon: ({ color, focused, size }) => {
          if (isOwnerOrStaff) {
            if (route.name === "Dashboard") {
              return (
                <View style={styles.activeTab}>
                  <Ionicons name={focused ? "grid" : "grid-outline"} size={22} color={focused ? colors.primary : colors.subtle} />
                </View>
              );
            }
            if (route.name === "Workflows") {
              return <Ionicons name="qr-code-outline" size={22} color={focused ? colors.primary : colors.subtle} />;
            }
            if (route.name === "Directory") {
              return <Ionicons name="people-outline" size={22} color={focused ? colors.primary : colors.subtle} />;
            }
            if (route.name === "Reports") {
              return <Ionicons name="card-outline" size={22} color={focused ? colors.primary : colors.subtle} />;
            }
            if (route.name === "Profile") {
              return <Ionicons name="person-outline" size={22} color={focused ? colors.primary : colors.subtle} />;
            }
          }

          if (route.name === "Dashboard" && focused) {
            return (
              <View style={styles.activeTab}>
                <Ionicons name="home" size={24} color={colors.primary} />
              </View>
            );
          }

          const ownerIcon = route.name === "Dashboard" ? (focused ? "home" : "home-outline") : route.name === "Reports" ? (focused ? "bar-chart" : "bar-chart-outline") : undefined;
          return <Ionicons name={!isPlatformAdmin && !isMember && ownerIcon ? ownerIcon : getTabIcon(route.name, focused, isPlatformAdmin, isMember)} size={22} color={color} />;
        }
      })}
    >
      <Tabs.Screen
        name="Dashboard"
        component={RoleDashboardScreen}
        options={{ title: isOwnerOrStaff ? "Dashboard" : "Home" }}
      />
      {isPlatformAdmin ? (
        <Tabs.Screen name="Directory" component={SuperAdminManageGymsScreen} options={{ title: "Gyms" }} />
      ) : isMember ? (
        <Tabs.Screen name="Directory" component={AdminMemberProfileScreen} options={{ title: "Card" }} />
      ) : isOwnerOrStaff ? (
        <Tabs.Screen name="Workflows" component={AttendanceScreen} options={{ title: "Pass" }} />
      ) : canManageMembers ? (
        <Tabs.Screen name="Directory" component={OwnerMembersScreen} options={{ title: "Members" }} />
      ) : user?.role === "trainer" ? (
        <Tabs.Screen name="Directory" component={OwnerMembersScreen} options={{ title: "Clients" }} />
      ) : (
        <Tabs.Screen name="Directory" component={OperationsHubScreen} options={{ title: "Operations" }} />
      )}

      {isPlatformAdmin ? (
        <Tabs.Screen name="Workflows" component={SuperAdminCreateGymAdminScreen} options={{ title: "Admins" }} />
      ) : isMember ? (
        <Tabs.Screen name="Workflows" component={NotificationsScreen} options={{ title: "Alerts" }} />
      ) : isOwnerOrStaff ? (
        <Tabs.Screen name="Directory" component={OwnerMembersScreen} options={{ title: "Members" }} />
      ) : (
        <Tabs.Screen name="Workflows" component={OperationsHubScreen} options={{ title: "Operations" }} />
      )}

      {isPlatformAdmin ? (
        canViewReports ? <Tabs.Screen name="Reports" component={OwnerReportsScreen} options={{ title: "Analytics" }} /> : null
      ) : isMember ? (
        null
      ) : isOwnerOrStaff ? (
        <Tabs.Screen name="Reports" component={PaymentScreen} options={{ title: "Payments" }} />
      ) : canViewReports ? (
        <Tabs.Screen name="Reports" component={OwnerReportsScreen} options={{ title: "Analytics" }} />
      ) : null}

      <Tabs.Screen
        name="Profile"
        component={isOwnerOrStaff ? OwnerProfileScreen : OwnerProfileScreen}
        options={{ title: "Account" }}
      />
    </Tabs.Navigator>
  ));
    }
  }
}

export function MemberTabsNavigatorView({ model }: { model: ReturnType<typeof useMemberTabsNavigatorPresentation> }): React.ReactNode {
  const { fontScale = 1 } = useWindowDimensions();
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { MemberTabs, width, onActiveRouteChange, memberTabNames, colors, styles, getMemberTabIcon } = model.props;
      const authUid = (model.props as any).authUid ?? (model.props as any).user?.id ?? null;
      return ((
    <MemberTabs.Navigator
      tabBar={(props) => <BottomTabBar {...props} />}
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
        tabBarStyle: [styles.tabBar, { height: styles.tabBar.height + Math.ceil(Math.max(0, fontScale - 1) * 24) }],
        tabBarIcon: ({ color, focused }) => {
          const iconName = getMemberTabIcon(route.name, focused);
          const resolvedColor = focused ? colors.primary : color;

          if (route.name === "MemberAttendance") {
            return (
              <View style={{ position: "relative", alignItems: "center", justifyContent: "center" }}>
                <Ionicons name={iconName} size={22} color={resolvedColor} />
                <View
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: 7,
                    height: 7,
                    borderRadius: 3.5,
                    backgroundColor: colors.success,
                  }}
                />
              </View>
            );
          }

          return <Ionicons name={iconName} size={22} color={resolvedColor} />;
        }
      })}
    >
      <MemberTabs.Screen name="MemberHome" component={MemberDashboardScreen} initialParams={{ authUid }} options={{ title: "Summary" }} />
      <MemberTabs.Screen name="MemberWorkout" component={MemberWorkoutScreen} initialParams={{ authUid }} options={{ title: "Workouts" }} />
      <MemberTabs.Screen name="MemberMealPlan" component={MemberMealPlanScreen} options={{ title: "Nutrition" }} />
      <MemberTabs.Screen name="MemberAttendance" component={MemberAttendanceScreen} options={{ title: "Pass" }} />
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
  const [splashSkipped, setSplashSkipped] = useState(false);
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { navTheme, Stack, navigationState, user, isMember, MemberAppTabsScreen, MemberMembershipLayoutScreen, MemberWorkoutLayoutScreen, MemberWorkoutDetailLayoutScreen, MemberExerciseDetailLayoutScreen, MemberWorkoutSessionLayoutScreen, MemberMealPlanLayoutScreen, MemberTrainerLayoutScreen, MemberClassesLayoutScreen, MemberNotificationsLayoutScreen, MemberGoalsLayoutScreen, MemberRewardsLayoutScreen, MemberSupportLayoutScreen, MemberSettingsLayoutScreen, MainTabs, SuperAdminManageGymsScreen, SuperAdminCreateGymAdminScreen, RoleInvitationsScreen, OwnerStaffScreen, OwnerMembersScreen, OwnerMemberClaimsScreen, OwnerMemberFormScreen, OwnerMemberProfileScreen, OwnerAttendanceScreen, OwnerPaymentsScreen, OwnerTrainersScreen, OwnerWorkoutPlansScreen, RoleDietPlansScreen, OwnerReportsScreen, OwnerRatingsFeedbackScreen, RoleNotificationsScreen, OwnerSettingsScreen, OwnerProfileScreen, RoleAIWorkoutGeneratorScreen, RoleWorkoutPlanScreen, RoleExerciseDetailScreen, RoleFeaturePlaceholderScreen } = model.props;
      const displayedNavigationState = splashSkipped ? navigationState : "loading";
      return ((
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator key={`${displayedNavigationState}:${user?.id ?? "guest"}:${user?.role ?? "none"}`} screenOptions={{ headerShown: false }}>
        {displayedNavigationState === "loading" ? (
          <Stack.Screen name="Splash">{() => <SplashScreen onSkip={() => setSplashSkipped(true)} />}</Stack.Screen>
        ) : displayedNavigationState === "app" ? (
          isMember ? (
          <>
            <Stack.Screen name="AppTabs" component={MemberAppTabsScreen} />
            <Stack.Screen name="MemberMembership" component={MemberMembershipLayoutScreen} />
            <Stack.Screen name="MemberWorkout" component={MemberWorkoutLayoutScreen} />
            <Stack.Screen name="MemberWorkoutDetail" component={MemberWorkoutDetailLayoutScreen} />
            <Stack.Screen name="MemberExerciseDetail" component={MemberExerciseDetailLayoutScreen} />
            <Stack.Screen name="MemberWorkoutSession" component={MemberWorkoutSessionLayoutScreen} />
            <Stack.Screen name="MemberMealPlan" component={MemberMealPlanLayoutScreen} />
            <Stack.Screen name="MemberTrainer" component={MemberTrainerLayoutScreen} />
            <Stack.Screen name="MemberClasses" component={MemberClassesLayoutScreen} />
            <Stack.Screen name="MemberNotifications" component={MemberNotificationsLayoutScreen} />
            <Stack.Screen name="MemberGoals" component={MemberGoalsLayoutScreen} />
            <Stack.Screen name="MemberProgress" component={MemberProgressScreen} />
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
            <Stack.Screen name="MemberClaims" component={OwnerMemberClaimsScreen} />
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
            <Stack.Screen name="RatingsFeedback" component={OwnerRatingsFeedbackScreen} />
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

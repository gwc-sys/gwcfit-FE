import type * as React from "react";
import { MemberDesktopLayoutView } from "./MemberDesktopLayout.presentation";
import { createStyles } from "./MemberDesktopLayout.styles";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useNavigationState } from "@react-navigation/native";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";

import { useLogout } from "../../hooks/useAuthActions";
import { useLiveNotifications } from "../../hooks/useLiveNotifications";
import { useMemberNotifications } from "../../hooks/useMember";
import { useAuthStore } from "../../store/useAuthStore";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { requestLogoutConfirmation } from "../../utils/logoutConfirmation";

type IconName = keyof typeof Ionicons.glyphMap;

const items: Array<{
  label: string;
  icon: IconName;
  route: string;
  group: "Overview" | "Plan" | "Account";
  tab?: boolean;
}> = [
  { label: "Dashboard", icon: "home-outline", route: "MemberHome", group: "Overview", tab: true },
  {
    label: "Workouts",
    icon: "barbell-outline",
    route: "MemberWorkout",
    group: "Overview", tab: true,
  },
  { label: "Meal Plan", icon: "restaurant-outline", route: "MemberMealPlan", group: "Overview" },
  { label: "Membership", icon: "ribbon-outline", route: "MemberMembership", group: "Account" },
  { label: "My trainer", icon: "person-outline", route: "MemberTrainer", group: "Plan" },
  {
    label: "Measurements",
    icon: "body-outline",
    route: "MemberProgress",
    group: "Plan", tab: true,
  },
  { label: "Goals", icon: "radio-button-on-outline", route: "MemberGoals", group: "Plan" },
  { label: "Schedule", icon: "calendar-outline", route: "MemberClasses", group: "Plan" },
  {
    label: "Attendance",
    icon: "checkbox-outline",
    route: "MemberAttendance",
    group: "Plan", tab: true,
  },
  {
    label: "Notifications",
    icon: "notifications-outline",
    route: "MemberNotifications", group: "Account",
  },
  { label: "Rewards", icon: "gift-outline", route: "MemberRewards", group: "Plan" },
  {
    label: "Profile",
    icon: "person-outline",
    route: "MemberProfileHome",
    group: "Account", tab: true,
  },
  { label: "Settings", icon: "settings-outline", route: "MemberSettings", group: "Account" },
  { label: "Support", icon: "chatbubbles-outline", route: "MemberSupport", group: "Account" },
];

const coachItems: Array<{
  label: string;
  icon: IconName;
  route: string;
  tab?: boolean;
}> = [
  { label: "Dashboard", icon: "home-outline", route: "MemberHome", tab: true },
  {
    label: "Workouts",
    icon: "barbell-outline",
    route: "MemberWorkout",
    tab: true,
  },
  {
    label: "Exercises",
    icon: "fitness-outline",
    route: "MemberWorkout",
    tab: true,
  },
  { label: "Nutrition", icon: "nutrition-outline", route: "MemberMealPlan" },
  {
    label: "Progress",
    icon: "trending-up-outline",
    route: "MemberProgress",
    tab: true,
  },
  {
    label: "AI Coach",
    icon: "information-circle-outline",
    route: "MemberWorkout",
  },
  { label: "Calendar", icon: "calendar-outline", route: "MemberClasses" },
  { label: "Notifications", icon: "notifications-outline", route: "MemberNotifications" },
  { label: "Settings", icon: "settings-outline", route: "MemberSettings" },
];

function deepestRouteName(state: any): string | undefined {
  let current = state;
  let name: string | undefined;
  while (current?.routes?.length) {
    const route = current.routes[current.index ?? 0];
    name = route?.name;
    current = route?.state;
  }
  return name;
}

export function useMemberDesktopLayoutPresentation({
  children,
  activeRouteName,
}: {
  children: ReactNode;
  activeRouteName?: string;
}) {
  const { width } = useWindowDimensions();
  const navigation = useNavigation<any>();
  const navigationRoute = useNavigationState(deepestRouteName);
  const activeRoute = activeRouteName ?? navigationRoute;
  const user = useAuthStore((state) => state.user);
  useLiveNotifications(user?.id);
  const unreadNotifications = useMemberNotifications(true).data ?? [];
  const logout = useLogout();
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const chromeIconColor = isDark ? colors.textSecondary : colors.inkSoft;
  const activeNavColor = isDark ? colors.ink : colors.primaryDark;
  const [search, setSearch] = useState("");
  const [selectedNavLabel, setSelectedNavLabel] = useState<string | null>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  // Start with the compact icon rail on every desktop session. People can
  // expand it from the PulseFit mark when they need the full labels.
  const [memberMenuVisible, setMemberMenuVisible] = useState(false);
  const coachMode = activeRoute === "MemberWorkoutSession";
  const visibleItems = items;
  const navigationGroups = ["Overview", "Plan", "Account"] as const;
  const compactHeader = width < 760;
  const firstName = user?.full_name?.trim().split(/\s+/)[0] || "Member";
  const initials =
    (user?.full_name ?? "Member")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "M";
  const currentDate = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());
  const routeMatchesItem = (item: (typeof items)[number]) =>
    activeRoute === item.route ||
    (activeRoute === "AppTabs" && Boolean(item.tab));
  const selectedItem = visibleItems.find(
    (item) => item.label === selectedNavLabel,
  );
  const activeNavLabel =
    selectedItem && routeMatchesItem(selectedItem)
      ? selectedItem.label
      : activeRoute === "AppTabs"
        ? "Dashboard"
        : visibleItems.find(
            (item) =>
              (coachMode && item.label === "Workouts") ||
              routeMatchesItem(item),
          )?.label;

  useEffect(() => {
    setSelectedNavLabel((currentLabel) => {
      const currentItem = visibleItems.find(
        (item) => item.label === currentLabel,
      );
      return currentItem && routeMatchesItem(currentItem) ? currentLabel : null;
    });
    setProfileMenuOpen(false);
    setCalendarOpen(false);
  }, [activeRoute, coachMode]);

  const submitSearch = () => {
    const term = search.trim().toLowerCase();
    if (!term) return;
    if (
      term.includes("meal") ||
      term.includes("nutrition") ||
      term.includes("diet")
    ) {
      setSelectedNavLabel("Meal Plan");
      navigation.navigate("MemberMealPlan");
    } else if (term.includes("progress") || term.includes("measurement")) {
      setSelectedNavLabel("Measurements");
      navigation.navigate("AppTabs", { screen: "MemberProgress" });
    } else if (term.includes("attendance")) {
      setSelectedNavLabel("Attendance");
      navigation.navigate("AppTabs", { screen: "MemberAttendance" });
    } else if (term.includes("goal")) {
      setSelectedNavLabel("Goals");
      navigation.navigate("MemberGoals");
    } else if (
      term.includes("schedule") ||
      term.includes("calendar") ||
      term.includes("class")
    ) {
      setSelectedNavLabel("Schedule");
      navigation.navigate("MemberClasses");
    } else {
      setSelectedNavLabel("Workouts");
      navigation.navigate("AppTabs", { screen: "MemberWorkout" });
    }
    setSearch("");
  };

  const memberHeader = (
    <View
      style={[styles.memberHeader, compactHeader && styles.memberHeaderCompact]}
    >
      <View style={styles.greeting}>
        <Text style={styles.greetingName}>{firstName}!</Text>
        <Text style={styles.greetingText}>
          You're doing great. Keep pushing!
        </Text>
      </View>
      <View
        style={[
          styles.headerActions,
          compactHeader && styles.headerActionsCompact,
        ]}
      >
        <View
          style={[styles.searchBox, compactHeader && styles.searchBoxCompact]}
        >
          <Ionicons name="search-outline" size={16} color={chromeIconColor} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={submitSearch}
            returnKeyType="search"
            placeholder="Search something..."
            placeholderTextColor={colors.muted}
            style={styles.searchInput}
          />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open calendar"
          accessibilityState={{ expanded: calendarOpen }}
          onPress={() => {
            setProfileMenuOpen(false);
            setCalendarOpen((open) => !open);
          }}
          style={styles.dateButton}
        >
          <Ionicons name="calendar-outline" size={16} color={chromeIconColor} />
          <Text style={styles.dateText}>{currentDate}</Text>
          <Ionicons name="chevron-down" size={14} color={chromeIconColor} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open notifications"
          onPress={() => {
            setProfileMenuOpen(false);
            setSelectedNavLabel("Notifications");
            navigation.navigate("MemberNotifications");
          }}
          style={styles.headerIcon}
        >
          <Ionicons name="notifications-outline" size={18} color={chromeIconColor} />
          {unreadNotifications.length > 0 ? (
            <View style={{ position: "absolute", top: 8, right: 8, width: 7, height: 7, borderRadius: 4, backgroundColor: "#E91E63" }} />
          ) : null}
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open profile menu"
          accessibilityState={{ expanded: profileMenuOpen }}
          onPress={() => { setCalendarOpen(false); setProfileMenuOpen((open) => !open); }}
          style={styles.profileButton}
        >
          <View style={styles.profileInner}>
            <Ionicons name="person" size={16} color={colors.primaryDark} />
          </View>
        </Pressable>
      </View>
      {profileMenuOpen ? (
        <View
          style={[
            styles.profileMenu,
            compactHeader && styles.profileMenuCompact,
            { width: Math.min(350, Math.max(280, width - 24)) },
          ]}
        >
          <View style={styles.profileMenuAccount}>
            <View style={styles.profileMenuAvatar}>
              <Text style={styles.profileMenuInitials}>{initials}</Text>
            </View>
            <View style={styles.profileMenuIdentity}>
              <Text numberOfLines={1} style={styles.profileMenuName}>
                {user?.full_name ?? "Member"}
              </Text>
              <Text numberOfLines={1} style={styles.profileMenuEmail}>
                {user?.email ?? "Member account"}
              </Text>
            </View>
          </View>
          <View style={styles.profileMenuDivider} />
          <Pressable
            onPress={() => {
              setProfileMenuOpen(false);
              setSelectedNavLabel("Profile");
              navigation.navigate("AppTabs", { screen: "MemberProfileHome" });
            }}
            style={({ pressed }) => [
              styles.profileMenuItem,
              pressed && styles.profileMenuItemPressed,
            ]}
          >
            <Ionicons name="person-outline" size={23} color={colors.primaryDark} />
            <Text style={styles.profileMenuItemText}>My Profile</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setProfileMenuOpen(false);
              setSelectedNavLabel("Settings");
              navigation.navigate("MemberSettings");
            }}
            style={({ pressed }) => [
              styles.profileMenuItem,
              pressed && styles.profileMenuItemPressed,
            ]}
          >
            <Ionicons name="settings-outline" size={23} color={colors.primaryDark} />
            <Text style={styles.profileMenuItemText}>Settings</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setProfileMenuOpen(false);
              setSelectedNavLabel("Notifications");
              navigation.navigate("MemberNotifications");
            }}
            style={({ pressed }) => [
              styles.profileMenuItem,
              pressed && styles.profileMenuItemPressed,
            ]}
          >
            <Ionicons name="notifications-outline" size={23} color={colors.primaryDark} />
            <Text style={styles.profileMenuItemText}>Notifications</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setProfileMenuOpen(false);
              navigation.navigate("MemberSettings");
            }}
            style={({ pressed }) => [
              styles.profileMenuItem,
              pressed && styles.profileMenuItemPressed,
            ]}
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={23}
              color={colors.primaryDark}
            />
            <Text style={styles.profileMenuItemText}>Security</Text>
          </Pressable>
          <View style={styles.profileMenuDivider} />
          <Pressable
            onPress={() => {
              setProfileMenuOpen(false);
              requestLogoutConfirmation(() => logout.mutate());
            }}
            style={({ pressed }) => [
              styles.profileMenuItem,
              styles.profileMenuLogout,
              pressed && styles.profileMenuItemPressed,
            ]}
          >
            <Ionicons name="log-out-outline" size={23} color="#FF3B30" />
            <Text style={styles.profileMenuLogoutText}>Log out</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );

  if (width < 1180)
    return { kind: "view1" as const, props: { styles, colors, children } };

  const isCustomHeaderScreen =
    activeNavLabel === "Dashboard" ||
    activeNavLabel === "Meal Plan" ||
    activeNavLabel === "Workouts" ||
    activeNavLabel === "Measurements" ||
    activeNavLabel === "Goals" ||
    activeNavLabel === "Schedule" ||
    activeNavLabel === "Attendance" ||
    activeNavLabel === "Rewards" ||
    activeNavLabel === "Achievements" ||
    activeNavLabel === "Membership" ||
    activeNavLabel === "Notifications" ||
    activeNavLabel === "Profile" ||
    activeRoute === "MemberProfileHome" ||
    activeRoute === "MemberProfile" ||
    activeRoute === "MemberNotifications" ||
    activeRoute === "MemberHome" ||
    activeRoute === "AppTabs" ||
    activeRoute === "MemberMealPlan" ||
    activeRoute === "MemberWorkout" ||
    activeRoute === "MemberProgress" ||
    activeRoute === "MemberGoals" ||
    activeRoute === "MemberClasses" ||
    activeRoute === "MemberAttendance" ||
    activeRoute === "MemberRewards" ||
    activeRoute === "MemberMembership";

  const content = (
    <View style={styles.content}>
      {profileMenuOpen ? <Pressable accessibilityRole="button" accessibilityLabel="Close profile menu" onPress={() => setProfileMenuOpen(false)} style={[StyleSheet.absoluteFill, { zIndex: 10 }]} /> : null}
      {!isCustomHeaderScreen ? memberHeader : null}
      <View style={styles.pageContent}>{children}</View>
    </View>
  );

  return { kind: "view2" as const, props: { styles, colors, coachMode, visibleItems, navigationGroups, activeNavLabel, setSelectedNavLabel, setProfileMenuOpen, calendarOpen, setCalendarOpen, navigation, activeNavColor, chromeIconColor, user, logout, content, memberMenuVisible, setMemberMenuVisible } };
}

export function MemberDesktopLayout(...args: Parameters<typeof useMemberDesktopLayoutPresentation>): React.JSX.Element {
  return <MemberDesktopLayoutView model={useMemberDesktopLayoutPresentation(...args)} />;
}



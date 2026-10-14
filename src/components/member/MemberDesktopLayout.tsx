import type * as React from "react";
import { MemberDesktopLayoutView } from "./MemberDesktopLayout.presentation";
import { createStyles } from "./MemberDesktopLayout.styles";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useNavigationState } from "@react-navigation/native";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";

import { useLogout } from "../../hooks/useAuthActions";
import { useAuthStore } from "../../store/useAuthStore";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { requestLogoutConfirmation } from "../../utils/logoutConfirmation";

type IconName = keyof typeof Ionicons.glyphMap;

const items: Array<{
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
  { label: "Meal Plan", icon: "restaurant-outline", route: "MemberMealPlan" },
  {
    label: "Progress",
    icon: "stats-chart-outline",
    route: "MemberProgress",
    tab: true,
  },
  {
    label: "Measurements",
    icon: "body-outline",
    route: "MemberProgress",
    tab: true,
  },
  { label: "Goals", icon: "radio-button-on-outline", route: "MemberGoals" },
  { label: "Schedule", icon: "calendar-outline", route: "MemberClasses" },
  {
    label: "Attendance",
    icon: "checkbox-outline",
    route: "MemberAttendance",
    tab: true,
  },
  {
    label: "Messages",
    icon: "chatbubble-ellipses-outline",
    route: "MemberNotifications",
  },
  { label: "Achievements", icon: "star-outline", route: "MemberRewards" },
  {
    label: "Profile",
    icon: "person-outline",
    route: "MemberProfileHome",
    tab: true,
  },
  { label: "Settings", icon: "settings-outline", route: "MemberSettings" },
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
  { label: "Messages", icon: "mail-outline", route: "MemberNotifications" },
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
  const logout = useLogout();
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const chromeIconColor = isDark ? colors.textSecondary : colors.inkSoft;
  const activeNavColor = colors.white;
  const [search, setSearch] = useState("");
  const [selectedNavLabel, setSelectedNavLabel] = useState<string | null>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const coachMode = activeRoute === "MemberWorkoutSession";
  const visibleItems = coachMode ? coachItems : items;
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
              (coachMode && item.label === "AI Coach") ||
              routeMatchesItem(item),
          )?.label;

  useEffect(() => {
    setSelectedNavLabel((currentLabel) => {
      const currentItem = visibleItems.find(
        (item) => item.label === currentLabel,
      );
      return currentItem && routeMatchesItem(currentItem) ? currentLabel : null;
    });
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
      setSelectedNavLabel(
        term.includes("measurement") ? "Measurements" : "Progress",
      );
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
          <Ionicons name="search-outline" size={22} color={chromeIconColor} />
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
          onPress={() => {
            setSelectedNavLabel("Schedule");
            navigation.navigate("MemberClasses");
          }}
          style={styles.dateButton}
        >
          <Ionicons name="calendar-outline" size={21} color={chromeIconColor} />
          <Text style={styles.dateText}>{currentDate}</Text>
          <Ionicons name="chevron-down" size={18} color={chromeIconColor} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open notifications"
          onPress={() => {
            setSelectedNavLabel("Messages");
            navigation.navigate("MemberNotifications");
          }}
          style={styles.headerIcon}
        >
          <Ionicons name="notifications-outline" size={25} color={chromeIconColor} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open profile menu"
          accessibilityState={{ expanded: profileMenuOpen }}
          onPress={() => setProfileMenuOpen((open) => !open)}
          style={styles.profileButton}
        >
          <View style={styles.profileInner}>
            <Ionicons name="person" size={24} color={colors.primaryDark} />
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
              setSelectedNavLabel("Messages");
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
            <Ionicons name="log-out-outline" size={23} color="#FF4D55" />
            <Text style={styles.profileMenuLogoutText}>Log out</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );

  if (width < 1180)
    return { kind: "view1" as const, props: { styles, colors, children } };

  const content = (
    <View style={styles.content}>
      {memberHeader}
      <View style={styles.pageContent}>{children}</View>
    </View>
  );

  return { kind: "view2" as const, props: { styles, colors, coachMode, visibleItems, activeNavLabel, setSelectedNavLabel, navigation, activeNavColor, chromeIconColor, user, logout, content } };
}

export function MemberDesktopLayout(...args: Parameters<typeof useMemberDesktopLayoutPresentation>): React.JSX.Element {
  return <MemberDesktopLayoutView model={useMemberDesktopLayoutPresentation(...args)} />;
}



import type * as React from "react";
import { PulseDashboardLayoutView, GymOwnerSidebarView, OwnerAccountItemView, MobileBrandButtonView, PulseDashboardHeaderView, HeaderCircleButtonView } from "./PulseDashboardLayout.presentation";
import { stylesStatic, createStyles, createHeaderStyles } from "./PulseDashboardLayout.styles";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useQuery } from "@tanstack/react-query";
import type { ReactElement, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Platform,
  Modal,
  Pressable,
  RefreshControlProps,
  StyleProp,
  StyleSheet,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuthStore } from "../../store/useAuthStore";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { radius, shadows, spacing, typography } from "../../theme/theme";
import type { ThemeColors } from "../../theme/theme";
import { formatRole, initials } from "../../utils/formatters";
import { useLogout } from "../../hooks/useAuthActions";
import { requestLogoutConfirmation } from "../../utils/logoutConfirmation";
import { notificationsApi } from "../../services/api/notifications";
import { Screen } from "../Screen";

export type PulseNavItem = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route?: string;
  params?: Record<string, unknown>;
};

type PulseDashboardLayoutProps = {
  children: ReactNode;
  activeLabel?: string;
  navItems?: PulseNavItem[];
  roleLabel?: string;
  contentStyle?: StyleProp<ViewStyle>;
  refreshControl?: ReactElement<RefreshControlProps>;
  accountMenuRequest?: number;
  trainerSearchValue?: string;
  onTrainerSearchChange?: (value: string) => void;
};

type PulseDashboardHeaderProps = {
  title: string;
  subtitle: string;
  dateLabel?: string;
  onSearch?: () => void;
  onNotifications?: () => void;
  onMessages?: () => void;
  notificationBadge?: string;
};

const baseNavItems: PulseNavItem[] = [
  {
    label: "Dashboard",
    icon: "grid-outline",
    route: "AppTabs",
    params: { screen: "Dashboard" },
  },
  { label: "Members", icon: "people-outline", route: "MemberList" },
  { label: "Workouts", icon: "barbell-outline", route: "WorkoutPlans" },
  { label: "Diets", icon: "nutrition-outline", route: "DietPlans" },
  { label: "Messages", icon: "chatbubbles-outline", route: "Notifications" },
  { label: "Reports", icon: "analytics-outline", route: "Reports" },
  {
    label: "Goals",
    icon: "flag-outline",
    route: "FeaturePlaceholder",
    params: { title: "Goals", message: "Goal tracking is coming soon." },
  },
];

const ownerNavItems: PulseNavItem[] = [
  {
    label: "Dashboard",
    icon: "grid-outline",
    route: "AppTabs",
    params: { screen: "Dashboard" },
  },
  { label: "Members", icon: "people-outline", route: "MemberList" },
  { label: "Trainers", icon: "barbell-outline", route: "Trainers" },
  { label: "Receptionists", icon: "person-outline", route: "Staff" },
  { label: "Invitations", icon: "ticket-outline", route: "Invitations" },
  { label: "Attendance", icon: "calendar-outline", route: "Attendance" },
  { label: "Workouts", icon: "barbell-outline", route: "WorkoutPlans" },
  { label: "Nutrition", icon: "restaurant-outline", route: "DietPlans" },
  { label: "Payments", icon: "card-outline", route: "Payments" },
  { label: "Reports", icon: "document-text-outline", route: "Reports" },
  { label: "Messages", icon: "mail-outline", route: "Notifications" },
  { label: "Plans", icon: "pricetag-outline", route: "MembershipPlans" },
  { label: "Settings", icon: "settings-outline", route: "Settings" },
];

const platformNavItems: PulseNavItem[] = [
  {
    label: "Overview",
    icon: "grid-outline",
    route: "AppTabs",
    params: { screen: "Dashboard" },
  },
  { label: "Gyms", icon: "business-outline", route: "ManageGyms" },
  { label: "Invitations", icon: "ticket-outline", route: "Invitations" },
  { label: "Members", icon: "people-outline", route: "MemberList" },
  { label: "Staff", icon: "person-outline", route: "Staff" },
  {
    label: "Membership plans",
    icon: "pricetag-outline",
    route: "MembershipPlans",
  },
  { label: "Payments", icon: "card-outline", route: "Payments" },
  { label: "Reports", icon: "analytics-outline", route: "Reports" },
  { label: "Settings", icon: "settings-outline", route: "Settings" },
  { label: "Profile", icon: "person-circle-outline", route: "Profile" },
];

function getNavItems(role?: string) {
  if (role === "super_admin") {
    return platformNavItems;
  }

  if (role === "gym_owner" || role === "sub_admin" || role === "receptionist") {
    return ownerNavItems;
  }

  return baseNavItems;
}

function firstName(name?: string | null) {
  const trimmed = name?.trim();
  if (!trimmed) {
    return "there";
  }

  return trimmed.split(/\s+/)[0];
}

export function getWelcomeTitle(name?: string | null) {
  return `Welcome back, ${firstName(name)}!`;
}

export function usePulseDashboardLayoutPresentation({
  children,
  activeLabel = "Dashboard",
  navItems,
  roleLabel,
  contentStyle,
  refreshControl,
  accountMenuRequest = 0,
  trainerSearchValue,
  onTrainerSearchChange,
}: PulseDashboardLayoutProps) {
  const navigation = useNavigation<any>();
  const { colors, isDark, toggleColorScheme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const user = useAuthStore((state) => state.user);
  const isDesktop = width >= 1100;
  const sidebarItems = navItems ?? getNavItems(user?.role);
  const resolvedRoleLabel =
    roleLabel ?? (user?.role ? formatRole(user.role) : "Trainer");
  // Keep behavior tied to the permission-bearing role, not a translated label.
  // Labels can change per locale or product wording without changing access.
  const isPlatformAdmin = user?.role === "super_admin";
  const isGymOwner = user?.role === "gym_owner";
  const isTrainer = user?.role === "trainer";
  const userName = user?.full_name ?? "John Trainer";
  const notificationQuery = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => notificationsApi.list(true),
    enabled: Boolean(user),
    refetchInterval: 30000,
    retry: false,
  });
  const unreadNotificationCount = notificationQuery.data?.length ?? 0;
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [localTrainerSearch, setLocalTrainerSearch] = useState("");
  const logout = useLogout();
  const styles = useMemo(
    () => createStyles(colors, width, height, insets.bottom),
    [colors, width, height, insets.bottom],
  );
  const resolvedTrainerSearch = trainerSearchValue ?? localTrainerSearch;
  const setResolvedTrainerSearch =
    onTrainerSearchChange ?? setLocalTrainerSearch;
  const trainerDate = useMemo(
    () =>
      new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    [],
  );
  const ownerDate = useMemo(
    () =>
      new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    [],
  );

  useEffect(() => {
    if (accountMenuRequest > 0) setAccountMenuOpen(true);
  }, [accountMenuRequest]);

  return { kind: "view1" as const, props: { styles, contentStyle, refreshControl, isDesktop, isTrainer, isGymOwner, GymOwnerSidebar, activeLabel, navigation, isPlatformAdmin, colors, resolvedRoleLabel, sidebarItems, setAccountMenuOpen, userName, MobileBrandButton, firstName, ownerDate, unreadNotificationCount, resolvedTrainerSearch, setResolvedTrainerSearch, trainerDate, children, accountMenuOpen, user, OwnerAccountItem, isDark, toggleColorScheme, logout } };
}

export function PulseDashboardLayout(...args: Parameters<typeof usePulseDashboardLayoutPresentation>): React.JSX.Element {
  return <PulseDashboardLayoutView model={usePulseDashboardLayoutPresentation(...args)} />;
}

export function useGymOwnerSidebarPresentation({
  activeLabel,
  onNavigate,
  styles,
}: {
  activeLabel: string;
  onNavigate: (route: string, params?: Record<string, unknown>) => void;
  styles: any;
}) {
  const { colors } = useAppTheme();
  return { kind: "view1" as const, props: { styles, colors, ownerNavItems, activeLabel, onNavigate } };
}

function GymOwnerSidebar(...args: Parameters<typeof useGymOwnerSidebarPresentation>): React.JSX.Element {
  return <GymOwnerSidebarView model={useGymOwnerSidebarPresentation(...args)} />;
}

export function useOwnerAccountItemPresentation({
  icon,
  label,
  onPress,
  styles,
  danger = false,
  disabled = false,
  trainer = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  styles: any;
  danger?: boolean;
  disabled?: boolean;
  trainer?: boolean;
}) {
  return { kind: "view1" as const, props: { disabled, onPress, styles, trainer, icon, danger, label } };
}

function OwnerAccountItem(...args: Parameters<typeof useOwnerAccountItemPresentation>): React.JSX.Element {
  return <OwnerAccountItemView model={useOwnerAccountItemPresentation(...args)} />;
}

export function useMobileBrandButtonPresentation({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();

  return { kind: "view1" as const, props: { label, onPress, stylesStatic, icon, colors } };
}

function MobileBrandButton(...args: Parameters<typeof useMobileBrandButtonPresentation>): React.JSX.Element {
  return <MobileBrandButtonView model={useMobileBrandButtonPresentation(...args)} />;
}



export function usePulseDashboardHeaderPresentation({
  title,
  subtitle,
  dateLabel,
  onSearch,
  onNotifications,
  onMessages,
  notificationBadge,
}: PulseDashboardHeaderProps) {
  const { colors } = useAppTheme();
  const { width } = useWindowDimensions();
  const styles = useMemo(
    () => createHeaderStyles(colors, width),
    [colors, width],
  );
  const resolvedDate =
    dateLabel ??
    new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date());

  return { kind: "view1" as const, props: { styles, title, subtitle, colors, resolvedDate, onSearch, HeaderCircleButton, onNotifications, notificationBadge, onMessages } };
}

export function PulseDashboardHeader(...args: Parameters<typeof usePulseDashboardHeaderPresentation>): React.JSX.Element {
  return <PulseDashboardHeaderView model={usePulseDashboardHeaderPresentation(...args)} />;
}

export function useHeaderCircleButtonPresentation({
  icon,
  badge,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  badge?: string;
  onPress?: () => void;
}) {
  const { colors } = useAppTheme();
  const { width } = useWindowDimensions();
  const styles = useMemo(
    () => createHeaderStyles(colors, width),
    [colors, width],
  );

  return { kind: "view1" as const, props: { onPress, styles, icon, colors, badge } };
}

function HeaderCircleButton(...args: Parameters<typeof useHeaderCircleButtonPresentation>): React.JSX.Element {
  return <HeaderCircleButtonView model={useHeaderCircleButtonPresentation(...args)} />;
}





import type * as React from "react";
import { GymAdminDashboardScreenView, GymOwnerDashboardContentView, OwnerProfileMenuView, ProfileMenuItemView, OwnerMetricView, DistributionRowView, SimpleChartView, StatusPanelView, PlansPanelView, RevenuePanelView, RecentMembersPanelView } from "./GymAdminDashboardScreen.presentation";
import { ownerProfileStyles, ownerCalendarStyles, createOwnerDashboardStyles, createStyles } from "./GymAdminDashboardScreen.styles";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useQuery } from "@tanstack/react-query";

import { DataState } from "../../components/DataState";
import { MetricCard } from "../../components/MetricCard";
import { QuickAction } from "../../components/QuickAction";
import { SectionHeader } from "../../components/SectionHeader";
import { StatusBadge } from "../../components/StatusBadge";
import { SurfacePanel } from "../../components/SurfacePanel";
import {
  PulseDashboardHeader,
  PulseDashboardLayout,
  getWelcomeTitle,
} from "../../components/dashboard/PulseDashboardLayout";
import { reportsApi } from "../../services/api/reports";
import { membersApi } from "../../services/api/members";
import {
  attendanceApi,
  paymentsApi,
  membershipPlansApi,
  usersApi,
  workoutPlansApi,
} from "../../services/api/operations";
import { getApiErrorMessage } from "../../services/api/client";
import { useAuthStore } from "../../store/useAuthStore";
import { useLogout } from "../../hooks/useAuthActions";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { radius, spacing, typography } from "../../theme/theme";
import type { ThemeColors } from "../../theme/theme";
import { relatedDisplayName } from "../../utils/displayNames";
import {
  formatCurrency,
  formatDate,
  formatRole,
  initials,
  memberStatusTone,
} from "../../utils/formatters";
import { requestLogoutConfirmation } from "../../utils/logoutConfirmation";
import type { ManagedUserRole } from "../../types/saas";
import {
  repdbExerciseLibrary,
  repdbExercisesByGroup,
  repdbWorkoutGroups,
} from "../../data/repdbExerciseLibrary";

export function useGymAdminDashboardScreenPresentation() {
  const navigation = useNavigation<any>();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const user = useAuthStore((state) => state.user);
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const isGymOwner = user?.role === "gym_owner";
  const canManageReports = isGymOwner || hasPermission("manage_reports");
  const canManageMembers = isGymOwner || hasPermission("manage_members");
  const canManageAttendance = isGymOwner || hasPermission("manage_attendance");
  const canManagePayments = isGymOwner || hasPermission("manage_payments");
  const canManageMembershipPlans =
    isGymOwner || hasPermission("manage_membership_plans");
  const canManageTrainers = isGymOwner || hasPermission("manage_trainers");
  const canManageStaff = isGymOwner || hasPermission("manage_staff");
  const canManageWorkouts = isGymOwner || hasPermission("manage_workouts");
  const statsQuery = useQuery({
    queryKey: ["reports", "dashboard"],
    queryFn: reportsApi.dashboard,
    enabled: canManageReports,
    retry: false,
  });
  const membersQuery = useQuery({
    queryKey: ["members", "dashboard"],
    queryFn: () => membersApi.list({ limit: 200 }),
    enabled: canManageMembers,
    retry: false,
  });
  const paymentsQuery = useQuery({
    queryKey: ["operations", "payments", "dashboard"],
    queryFn: () => paymentsApi.list({ limit: 200 }),
    enabled: canManagePayments,
    retry: false,
  });
  const plansQuery = useQuery({
    queryKey: ["operations", "membership-plans", "dashboard"],
    queryFn: () => membershipPlansApi.list({ limit: 200 }),
    enabled: canManageMembershipPlans,
    retry: false,
  });
  const staffQuery = useQuery({
    queryKey: ["users", "dashboard"],
    queryFn: () => usersApi.list({ limit: 8 }),
    enabled: canManageStaff,
    retry: false,
    refetchOnMount: "always",
  });
  const userCountsQuery = useQuery({
    queryKey: ["users", "counts", "gym-admin-dashboard"],
    queryFn: () => usersApi.counts(),
    enabled: canManageStaff,
    retry: false,
    refetchOnMount: "always",
  });
  const attendanceQuery = useQuery({
    queryKey: ["attendance", "dashboard"],
    queryFn: () => attendanceApi.list({ limit: 200 }),
    enabled: canManageAttendance,
    retry: false,
  });
  const workoutsQuery = useQuery({
    queryKey: ["workout-plans", "dashboard"],
    queryFn: () => workoutPlansApi.list({ limit: 200 }),
    enabled: canManageWorkouts,
    retry: false,
  });
  const refetchStaff = staffQuery.refetch;
  const refetchUserCounts = userCountsQuery.refetch;

  useFocusEffect(
    useCallback(() => {
      if (canManageStaff) {
        void refetchStaff();
        void refetchUserCounts();
      }
    }, [canManageStaff, refetchStaff, refetchUserCounts]),
  );

  const paymentStats = useMemo(() => {
    const payments = paymentsQuery.data ?? [];
    return {
      pending: payments.filter((payment) => payment.status === "pending")
        .length,
      paid: payments.filter((payment) => payment.status === "paid").length,
    };
  }, [paymentsQuery.data]);

  const userCounts = useMemo(
    () => ({
      total: userCountsQuery.data?.total ?? 0,
      member: userCountsQuery.data?.member ?? 0,
      trainer: userCountsQuery.data?.trainer ?? 0,
      receptionist: userCountsQuery.data?.receptionist ?? 0,
      sub_admin: userCountsQuery.data?.sub_admin ?? 0,
    }),
    [userCountsQuery.data],
  );
  const isRefreshing =
    statsQuery.isFetching ||
    membersQuery.isFetching ||
    paymentsQuery.isFetching ||
    plansQuery.isFetching ||
    staffQuery.isFetching ||
    userCountsQuery.isFetching ||
    attendanceQuery.isFetching ||
    workoutsQuery.isFetching;
  const recentMembers = membersQuery.data ?? [];
  const recentStaff = staffQuery.data ?? [];
  const dashboardCopy = getDashboardCopy(user?.role);

  if (isGymOwner) {
    return { kind: "view1" as const, props: { GymOwnerDashboardContent, navigation, statsQuery, recentMembers, recentStaff, userCounts, plansQuery, paymentsQuery, attendanceQuery, workoutsQuery } };
  }

  return { kind: "view2" as const, props: { dashboardCopy, isRefreshing, statsQuery, membersQuery, paymentsQuery, plansQuery, staffQuery, userCountsQuery, user, navigation, canManageReports, styles, canManageStaff, userCounts, canManageMembers, canManageAttendance, canManagePayments, canManageTrainers, paymentStats, recentMembers, recentStaff, roleTone } };
}

export function GymAdminDashboardScreen(...args: Parameters<typeof useGymAdminDashboardScreenPresentation>): React.JSX.Element {
  return <GymAdminDashboardScreenView model={useGymAdminDashboardScreenPresentation(...args)} />;
}

let ownerChartValues: number[] = [];
let ownerAttendanceValues: number[] = [];
let ownerChartMembers: any[] = [];
let ownerChartAttendance: any[] = [];

export function useGymOwnerDashboardContentPresentation({
  navigation: rootNavigation,
  stats,
  members,
  staff,
  userCounts,
  plans,
  payments,
  attendance,
  workouts,
}: {
  navigation: any;
  stats?: any;
  members: any[];
  staff: any[];
  userCounts: {
    total: number;
    member: number;
    trainer: number;
    receptionist: number;
    sub_admin: number;
  };
  plans: any[];
  payments: any[];
  attendance: any[];
  workouts: any[];
}) {
  const { colors } = useAppTheme();
  const styles = useMemo(
    () => ({
      ...createOwnerDashboardStyles(colors),
      profileButton: {
        minHeight: 44,
        flexDirection: "row" as const,
        alignItems: "center" as const,
        gap: 8,
        paddingLeft: 8,
      },
      profileAvatar: {
        width: 36,
        height: 36,
        alignItems: "center" as const,
        justifyContent: "center" as const,
        borderRadius: 18,
        backgroundColor: "#F6B38A",
      },
      profileAvatarText: {
        fontSize: 11,
        color: colors.white,
        fontWeight: "900" as const,
      },
      profileName: {
        maxWidth: 100,
        fontSize: 11,
        color: colors.white,
        fontWeight: "800" as const,
      },
      profileRole: { fontSize: 9, color: colors.textSecondary, marginTop: 2 },
    }),
    [colors],
  );
  const revenue = stats?.revenue_cents_this_month ?? 0;
  const pendingPayments = payments.filter(
    (payment) => payment.status === "pending",
  ).length;
  const activeMembers = stats?.active_members ?? userCounts.member;
  const recent = [...members]
    .sort(
      (a, b) =>
        new Date(b.joined_at ?? 0).getTime() -
        new Date(a.joined_at ?? 0).getTime(),
    )
    .slice(0, 4);
  const todayKey = new Date().toISOString().slice(0, 10);
  const todayCheckins = attendance.filter(
    (item) => String(item.check_in_at ?? "").slice(0, 10) === todayKey,
  ).length;
  const newMembersToday = members.filter(
    (member) => String(member.joined_at ?? "").slice(0, 10) === todayKey,
  ).length;
  const paidPayments = payments.filter((payment) => payment.status === "paid");
  const paidTotal = paidPayments.reduce(
    (sum, payment) => sum + Number(payment.amount_cents ?? 0),
    0,
  );
  const statusCounts = members.reduce(
    (counts, member) => {
      const status = String(member.status ?? "active").toLowerCase();
      counts[status] = (counts[status] ?? 0) + 1;
      return counts;
    },
    {} as Record<string, number>,
  );
  const planCounts = members.reduce(
    (counts, member) => {
      const key = member.membership_plan_name ?? "Unassigned";
      counts[key] = (counts[key] ?? 0) + 1;
      return counts;
    },
    {} as Record<string, number>,
  );
  const exerciseGroupCounts = repdbWorkoutGroups.map((group) => ({
    group,
    count: repdbExercisesByGroup[group].length,
  }));
  const chartValues = buildLastSevenDayCounts(members, "joined_at");
  const attendanceValues = buildLastSevenDayCounts(attendance, "check_in_at");
  const revenueValues = buildLastFiveWeekRevenue(paidPayments);
  ownerChartValues = chartValues;
  ownerAttendanceValues = attendanceValues;
  ownerChartMembers = members;
  ownerChartAttendance = attendance;
  const owner = useAuthStore((state) => state.user);
  const logout = useLogout();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarMonth, setCalendarMonth] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const navigation = {
    ...rootNavigation,
    navigate: (route: string, params?: object) =>
      route === "Profile"
        ? setProfileMenuOpen(true)
        : rootNavigation.navigate(route, params),
  };
  const displayName = owner?.full_name?.split(" ")[0] ?? "Gold";
  const formattedSelectedDate = selectedDate.toLocaleDateString("en-IN", { month: "short", day: "2-digit", year: "numeric" });
  const monthStartDay = new Date(
    calendarMonth.getFullYear(),
    calendarMonth.getMonth(),
    1,
  ).getDay();
  const daysInCalendarMonth = new Date(
    calendarMonth.getFullYear(),
    calendarMonth.getMonth() + 1,
    0,
  ).getDate();
  const calendarDays = Array.from(
    { length: monthStartDay + daysInCalendarMonth },
    (_, index) =>
      index < monthStartDay
        ? null
        : new Date(
            calendarMonth.getFullYear(),
            calendarMonth.getMonth(),
            index - monthStartDay + 1,
          ),
  );
  const calendarWeekdays = ["S", "M", "T", "W", "T", "F", "S"];

  return { kind: "view1" as const, props: { styles, displayName, setCalendarOpen, colors, formattedSelectedDate, navigation, owner, calendarOpen, ownerCalendarStyles, setCalendarMonth, calendarMonth, calendarWeekdays, calendarDays, selectedDate, setSelectedDate, OwnerMetric, activeMembers, stats, revenue, userCounts, SimpleChart, DistributionRow, workouts, pendingPayments, StatusPanel, statusCounts, PlansPanel, plans, planCounts, RevenuePanel, revenueValues, RecentMembersPanel, recent, exerciseGroupCounts, OwnerProfileMenu, profileMenuOpen, logout, setProfileMenuOpen } };
}

function GymOwnerDashboardContent(...args: Parameters<typeof useGymOwnerDashboardContentPresentation>): React.JSX.Element {
  return <GymOwnerDashboardContentView model={useGymOwnerDashboardContentPresentation(...args)} />;
}

export function useOwnerProfileMenuPresentation({
  visible,
  owner,
  logout,
  onClose,
  navigation,
}: {
  visible: boolean;
  owner: any;
  logout: any;
  onClose: () => void;
  navigation: any;
  styles: any;
}) {
  const go = (route: string, params?: object) => {
    onClose();
    navigation.navigate(route, params);
  };
  return { kind: "view1" as const, props: { visible, onClose, ownerProfileStyles, owner, ProfileMenuItem, go, logout } };
}

function OwnerProfileMenu(...args: Parameters<typeof useOwnerProfileMenuPresentation>): React.JSX.Element {
  return <OwnerProfileMenuView model={useOwnerProfileMenuPresentation(...args)} />;
}
export function useProfileMenuItemPresentation({
  icon,
  label,
  onPress,
  danger = false,
  disabled = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  danger?: boolean;
  disabled?: boolean;
}) {
  return { kind: "view1" as const, props: { disabled, onPress, ownerProfileStyles, icon, danger, label } };
}

function ProfileMenuItem(...args: Parameters<typeof useProfileMenuItemPresentation>): React.JSX.Element {
  return <ProfileMenuItemView model={useProfileMenuItemPresentation(...args)} />;
}



function buildLastSevenDayCounts(items: any[], field: string) {
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    return date.toISOString().slice(0, 10);
  });
  return days.map(
    (day) =>
      items.filter((item) => String(item[field] ?? "").slice(0, 10) === day)
        .length,
  );
}

function buildLastDayCounts(items: any[], field: string, days: number) {
  const dates = Array.from({ length: days }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (days - 1 - index));
    return date.toISOString().slice(0, 10);
  });
  return dates.map((day) => items.filter((item) => String(item[field] ?? "").slice(0, 10) === day).length);
}

function buildLastFiveWeekRevenue(payments: any[]) {
  const now = Date.now();
  return Array.from({ length: 5 }, (_, index) => {
    const end = now - (4 - index) * 7 * 86400000;
    const start = end - 7 * 86400000;
    return payments
      .filter((payment) => {
        const time = new Date(payment.paid_at ?? 0).getTime();
        return time >= start && time < end;
      })
      .reduce((sum, payment) => sum + Number(payment.amount_cents ?? 0), 0);
  });
}

export function useOwnerMetricPresentation({ icon, label, value, trend, tone, styles }: any) {
  return { kind: "view1" as const, props: { styles, tone, icon, label, value, trend } };
}

function OwnerMetric(...args: Parameters<typeof useOwnerMetricPresentation>): React.JSX.Element {
  return <OwnerMetricView model={useOwnerMetricPresentation(...args)} />;
}
export function useDistributionRowPresentation({ label, value, color, styles }: any) {
  return { kind: "view1" as const, props: { styles, color, label, value } };
}

function DistributionRow(...args: Parameters<typeof useDistributionRowPresentation>): React.JSX.Element {
  return <DistributionRowView model={useDistributionRowPresentation(...args)} />;
}
export function useSimpleChartPresentation({
  styles,
  values = ownerChartValues,
  secondaryValues = ownerAttendanceValues,
}: any) {
  const [range, setRange] = useState(7);
  const [open, setOpen] = useState(false);
  const rangeValues = buildLastDayCounts(ownerChartMembers, "joined_at", range);
  const rangeCheckins = buildLastDayCounts(ownerChartAttendance, "check_in_at", range);
  const chartValues = range === 7 && values.length ? values : rangeValues;
  const chartSecondaryValues = range === 7 && secondaryValues.length ? secondaryValues : rangeCheckins;
  const max = Math.max(1, ...chartValues, ...chartSecondaryValues);
  return { kind: "view1" as const, props: { styles, setOpen, range, open, setRange, chartValues, max, chartSecondaryValues } };
}

function SimpleChart(...args: Parameters<typeof useSimpleChartPresentation>): React.JSX.Element {
  return <SimpleChartView model={useSimpleChartPresentation(...args)} />;
}
export function useStatusPanelPresentation({ styles, active, statusCounts }: any) {
  return { kind: "view1" as const, props: { styles, active, DistributionRow, statusCounts } };
}

function StatusPanel(...args: Parameters<typeof useStatusPanelPresentation>): React.JSX.Element {
  return <StatusPanelView model={useStatusPanelPresentation(...args)} />;
}
export function usePlansPanelPresentation({ styles, plans, planCounts }: any) {
  const rows = plans.length
    ? plans.slice(0, 4)
    : Object.entries(planCounts)
        .slice(0, 4)
        .map(([name, count]) => ({ name, count }));
  return { kind: "view1" as const, props: { styles, rows, planCounts } };
}

function PlansPanel(...args: Parameters<typeof usePlansPanelPresentation>): React.JSX.Element {
  return <PlansPanelView model={usePlansPanelPresentation(...args)} />;
}
export function useRevenuePanelPresentation({ styles, revenue, values = [] }: any) {
  const max = Math.max(1, ...values);
  return { kind: "view1" as const, props: { styles, revenue, values, max } };
}

function RevenuePanel(...args: Parameters<typeof useRevenuePanelPresentation>): React.JSX.Element {
  return <RevenuePanelView model={useRevenuePanelPresentation(...args)} />;
}
export function useRecentMembersPanelPresentation({ styles, members }: any) {
  return { kind: "view1" as const, props: { styles, members } };
}

function RecentMembersPanel(...args: Parameters<typeof useRecentMembersPanelPresentation>): React.JSX.Element {
  return <RecentMembersPanelView model={useRecentMembersPanelPresentation(...args)} />;
}

function roleTone(role: ManagedUserRole) {
  if (role === "trainer") {
    return "info" as const;
  }
  if (role === "receptionist") {
    return "warning" as const;
  }
  if (role === "sub_admin") {
    return "success" as const;
  }
  return "neutral" as const;
}

function getDashboardCopy(role?: string) {
  if (role === "trainer") {
    return {
      headerTitle: "Trainer Dashboard",
      headerIcon: "barbell-outline" as const,
      kicker: "Coaching focus",
      title: "Plan sessions around your members",
      body: "Workouts, assigned members, attendance signals, and nutrition context stay close to the coaching flow.",
      priorities: ["Coaching", "Programs", "Progress"],
    };
  }

  if (role === "receptionist") {
    return {
      headerTitle: "Reception Dashboard",
      headerIcon: "headset-outline" as const,
      kicker: "Front desk",
      title: "Move check-ins and dues quickly",
      body: "Attendance, payments, member lookup, and daily service moments are prioritized for the desk.",
      priorities: ["Check-ins", "Payments", "Members"],
    };
  }

  if (role === "sub_admin") {
    return {
      headerTitle: "Sub Admin Dashboard",
      headerIcon: "shield-checkmark-outline" as const,
      kicker: "Delegated administration",
      title: "Manage gym workflows",
      body: "Members, staff, payments, plans, and reporting stay organized around assigned permissions.",
      priorities: ["Members", "Reports", "Workflows"],
    };
  }

  return {
    headerTitle: "Gym Owner Dashboard",
    headerIcon: "speedometer-outline" as const,
    kicker: "Owner view",
    title: "Run the gym from one operating view",
    body: "Members, attendance, payments, plans, staff, and reports stay in your tenant scope.",
    priorities: ["Revenue", "Members", "Staff"],
  };
}





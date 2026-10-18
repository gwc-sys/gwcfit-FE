import { createStyles, LIGHT_UI, DARK_UI } from "./MemberDashboardScreen.styles";
import type * as React from "react";
import { PanelView, StatTileView, QuickActionTileView, StatusPillView, ScheduleRowView, ProgressCircleView, DashboardStateView, MemberDashboardScreenView } from "./MemberDashboardScreen.presentation";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { createContext, useContext, useEffect, useMemo, useRef } from "react";
import type { ReactNode } from "react";
import {
  Image,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  ViewStyle
} from "react-native";
import Svg, { Circle } from "react-native-svg";

import { images } from "../../assets/images";
import { Screen } from "../../components/Screen";
import {
  useMemberActivity,
  useMemberAttendance,
  useMemberClasses,
  useMemberDashboard,
  useMemberGoals,
  useMemberNotifications,
  useMemberProgress,
  useMemberRewards,
  useMemberWorkouts
} from "../../hooks/useMember";
import { memberApi } from "../../services/api/member";
import { getApiErrorMessage } from "../../services/api/client";
import { useAuthStore } from "../../store/useAuthStore";
import { useAppTheme } from "../../theme/AppThemeProvider";
import type { MemberAttendance, MemberClass, MemberProgressLog, MemberWorkout } from "../../types/member";
import { formatDate } from "../../utils/formatters";

type IconName = keyof typeof Ionicons.glyphMap;

type MemberRoute =
  | "MemberHome"
  | "MemberProfileHome"
  | "MemberMembership"
  | "MemberPayments"
  | "MemberAttendance"
  | "MemberWorkout"
  | "MemberMealPlan"
  | "MemberProgress"
  | "MemberTrainer"
  | "MemberClasses"
  | "MemberNotifications"
  | "MemberGoals"
  | "MemberRewards"
  | "MemberSupport"
  | "MemberSettings";

type StatTileConfig = {
  icon: IconName;
  color: string;
  softColor: string;
  value: string;
  label: string;
  subtitle: string;
  trend?: string;
  trendDirection?: "up" | "down";
};

type ActionConfig = {
  title: string;
  subtitle: string;
  icon: IconName;
  route: MemberRoute;
  color: string;
  softColor: string;
};

const MOBILE_STAT_CARD_WIDTH = 176;
const MOBILE_STAT_CARD_GAP = 12;
const MOBILE_STAT_SNAP_INTERVAL = MOBILE_STAT_CARD_WIDTH + MOBILE_STAT_CARD_GAP;

type ScheduleItem = {
  time: string;
  title: string;
  subtitle: string;
  icon: IconName;
  color: string;
  softColor: string;
  status: string;
  done?: boolean;
};

type WorkoutPreview = {
  title: string;
  subtitle: string;
  date: string;
  image: number;
};

type AchievementPreview = {
  title: string;
  subtitle: string;
  date: string;
  icon: IconName;
  color: string;
  softColor: string;
};

type DashboardPalette = {
  background: string;
  surface: string;
  panel: string;
  border: string;
  borderStrong: string;
  text: string;
  muted: string;
  subtle: string;
  navLabel: string;
  primary: string;
  primaryDark: string;
  onPrimary: string;
  success: string;
  danger: string;
  warning: string;
  cyan: string;
  blue: string;
  pink: string;
  softPurple: string;
  softGreen: string;
  softBlue: string;
  softPink: string;
  softOrange: string;
  softCyan: string;
  premiumBackground: string;
  premiumTitle: string;
  scheduleTime: string;
  upcomingPill: string;
  upcomingPillText: string;
  ringTrack: string;
  progressTrack: string;
  calorieTrack: string;
  shadowColor: string;
};





type DashboardThemeValue = {
  ui: DashboardPalette;
  styles: ReturnType<typeof createStyles>;
};

const DashboardThemeContext = createContext<DashboardThemeValue | null>(null);

function useDashboardTheme() {
  const value = useContext(DashboardThemeContext);

  if (!value) {
    throw new Error("Dashboard theme context is missing");
  }

  return value;
}

function createQuickActions(ui: DashboardPalette): ActionConfig[] {
  return [
    {
      title: "Start Workout",
      subtitle: "Begin your training",
      icon: "barbell-outline",
      route: "MemberWorkout",
      color: ui.primary,
      softColor: ui.softPurple
    },
    {
      title: "Meal Plan",
      subtitle: "View today's meals",
      icon: "restaurant-outline",
      route: "MemberMealPlan",
      color: ui.success,
      softColor: ui.softGreen
    },
    {
      title: "Log Progress",
      subtitle: "Track your progress",
      icon: "stats-chart-outline",
      route: "MemberProgress",
      color: ui.blue,
      softColor: ui.softBlue
    },
    {
      title: "Record Measurement",
      subtitle: "Update your stats",
      icon: "create-outline",
      route: "MemberProgress",
      color: ui.cyan,
      softColor: ui.softCyan
    },
    {
      title: "Book Session",
      subtitle: "Schedule appointment",
      icon: "calendar-outline",
      route: "MemberClasses",
      color: ui.pink,
      softColor: ui.softPink
    },
    {
      title: "Ask AI Coach",
      subtitle: "Get AI-powered guidance",
      icon: "sparkles-outline",
      route: "MemberSupport",
      color: ui.warning,
      softColor: ui.softOrange
    }
  ];
}

const workoutImages = [images.strengthCategory, images.groupTraining, images.high56];

function clamp(value: number, min = 0, max = 100) {
  return Math.min(Math.max(value, min), max);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function compactTime(value?: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function monthKey(value: Date) {
  return `${value.getFullYear()}-${value.getMonth()}`;
}

function getMonthlyCalories(logs: MemberProgressLog[]) {
  const currentMonth = monthKey(new Date());

  return logs.reduce((total, log) => {
    const loggedAt = new Date(log.logged_at);
    if (Number.isNaN(loggedAt.getTime()) || monthKey(loggedAt) !== currentMonth) {
      return total;
    }

    return total + Math.round(log.calories_burned ?? 0);
  }, 0);
}

function latestWeight(logs: MemberProgressLog[]) {
  return logs.find((log) => typeof log.weight === "number")?.weight ?? null;
}

function latestGoalProgress(logs: MemberProgressLog[]) {
  return logs.find((log) => typeof log.goal_progress_percentage === "number")?.goal_progress_percentage ?? null;
}

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function getActiveDays(history: MemberAttendance[] = []) {
  const seen = new Set<string>();
  const currentMonth = monthKey(new Date());

  history.forEach((item) => {
    const checkedInAt = new Date(item.check_in_at);
    if (!Number.isNaN(checkedInAt.getTime()) && monthKey(checkedInAt) === currentMonth) {
      seen.add(startOfDay(checkedInAt).toISOString());
    }
  });

  return seen.size;
}

function workoutSubtitle(workout?: MemberWorkout | null) {
  if (!workout) {
    return "Workout plan";
  }

  const parts = [workout.goal, workout.level].filter(Boolean);
  return parts.length ? parts.join(" - ") : "Personal training plan";
}

function buildWorkoutPreviews(workouts: MemberWorkout[]): WorkoutPreview[] {
  const source = workouts.slice(0, 3).map((workout) => ({
        title: workout.workout_plan_name,
        subtitle: workoutSubtitle(workout),
        date: workout.starts_at ? `${formatDate(workout.starts_at)} - ${compactTime(workout.starts_at) ?? "Time not set"}` : "Schedule not set"
      }));

  return source.map((item, index) => ({
    ...item,
    image: workoutImages[index % workoutImages.length]
  }));
}

function buildAchievementPreviews(rewards: { title: string; description?: string | null; points?: number; status?: string }[], ui: DashboardPalette): AchievementPreview[] {
  const palette = [
    { icon: "shield-checkmark-outline" as const, color: ui.success, softColor: ui.softGreen },
    { icon: "trophy-outline" as const, color: ui.primary, softColor: ui.softPurple },
    { icon: "flame-outline" as const, color: ui.warning, softColor: ui.softOrange }
  ];

  return rewards.slice(0, 3).map((reward, index) => ({
    title: reward.title,
    subtitle: reward.description ?? `${reward.points ?? 0} reward points`,
    date: reward.status ?? "Unlocked",
    ...palette[index % palette.length]
  }));
}

export function usePanelPresentation({
  title,
  action,
  onAction,
  children,
  style
}: {
  title: string;
  action?: string;
  onAction?: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { styles } = useDashboardTheme();

  return { kind: "view1" as const, props: { styles, style, title, action, onAction, children } };
}

function Panel(...args: Parameters<typeof usePanelPresentation>): React.JSX.Element {
  return <PanelView model={usePanelPresentation(...args)} />;
}

export function useStatTilePresentation({ icon, color, softColor, value, label, subtitle, trend, trendDirection = "up" }: StatTileConfig) {
  const { ui, styles } = useDashboardTheme();
  const isDown = trendDirection === "down";

  return { kind: "view1" as const, props: { styles, softColor, icon, color, value, label, subtitle, trend, isDown, ui } };
}

function StatTile(...args: Parameters<typeof useStatTilePresentation>): React.JSX.Element {
  return <StatTileView model={useStatTilePresentation(...args)} />;
}

export function useQuickActionTilePresentation({ action, onPress }: { action: ActionConfig; onPress: () => void }) {
  const { ui, styles } = useDashboardTheme();

  return { kind: "view1" as const, props: { onPress, styles, action, ui } };
}

function QuickActionTile(...args: Parameters<typeof useQuickActionTilePresentation>): React.JSX.Element {
  return <QuickActionTileView model={useQuickActionTilePresentation(...args)} />;
}

export function useStatusPillPresentation({ label, done }: { label: string; done?: boolean }) {
  const { ui, styles } = useDashboardTheme();

  return { kind: "view1" as const, props: { styles, done, label, ui } };
}

function StatusPill(...args: Parameters<typeof useStatusPillPresentation>): React.JSX.Element {
  return <StatusPillView model={useStatusPillPresentation(...args)} />;
}

export function useScheduleRowPresentation({ item, isLast }: { item: ScheduleItem; isLast: boolean }) {
  const { styles } = useDashboardTheme();

  return { kind: "view1" as const, props: { styles, item, isLast, StatusPill } };
}

function ScheduleRow(...args: Parameters<typeof useScheduleRowPresentation>): React.JSX.Element {
  return <ScheduleRowView model={useScheduleRowPresentation(...args)} />;
}

export function useProgressCirclePresentation({ progress }: { progress: number }) {
  const { ui, styles } = useDashboardTheme();
  const size = 128;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamp(progress) / 100) * circumference;

  return { kind: "view1" as const, props: { styles, size, radius, ui, strokeWidth, circumference, offset, progress } };
}

function ProgressCircle(...args: Parameters<typeof useProgressCirclePresentation>): React.JSX.Element {
  return <ProgressCircleView model={useProgressCirclePresentation(...args)} />;
}

export function useDashboardStatePresentation({
  title,
  message,
  icon,
  onRetry
}: {
  title: string;
  message: string;
  icon: IconName;
  onRetry?: () => void;
}) {
  const { ui, styles } = useDashboardTheme();

  return { kind: "view1" as const, props: { styles, icon, ui, title, message, onRetry } };
}

function DashboardState(...args: Parameters<typeof useDashboardStatePresentation>): React.JSX.Element {
  return <DashboardStateView model={useDashboardStatePresentation(...args)} />;
}

export function useMemberDashboardScreenPresentation() {
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();
  const { isDark } = useAppTheme();
  const user = useAuthStore((state) => state.user);
  const statsScrollRef = useRef<ScrollView>(null);
  const activeStatIndexRef = useRef(0);
  const dashboardQuery = useMemberDashboard();
  const activityQuery = useMemberActivity();
  const attendanceQuery = useMemberAttendance();
  const workoutsQuery = useMemberWorkouts();
  const progressQuery = useMemberProgress();
  const classesQuery = useMemberClasses();
  const rewardsQuery = useMemberRewards();
  const goalsQuery = useMemberGoals();
  const notificationsQuery = useMemberNotifications(true);

  const dashboard = dashboardQuery.data;
  const attendance = attendanceQuery.data;
  const workouts = workoutsQuery.data ?? [];
  const progressLogs = progressQuery.data ?? [];
  const classes = classesQuery.data ?? [];
  const rewards = rewardsQuery.data ?? [];
  const goals = goalsQuery.data ?? [];
  const unreadNotifications = notificationsQuery.data ?? [];

  const ui = useMemo(() => (isDark ? DARK_UI : LIGHT_UI), [isDark]);
  const styles = useMemo(() => createStyles(ui), [ui]);
  const dashboardTheme = useMemo(() => ({ ui, styles }), [ui, styles]);
  const quickActions = useMemo(() => createQuickActions(ui), [ui]);
  const isDesktop = width >= 1180;
  const isTablet = width >= 760;
  const isNarrow = width < 520;
  const memberName = dashboard?.member_name ?? user?.full_name ?? "Member";
  const latestLoggedWeight = latestWeight(progressLogs);
  const monthlyCalories = getMonthlyCalories(progressLogs);
  const completedWorkouts = workouts.reduce((total, workout) => total + Math.round(workout.completed_workouts ?? 0), 0);
  const missedWorkouts = workouts.reduce((total, workout) => total + Math.round(workout.missed_workouts ?? 0), 0);
  const workoutsTarget = completedWorkouts + missedWorkouts;
  const visitsThisMonth = attendance?.monthly_attendance_count ?? 0;
  const activeDays = getActiveDays(attendance?.history ?? []);
  const goalProgress = clamp(Math.round(dashboard?.fitness_goal_progress ?? latestGoalProgress(progressLogs) ?? 0));
  const caloriesTarget = activityQuery.data?.today.calories_target ?? goals.find((goal) => goal.status === "active" && (goal.calories_goal ?? 0) > 0)?.calories_goal ?? 0;
  const todayCalories = activityQuery.data?.today.calories_completed ?? 0;
  const activityLoading = activityQuery.isLoading;
  const activityUnavailable = Boolean(activityQuery.error);
  useEffect(() => {
    if (Platform.OS !== "web" || !activityQuery.isSuccess || !user?.id) return;
    const now = new Date();
    const activity_date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    void memberApi.syncActivity({ activity_date, utc_offset_minutes: -now.getTimezoneOffset(), device_id: "web-dashboard", source: "dashboard" }).catch(() => {});
  }, [todayCalories, caloriesTarget, activityQuery.isSuccess, user?.id, activityQuery.data?.today.activity_date]);

  const caloriesProgress = caloriesTarget > 0 ? clamp(Math.round((monthlyCalories / caloriesTarget) * 100)) : 0;
  const achievements = buildAchievementPreviews(rewards, ui);
  const upcomingWorkouts = buildWorkoutPreviews(workouts);
  const todayWorkout = dashboard?.today_workout_plan ?? workouts[0] ?? null;
  const todayMeal = dashboard?.today_meal_plan;
  const upcomingClass: MemberClass | null = dashboard?.upcoming_class ?? classes[0] ?? null;
  const isRefreshing =
    dashboardQuery.isRefetching ||
    attendanceQuery.isRefetching ||
    workoutsQuery.isRefetching ||
    progressQuery.isRefetching ||
    classesQuery.isRefetching ||
    rewardsQuery.isRefetching ||
    goalsQuery.isRefetching ||
    notificationsQuery.isRefetching;

  const refreshAll = () => {
    dashboardQuery.refetch();
    activityQuery.refetch();
    attendanceQuery.refetch();
    workoutsQuery.refetch();
    progressQuery.refetch();
    classesQuery.refetch();
    rewardsQuery.refetch();
    goalsQuery.refetch();
    notificationsQuery.refetch();
  };

  const navigateTo = (route?: MemberRoute) => {
    if (route) {
      navigation.navigate(route);
    }
  };

  const statTiles: StatTileConfig[] = [
    {
      icon: "barbell-outline",
      color: ui.primary,
      softColor: ui.softPurple,
      value: String(completedWorkouts),
      label: "Workouts",
      subtitle: "This Month",
    },
    {
      icon: "pulse-outline",
      color: ui.success,
      softColor: ui.softGreen,
      value: String(visitsThisMonth),
      label: "Check-ins",
      subtitle: "This Month",
    },
    {
      icon: "flame-outline",
      color: ui.warning,
      softColor: ui.softOrange,
      value: formatNumber(monthlyCalories),
      label: "Calories Burned",
      subtitle: "This Month"
    },
    {
      icon: "scale-outline",
      color: ui.blue,
      softColor: ui.softBlue,
      value: latestLoggedWeight === null ? "--" : Number(latestLoggedWeight).toFixed(1),
      label: "Weight (kg)",
      subtitle: "Current",
    },
    {
      icon: "trophy-outline",
      color: ui.pink,
      softColor: ui.softPink,
      value: String(rewards.length),
      label: "Achievements",
      subtitle: "Unlocked",
    },
    {
      icon: "time-outline",
      color: ui.success,
      softColor: ui.softGreen,
      value: String(activeDays),
      label: "Active Days",
      subtitle: "This Month",
    }
  ];

  useEffect(() => {
    if (isTablet) {
      activeStatIndexRef.current = 0;
      return;
    }

    const timer = setInterval(() => {
      const nextIndex = (activeStatIndexRef.current + 1) % statTiles.length;
      activeStatIndexRef.current = nextIndex;
      statsScrollRef.current?.scrollTo({
        x: nextIndex * MOBILE_STAT_SNAP_INTERVAL,
        animated: true
      });
    }, 2_000);

    return () => clearInterval(timer);
  }, [isTablet, statTiles.length]);

  const workoutDone = todayWorkout?.completion_status === "completed" || dashboard?.today_attendance_status === "checked_in";
  const scheduleItems: ScheduleItem[] = [
    todayWorkout ? {
      time: compactTime(todayWorkout.starts_at) ?? "Time not set",
      title: todayWorkout.workout_plan_name,
      subtitle: "Workout",
      icon: "barbell-outline",
      color: ui.primary,
      softColor: ui.softPurple,
      status: workoutDone ? "Completed" : "Upcoming",
      done: workoutDone
    } : null,
    todayMeal ? {
      time: compactTime(todayMeal.starts_at) ?? "Time not set",
      title: todayMeal.meal_plan_name,
      subtitle: "Meal plan",
      icon: "restaurant-outline",
      color: ui.success,
      softColor: ui.softGreen,
      status: "Upcoming"
    } : null,
    upcomingClass ? {
      time: upcomingClass.time ?? "Time not set",
      title: upcomingClass.class_name,
      subtitle: upcomingClass.class_type,
      icon: "walk-outline",
      color: ui.warning,
      softColor: ui.softOrange,
      status: "Upcoming"
    } : null
  ].filter((item): item is ScheduleItem => item !== null);

  return { kind: "view1" as const, props: { dailyActivity: activityQuery.data?.today, todayCalories, activityLoading, activityUnavailable, DashboardThemeContext, dashboardTheme, styles, isRefreshing, refreshAll, ui, isDesktop, memberName, navigateTo, unreadNotifications, isNarrow, dashboardQuery, DashboardState, dashboard, isTablet, statTiles, StatTile, statsScrollRef, MOBILE_STAT_SNAP_INTERVAL, activeStatIndexRef, Panel, quickActions, QuickActionTile, scheduleItems, ScheduleRow, ProgressCircle, goalProgress, completedWorkouts, workoutsTarget, clamp, caloriesTarget, formatNumber, monthlyCalories, caloriesProgress, upcomingWorkouts, achievements } };
}

export function MemberDashboardScreen(...args: Parameters<typeof useMemberDashboardScreenPresentation>): React.JSX.Element {
  return <MemberDashboardScreenView model={useMemberDashboardScreenPresentation(...args)} />;
}







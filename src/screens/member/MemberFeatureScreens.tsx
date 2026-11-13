import { MemberMoveScreen } from "../../components/member/MemberMoveScreen";
import type * as React from "react";
import { QueryRefreshView, QueryStateView, ListSectionView, DetailGridView, SectionTitleView, MemberMembershipScreenView, MemberAttendanceScreenView, MemberWorkoutScreenView, MemberMealPlanScreenView, MemberProgressScreenView, MemberTrainerScreenView, MemberClassesScreenView, MemberNotificationsScreenView, MemberGoalsScreenView, MemberRewardsScreenView, MemberSupportScreenView, MemberSettingsScreenView } from "./MemberFeatureScreens.presentation";
import { createFeatureStyles } from "./MemberFeatureScreens.styles";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { FlatList, RefreshControl, StyleSheet, Switch, Text, View } from "react-native";
import { useEffect, useMemo, useState } from "react";
import type { ReactElement, ReactNode } from "react";

import { FormTextField } from "../../components/FormTextField";
import { NoticeBanner } from "../../components/NoticeBanner";
import { PrimaryButton } from "../../components/PrimaryButton";
import {
  ClassBookingCard,
  EmptyState,
  ErrorState,
  GoalProgressCard,
  LoadingSkeleton,
  MemberQuickActionCard,
  MemberStatCard,
  NotificationItem,
  PaymentHistoryCard,
  RewardBadge,
  ScrollListCard,
  StatusBadge
} from "../../components/member";
import { Screen } from "../../components/Screen";
import { ScreenHeader } from "../../components/ScreenHeader";
import { useChangePassword, useLogout } from "../../hooks/useAuthActions";
import {
  useBookClass,
  useCancelClass,
  useCheckInMember,
  useCheckOutMember,
  useCompleteMeal,
  useCreateMemberMealPlan,
  useCompleteWorkout,
  useCreateGoal,
  useCreateProgressLog,
  useDeleteProgressLog,
  useCreateSupportTicket,
  useClearAllNotifications,
  useDismissNotification,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useMemberAttendance,
  useMemberClasses,
  useMemberDashboard,
  useMemberGoals,
  useMemberMeals,
  useMemberMembership,
  useMemberNotifications,
  useMemberPayments,
  useMemberProfile,
  useMemberProgress,
  useMemberRewards,
  useMemberGamification,
  useRedeemMemberPerk,
  useMemberActivity,
  useMemberTrainer,
  useTrainerFeedback,
  useSaveTrainerFeedback,
  useGymFeedback,
  useSaveGymFeedback,
  useMemberWorkouts,
  useUpdateGoal,
  useUpdateMemberProfile
} from "../../hooks/useMember";
import { useAuthStore } from "../../store/useAuthStore";
import { getApiErrorMessage } from "../../services/api/client";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { colors, radius, spacing, typography } from "../../theme/theme";
import type {
  MemberAttendance,
  MemberClass,
  MemberGoal,
  MemberMealPlan,
  MemberMealPlanCreate,
  MemberNotification,
  MemberPayment,
  MemberProgressLog,
  MemberReward,
  MemberWorkout
} from "../../types/member";
import { requestLogoutConfirmation } from "../../utils/logoutConfirmation";
import { formatCurrency, formatDate, formatDateTime, memberStatusTone } from "../../utils/formatters";
import { changePasswordSchema } from "../../validation/auth";

type Tone = "success" | "warning" | "danger" | "info" | "neutral";

type QueryStateProps<T> = {
  loading: boolean;
  error: unknown;
  empty: boolean;
  emptyTitle: string;
  emptyMessage: string;
  data?: T;
  onRetry: () => void;
  children: (data: T) => ReactElement;
};

function toneForStatus(status?: string | null): Tone {
  const normalized = (status ?? "").toLowerCase();
  if (normalized.includes("paid") || normalized.includes("active") || normalized.includes("complete") || normalized.includes("booked")) {
    return "success";
  }
  if (normalized.includes("pending") || normalized.includes("wait") || normalized.includes("due")) {
    return "warning";
  }
  if (normalized.includes("fail") || normalized.includes("expired") || normalized.includes("overdue")) {
    return "danger";
  }
  if (normalized.includes("read") || normalized.includes("open")) {
    return "info";
  }
  return "neutral";
}

function displayValue(value: unknown, fallback = "Not set"): string {
  if (typeof value === "string" && value.trim()) {
    return value;
  }
  if (typeof value === "number") {
    return String(value);
  }
  if (Array.isArray(value)) {
    const values: string[] = value.map((item) => displayValue(item, "")).filter(Boolean);
    return values.length ? values.join(", ") : fallback;
  }
  return fallback;
}

function mealSummary(meal: MemberMealPlan): string {
  const foods = meal.meals
    .map((item) => displayValue(item.food_name ?? item.name ?? item.meal_name ?? item.title ?? item.food, ""))
    .filter(Boolean);
  return foods.length ? foods.join(" • ") : meal.trainer_notes ?? displayValue(meal.today_meal_plan?.title ?? meal.today_meal_plan?.name, "No foods listed");
}

function mealDetails(meal: MemberMealPlan): string {
  const details = meal.meals.map((item) => {
    const food = displayValue(item.food_name ?? item.name ?? item.meal_name ?? item.title ?? item.food, "");
    const serving = displayValue(item.quantity ?? item.serving_size ?? item.portion, "");
    const macros = [
      typeof item.calories === "number" ? `${item.calories} kcal` : "",
      typeof item.protein === "number" ? `${item.protein}g protein` : "",
      typeof item.carbs === "number" ? `${item.carbs}g carbs` : "",
      typeof item.fat === "number" ? `${item.fat}g fat` : "",
    ].filter(Boolean).join(" · ");
    return [food, serving, macros].filter(Boolean).join(" · ");
  }).filter(Boolean);
  return details.length ? details.join("\n") : mealSummary(meal);
}

export function useQueryRefreshPresentation(refreshing: boolean, onRefresh: () => void) {
  return { kind: "view1" as const, props: { refreshing, onRefresh } };
}

function queryRefresh(refreshing: boolean, onRefresh: () => void) {
  return <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />;
}

export function useQueryStatePresentation<T>({ loading, error, empty, emptyTitle, emptyMessage, data, onRetry, children }: QueryStateProps<T>) {
  if (loading) {
    return { kind: "view1" as const, props: {} };
  }

  if (error) {
    return { kind: "view2" as const, props: { error, onRetry } };
  }

  if (empty || data === undefined || data === null) {
    return { kind: "view3" as const, props: { emptyTitle, emptyMessage } };
  }

  return children(data);
}

function QueryState<T>(...args: Parameters<typeof useQueryStatePresentation<T>>): React.JSX.Element {
  return <QueryStateView<T> model={useQueryStatePresentation<T>(...args)} />;
}

export function useListSectionPresentation<T extends object>({
  data,
  renderItem,
  keyExtractor
}: {
  data: T[];
  renderItem: (item: T) => ReactElement;
  keyExtractor: (item: T, index: number) => string;
}) {
  const { colors: featureColors } = useAppTheme();
  const styles = useMemo(() => createFeatureStyles(featureColors), [featureColors]);

  return { kind: "view1" as const, props: { data, keyExtractor, renderItem, styles } };
}

function ListSection<T extends object>(...args: Parameters<typeof useListSectionPresentation<T>>): React.JSX.Element {
  return <ListSectionView<T> model={useListSectionPresentation<T>(...args)} />;
}

export function useDetailGridPresentation({ children }: { children: ReactNode }) {
  const { colors: featureColors } = useAppTheme();
  const styles = useMemo(() => createFeatureStyles(featureColors), [featureColors]);

  return { kind: "view1" as const, props: { styles, children } };
}

function DetailGrid(...args: Parameters<typeof useDetailGridPresentation>): React.JSX.Element {
  return <DetailGridView model={useDetailGridPresentation(...args)} />;
}

export function useSectionTitlePresentation({ title }: { title: string }) {
  const { colors: featureColors } = useAppTheme();
  const styles = useMemo(() => createFeatureStyles(featureColors), [featureColors]);

  return { kind: "view1" as const, props: { styles, title } };
}

function SectionTitle(...args: Parameters<typeof useSectionTitlePresentation>): React.JSX.Element {
  return <SectionTitleView model={useSectionTitlePresentation(...args)} />;
}

export function useMemberMembershipScreenPresentation() {
  const { colors: featureColors } = useAppTheme();
  const styles = useMemo(() => createFeatureStyles(featureColors), [featureColors]);

  const query = useMemberMembership();

  return { kind: "view1" as const, props: { styles, queryRefresh, query, QueryState, DetailGrid, SectionTitle, ListSection, toneForStatus } };
}

export function MemberMembershipScreen(...args: Parameters<typeof useMemberMembershipScreenPresentation>): React.JSX.Element {
  return <MemberMembershipScreenView model={useMemberMembershipScreenPresentation(...args)} />;
}

export function useMemberAttendanceScreenPresentation() {
  const navigation = useNavigation<any>();
  const user = useAuthStore((state) => state.user);
  const { colors: featureColors } = useAppTheme();
  const styles = useMemo(() => createFeatureStyles(featureColors), [featureColors]);

  const query = useMemberAttendance();
  const profileQuery = useMemberProfile();
  const membershipQuery = useMemberMembership();
  const notificationsQuery = useMemberNotifications(true);
  const checkIn = useCheckInMember();
  const checkOut = useCheckOutMember();

  return { kind: "view1" as const, props: { styles, queryRefresh, query, data: query.data, profile: profileQuery.data, membership: membershipQuery.data, unreadNotifications: notificationsQuery.data ?? [], user, navigation, QueryState, DetailGrid, checkIn, checkOut, SectionTitle, ListSection, toneForStatus } };
}

export function MemberAttendanceScreen(...args: Parameters<typeof useMemberAttendanceScreenPresentation>): React.JSX.Element {
  return <MemberAttendanceScreenView model={useMemberAttendanceScreenPresentation(...args)} />;
}

export function useMemberWorkoutScreenPresentation() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const user = useAuthStore((state) => state.user);
  const { colors: featureColors } = useAppTheme();
  const styles = useMemo(() => createFeatureStyles(featureColors), [featureColors]);

  const query = useMemberWorkouts();
  const classesQuery = useMemberClasses();
  const profileQuery = useMemberProfile();
  const notificationsQuery = useMemberNotifications(true);
  const trainerQuery = useMemberTrainer();
  const bookClass = useBookClass();
  const cancelClass = useCancelClass();
  const completeWorkout = useCompleteWorkout();
  const workouts = query.data ?? [];
  const classes = classesQuery.data ?? [];

  return { kind: "view1" as const, props: { styles, queryRefresh, query, classesQuery, workouts, classes, bookClass, cancelClass, profile: profileQuery.data, unreadNotifications: notificationsQuery.data ?? [], trainer: trainerQuery.data, user, authUid: user?.id ?? null, routeParams: route?.params, navigation, QueryState, DetailGrid, ListSection, displayValue, toneForStatus, completeWorkout } };
}

export function MemberWorkoutScreen(...args: Parameters<typeof useMemberWorkoutScreenPresentation>): React.JSX.Element {
  return <MemberWorkoutScreenView model={useMemberWorkoutScreenPresentation(...args)} />;
}

export function useMemberMealPlanScreenPresentation() {
  const navigation = useNavigation<any>();
  const user = useAuthStore((state) => state.user);
  const { colors: featureColors } = useAppTheme();
  const styles = useMemo(() => createFeatureStyles(featureColors), [featureColors]);

  const query = useMemberMeals();
  const profileQuery = useMemberProfile();
  const notificationsQuery = useMemberNotifications(true);
  const completeMeal = useCompleteMeal();
  const createMeal = useCreateMemberMealPlan();
  const [waterMl, setWaterMl] = useState("500");
  const [mealPlanTitle, setMealPlanTitle] = useState("");
  const [mealPlanCalories, setMealPlanCalories] = useState("");
  const [mealPlanFoods, setMealPlanFoods] = useState("");
  const [mealPlanValidation, setMealPlanValidation] = useState<string | null>(null);
  const [expandedMealPlanId, setExpandedMealPlanId] = useState<string | null>(null);
  const [isComposerOpen, setComposerOpen] = useState(false);

  const submitMealPlan = () => {
    const title = mealPlanTitle.trim();
    const calories = Number(mealPlanCalories);
    let meals: MemberMealPlanCreate["meals"] = [];
    try {
      const parsed: unknown = JSON.parse(mealPlanFoods || "[]");
      meals = Array.isArray(parsed) ? parsed.filter((item): item is MemberMealPlanCreate["meals"][number] => Boolean(item) && typeof item === "object") : [];
    } catch {
      meals = [];
    }
    if (title.length < 2) return setMealPlanValidation("Enter a meal-plan name with at least 2 characters.");
    if (!/^\d+$/.test(mealPlanCalories) || calories < 1 || calories > 100000) return setMealPlanValidation("Enter daily calories from 1 to 100000.");
    if (!meals.length) return setMealPlanValidation("Choose at least one food for this meal plan.");
    setMealPlanValidation(null);
    createMeal.mutate({
      title,
      calories_per_day: calories,
      meals,
    }, { onSuccess: (plan) => { setMealPlanTitle(""); setMealPlanCalories(""); setMealPlanFoods(""); setComposerOpen(false); setExpandedMealPlanId(plan.meal_plan_uuid); } });
  };

  return { kind: "view1" as const, props: { styles, queryRefresh, query, profile: profileQuery.data, unreadNotifications: notificationsQuery.data ?? [], user, navigation, waterMl, setWaterMl, mealPlanTitle, setMealPlanTitle, mealPlanCalories, setMealPlanCalories, mealPlanFoods, setMealPlanFoods, mealPlanValidation, submitMealPlan, createMeal, expandedMealPlanId, setExpandedMealPlanId, isComposerOpen, setComposerOpen, QueryState, DetailGrid, ListSection, mealDetails, toneForStatus, completeMeal } };
}

export function MemberMealPlanScreen(...args: Parameters<typeof useMemberMealPlanScreenPresentation>): React.JSX.Element {
  return <MemberMealPlanScreenView model={useMemberMealPlanScreenPresentation(...args)} />;
}

export function useMemberProgressScreenPresentation() {
  const { colors: featureColors } = useAppTheme();
  const styles = useMemo(() => createFeatureStyles(featureColors), [featureColors]);

  const user = useAuthStore((s) => s.user);
  const query = useMemberProgress();
  const profileQuery = useMemberProfile();
  const goalsQuery = useMemberGoals();
  const createLog = useCreateProgressLog();
  const deleteLog = useDeleteProgressLog();
  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();
  const updateProfile = useUpdateMemberProfile();
  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [activeCalories, setActiveCalories] = useState("");
  const [progressValidation, setProgressValidation] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  const submit = () => {
    if (activeCalories && (!/^\d+$/.test(activeCalories) || Number(activeCalories) > 100000)) {
      setProgressValidation("Enter a calorie amount from 0 to 100000 kcal."); return;
    }
    setProgressValidation(null);
    createLog.mutate({
      weight: weight ? Number(weight) : null,
      body_fat_percentage: bodyFat ? Number(bodyFat) : null,
      calories_burned: activeCalories ? Number(activeCalories) : null,
      notes,
      measurements: {}
    });
  };

  return { kind: "view1" as const, props: { styles, queryRefresh, query, profileQuery, goalsQuery, createLog, deleteLog, createGoal, updateGoal, updateProfile, user, SectionTitle, weight, setWeight, bodyFat, setBodyFat, activeCalories, setActiveCalories, progressValidation, setProgressValidation, notes, setNotes, submit, QueryState, DetailGrid, ListSection } };
}

export function MemberProgressScreen(...args: Parameters<typeof useMemberProgressScreenPresentation>): React.JSX.Element {
  return <MemberProgressScreenView model={useMemberProgressScreenPresentation(...args)} />;
}

export function useMemberTrainerScreenPresentation() {
  const { colors: featureColors } = useAppTheme();
  const styles = useMemo(() => createFeatureStyles(featureColors), [featureColors]);
  const user = useAuthStore((s) => s.user);

  const query = useMemberTrainer();
  const workoutsQuery = useMemberWorkouts();
  const mealsQuery = useMemberMeals();
  const dashboardQuery = useMemberDashboard();
  const profileQuery = useMemberProfile();
  const notificationsQuery = useMemberNotifications(true);
  const attendanceQuery = useMemberAttendance();
  const feedbackQuery = useTrainerFeedback();
  const saveFeedback = useSaveTrainerFeedback();
  const [rating, setRating] = useState(5);
  const [feedbackOption, setFeedbackOption] = useState<string | null>(null);
  const [customFeedback, setCustomFeedback] = useState("");
  const navigation = useNavigation<any>();

  useEffect(() => {
    if (feedbackQuery.data) {
      setRating(feedbackQuery.data.rating);
      setFeedbackOption(feedbackQuery.data.feedback_option ?? null);
      setCustomFeedback(feedbackQuery.data.feedback_text ?? "");
    }
  }, [feedbackQuery.data]);

  const submitFeedback = () =>
    saveFeedback.mutate({
      rating,
      feedback_option: feedbackOption,
      feedback_text: customFeedback.trim() ? customFeedback.trim() : null,
    });

  return {
    kind: "view1" as const,
    props: {
      styles,
      queryRefresh,
      query,
      workoutsQuery,
      mealsQuery,
      dashboardQuery,
      profileQuery,
      notificationsQuery,
      attendanceQuery,
      user,
      feedbackQuery,
      saveFeedback,
      rating,
      setRating,
      feedbackOption,
      setFeedbackOption,
      customFeedback,
      setCustomFeedback,
      submitFeedback,
      SectionTitle,
      navigation,
    },
  };
}

export function MemberTrainerScreen(...args: Parameters<typeof useMemberTrainerScreenPresentation>): React.JSX.Element {
  return <MemberTrainerScreenView model={useMemberTrainerScreenPresentation(...args)} />;
}

export function useMemberClassesScreenPresentation() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const user = useAuthStore((state) => state.user);
  const { colors: featureColors } = useAppTheme();
  const styles = useMemo(() => createFeatureStyles(featureColors), [featureColors]);

  const query = useMemberClasses();
  const workoutsQuery = useMemberWorkouts();
  const profileQuery = useMemberProfile();
  const notificationsQuery = useMemberNotifications(true);
  const trainerQuery = useMemberTrainer();
  const completeWorkout = useCompleteWorkout();
  const bookClass = useBookClass();
  const cancelClass = useCancelClass();
  const workouts = workoutsQuery.data ?? [];
  const classes = query.data ?? [];
  const upcomingWorkouts = workouts.filter((workout) => workout.completion_status !== "completed");
  const completedWorkouts = workouts.filter((workout) => workout.completion_status === "completed");

  return { kind: "view1" as const, props: { styles, queryRefresh, query, classesQuery: query, workoutsQuery, workouts, classes, upcomingWorkouts, completedWorkouts, profile: profileQuery.data, unreadNotifications: notificationsQuery.data ?? [], trainer: trainerQuery.data, user, authUid: user?.id ?? null, routeParams: route?.params, navigation, QueryState, SectionTitle, ListSection, toneForStatus, cancelClass, bookClass, completeWorkout } };
}

export function MemberClassesScreen(...args: Parameters<typeof useMemberClassesScreenPresentation>): React.JSX.Element {
  return <MemberClassesScreenView model={useMemberClassesScreenPresentation(...args)} />;
}

export function useMemberNotificationsScreenPresentation() {
  const { colors: featureColors } = useAppTheme();
  const styles = useMemo(() => createFeatureStyles(featureColors), [featureColors]);

  const [unreadOnly, setUnreadOnly] = useState(false);
  const query = useMemberNotifications(false);
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const dismissNotification = useDismissNotification();
  const clearAll = useClearAllNotifications();

  return { kind: "view1" as const, props: { styles, queryRefresh, query, unreadOnly, setUnreadOnly, QueryState, ListSection, markRead, markAllRead, dismissNotification, clearAll } };
}

export function MemberNotificationsScreen(...args: Parameters<typeof useMemberNotificationsScreenPresentation>): React.JSX.Element {
  return <MemberNotificationsScreenView model={useMemberNotificationsScreenPresentation(...args)} />;
}

export function useMemberGoalsScreenPresentation() {
  const { colors: featureColors } = useAppTheme();
  const styles = useMemo(() => createFeatureStyles(featureColors), [featureColors]);

  const query = useMemberGoals();
  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();
  const [goalName, setGoalName] = useState("");
  const [caloriesGoal, setCaloriesGoal] = useState("");
  const [goalValidation, setGoalValidation] = useState<string | null>(null);
  const [targetWeight, setTargetWeight] = useState("");

  const submit = () => {
    if (caloriesGoal && (!/^\d+$/.test(caloriesGoal) || Number(caloriesGoal) < 1 || Number(caloriesGoal) > 100000)) {
      setGoalValidation("Enter a daily calorie target between 1 and 100000 kcal."); return;
    }
    if (targetWeight && (!Number.isFinite(Number(targetWeight)) || Number(targetWeight) <= 0)) {
      setGoalValidation("Enter a valid target weight."); return;
    }
    setGoalValidation(null);
    createGoal.mutate({
      goal_name: goalName.trim() || "Fitness goal",
      target_weight: targetWeight ? Number(targetWeight) : null,
      calories_goal: caloriesGoal ? Number(caloriesGoal) : null,
      progress_percentage: 0
    });
  };

  return { kind: "view1" as const, props: { styles, queryRefresh, query, SectionTitle, goalName, setGoalName, targetWeight, setTargetWeight, caloriesGoal, setCaloriesGoal, goalValidation, createGoal, submit, QueryState, ListSection, updateGoal } };
}

export function MemberGoalsScreen(...args: Parameters<typeof useMemberGoalsScreenPresentation>): React.JSX.Element {
  return <MemberGoalsScreenView model={useMemberGoalsScreenPresentation(...args)} />;
}

export function useMemberRewardsScreenPresentation() {
  const { colors: featureColors } = useAppTheme();
  const styles = useMemo(() => createFeatureStyles(featureColors), [featureColors]);
  const navigation = useNavigation<any>();
  const user = useAuthStore((state) => state.user);

  const query = useMemberRewards();
  const gamificationQuery = useMemberGamification();
  const attendanceQuery = useMemberAttendance();
  const workoutsQuery = useMemberWorkouts();
  const mealsQuery = useMemberMeals();
  const activityQuery = useMemberActivity(30);
  const profileQuery = useMemberProfile();
  const redeemPerk = useRedeemMemberPerk();

  return {
    kind: "view1" as const,
    props: {
      styles,
      queryRefresh,
      query,
      gamificationQuery,
      attendanceQuery,
      workoutsQuery,
      mealsQuery,
      activityQuery,
      profileQuery,
      redeemPerk,
      navigation,
      user,
      QueryState,
      DetailGrid,
      ListSection,
    },
  };
}

export function MemberRewardsScreen(...args: Parameters<typeof useMemberRewardsScreenPresentation>): React.JSX.Element {
  return <MemberRewardsScreenView model={useMemberRewardsScreenPresentation(...args)} />;
}

export function useMemberSupportScreenPresentation() {
  const { colors: featureColors } = useAppTheme();
  const styles = useMemo(() => createFeatureStyles(featureColors), [featureColors]);
  const navigation = useNavigation<any>();

  const createTicket = useCreateSupportTicket();
  const gymFeedbackQuery = useGymFeedback();
  const saveGymFeedback = useSaveGymFeedback();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("support");
  const [gymRating, setGymRating] = useState(5);
  const [gymFeedbackText, setGymFeedbackText] = useState("");
  const [gymFeedbackOption, setGymFeedbackOption] = useState<string | null>(null);

  useEffect(() => {
    if (gymFeedbackQuery.data) {
      setGymRating(gymFeedbackQuery.data.rating);
      setGymFeedbackText(gymFeedbackQuery.data.feedback_text ?? "");
    }
  }, [gymFeedbackQuery.data]);

  const submit = () => {
    createTicket.mutate({ category, subject, message });
  };

  const submitGymFeedback = () => saveGymFeedback.mutate({ rating: gymRating, feedback_text: gymFeedbackText.trim() || null });

  return { kind: "view1" as const, props: { styles, SectionTitle, navigation, category, setCategory, subject, setSubject, message, setMessage, createTicket, submit, gymFeedbackQuery, saveGymFeedback, gymRating, setGymRating, gymFeedbackText, setGymFeedbackText, gymFeedbackOption, setGymFeedbackOption, submitGymFeedback } };
}

export function MemberSupportScreen(...args: Parameters<typeof useMemberSupportScreenPresentation>): React.JSX.Element {
  return <MemberSupportScreenView model={useMemberSupportScreenPresentation(...args)} />;
}

export function useMemberSettingsScreenPresentation() {
  const { colors: featureColors } = useAppTheme();
  const styles = useMemo(() => createFeatureStyles(featureColors), [featureColors]);

  const navigation = useNavigation<any>();
  const { isDark, colors: themeColors, setColorScheme } = useAppTheme();
  const user = useAuthStore((s) => s.user);
  const profileQuery = useMemberProfile();
  const profile = profileQuery.data;
  const changePassword = useChangePassword();
  const logout = useLogout();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [notifications, setNotifications] = useState(true);
  const [privacy, setPrivacy] = useState(true);
  const [appleWatchSync, setAppleWatchSync] = useState(true);
  const [faceIdAuth, setFaceIdAuth] = useState(true);

  const submitPassword = () => {
    const parsed = changePasswordSchema.safeParse({ old_password: oldPassword, new_password: newPassword });
    if (!parsed.success) {
      return;
    }
    changePassword.mutate(parsed.data);
  };

  return { kind: "view1" as const, props: { styles, themeColors, user, profile, profileQuery, oldPassword, setOldPassword, newPassword, setNewPassword, changePassword, submitPassword, notifications, setNotifications, privacy, setPrivacy, appleWatchSync, setAppleWatchSync, faceIdAuth, setFaceIdAuth, isDark, setColorScheme, navigation, logout } };
}

export function MemberSettingsScreen(...args: Parameters<typeof useMemberSettingsScreenPresentation>): React.JSX.Element {
  return <MemberSettingsScreenView model={useMemberSettingsScreenPresentation(...args)} />;
}

export { getMemberPaymentTotals, getCompletedWorkoutCount, getRewardPoints, getRewardBadgeCount } from "../../utils/memberFeatureMetrics";

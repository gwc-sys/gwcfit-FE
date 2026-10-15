import type * as React from "react";
import { QueryRefreshView, QueryStateView, ListSectionView, DetailGridView, SectionTitleView, MemberMembershipScreenView, MemberPaymentsScreenView, MemberAttendanceScreenView, MemberWorkoutScreenView, MemberMealPlanScreenView, MemberProgressScreenView, MemberTrainerScreenView, MemberClassesScreenView, MemberNotificationsScreenView, MemberGoalsScreenView, MemberRewardsScreenView, MemberSupportScreenView, MemberSettingsScreenView } from "./MemberFeatureScreens.presentation";
import { createFeatureStyles } from "./MemberFeatureScreens.styles";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { FlatList, RefreshControl, StyleSheet, Switch, Text, View } from "react-native";
import { useMemo, useState } from "react";
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
  useCompleteWorkout,
  useCreateGoal,
  useCreateProgressLog,
  useCreateSupportTicket,
  useMarkNotificationRead,
  useMemberAttendance,
  useMemberClasses,
  useMemberGoals,
  useMemberMeals,
  useMemberMembership,
  useMemberNotifications,
  useMemberPayments,
  useMemberProgress,
  useMemberRewards,
  useMemberTrainer,
  useMemberWorkouts,
  useUpdateGoal
} from "../../hooks/useMember";
import { getApiErrorMessage } from "../../services/api/client";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { colors, radius, spacing, typography } from "../../theme/theme";
import type {
  MemberAttendance,
  MemberClass,
  MemberGoal,
  MemberMealPlan,
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

export function useQueryRefreshPresentation(refreshing: boolean, onRefresh: () => void) {
  return { kind: "view1" as const, props: { refreshing, onRefresh } };
}

function queryRefresh(refreshing: boolean, onRefresh: () => void) {
  return <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />;
}

export function useQueryStatePresentation<T>({ loading, error, empty, emptyTitle, emptyMessage, data, onRetry, children }: QueryStateProps<T>) {
  if (loading) {
    return { kind: "view1" as const, props: {  } };
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

export function useMemberPaymentsScreenPresentation() {
  const { colors: featureColors } = useAppTheme();
  const styles = useMemo(() => createFeatureStyles(featureColors), [featureColors]);

  const query = useMemberPayments();

  return { kind: "view1" as const, props: { styles, queryRefresh, query, QueryState, DetailGrid, ListSection, toneForStatus } };
}

export function MemberPaymentsScreen(...args: Parameters<typeof useMemberPaymentsScreenPresentation>): React.JSX.Element {
  return <MemberPaymentsScreenView model={useMemberPaymentsScreenPresentation(...args)} />;
}

export function useMemberAttendanceScreenPresentation() {
  const { colors: featureColors } = useAppTheme();
  const styles = useMemo(() => createFeatureStyles(featureColors), [featureColors]);

  const query = useMemberAttendance();
  const checkIn = useCheckInMember();
  const checkOut = useCheckOutMember();

  return { kind: "view1" as const, props: { styles, queryRefresh, query, QueryState, DetailGrid, checkIn, checkOut, SectionTitle, ListSection, toneForStatus } };
}

export function MemberAttendanceScreen(...args: Parameters<typeof useMemberAttendanceScreenPresentation>): React.JSX.Element {
  return <MemberAttendanceScreenView model={useMemberAttendanceScreenPresentation(...args)} />;
}

export function useMemberWorkoutScreenPresentation() {
  const { colors: featureColors } = useAppTheme();
  const styles = useMemo(() => createFeatureStyles(featureColors), [featureColors]);

  const query = useMemberWorkouts();
  const completeWorkout = useCompleteWorkout();

  return { kind: "view1" as const, props: { styles, queryRefresh, query, QueryState, DetailGrid, ListSection, displayValue, toneForStatus, completeWorkout } };
}

export function MemberWorkoutScreen(...args: Parameters<typeof useMemberWorkoutScreenPresentation>): React.JSX.Element {
  return <MemberWorkoutScreenView model={useMemberWorkoutScreenPresentation(...args)} />;
}

export function useMemberMealPlanScreenPresentation() {
  const { colors: featureColors } = useAppTheme();
  const styles = useMemo(() => createFeatureStyles(featureColors), [featureColors]);

  const query = useMemberMeals();
  const completeMeal = useCompleteMeal();
  const [waterMl, setWaterMl] = useState("500");

  return { kind: "view1" as const, props: { styles, queryRefresh, query, waterMl, setWaterMl, QueryState, DetailGrid, ListSection, displayValue, toneForStatus, completeMeal } };
}

export function MemberMealPlanScreen(...args: Parameters<typeof useMemberMealPlanScreenPresentation>): React.JSX.Element {
  return <MemberMealPlanScreenView model={useMemberMealPlanScreenPresentation(...args)} />;
}

export function useMemberProgressScreenPresentation() {
  const { colors: featureColors } = useAppTheme();
  const styles = useMemo(() => createFeatureStyles(featureColors), [featureColors]);

  const query = useMemberProgress();
  const createLog = useCreateProgressLog();
  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [notes, setNotes] = useState("");

  const submit = () => {
    createLog.mutate({
      weight: weight ? Number(weight) : null,
      body_fat_percentage: bodyFat ? Number(bodyFat) : null,
      notes,
      measurements: {}
    });
  };

  return { kind: "view1" as const, props: { styles, queryRefresh, query, SectionTitle, weight, setWeight, bodyFat, setBodyFat, notes, setNotes, createLog, submit, QueryState, DetailGrid, ListSection } };
}

export function MemberProgressScreen(...args: Parameters<typeof useMemberProgressScreenPresentation>): React.JSX.Element {
  return <MemberProgressScreenView model={useMemberProgressScreenPresentation(...args)} />;
}

export function useMemberTrainerScreenPresentation() {
  const { colors: featureColors } = useAppTheme();
  const styles = useMemo(() => createFeatureStyles(featureColors), [featureColors]);

  const query = useMemberTrainer();
  const navigation = useNavigation<any>();

  return { kind: "view1" as const, props: { styles, queryRefresh, query, SectionTitle, navigation } };
}

export function MemberTrainerScreen(...args: Parameters<typeof useMemberTrainerScreenPresentation>): React.JSX.Element {
  return <MemberTrainerScreenView model={useMemberTrainerScreenPresentation(...args)} />;
}

export function useMemberClassesScreenPresentation() {
  const { colors: featureColors } = useAppTheme();
  const styles = useMemo(() => createFeatureStyles(featureColors), [featureColors]);

  const query = useMemberClasses();
  const bookClass = useBookClass();
  const cancelClass = useCancelClass();

  return { kind: "view1" as const, props: { styles, queryRefresh, query, QueryState, ListSection, toneForStatus, cancelClass, bookClass } };
}

export function MemberClassesScreen(...args: Parameters<typeof useMemberClassesScreenPresentation>): React.JSX.Element {
  return <MemberClassesScreenView model={useMemberClassesScreenPresentation(...args)} />;
}

export function useMemberNotificationsScreenPresentation() {
  const { colors: featureColors } = useAppTheme();
  const styles = useMemo(() => createFeatureStyles(featureColors), [featureColors]);

  const [unreadOnly, setUnreadOnly] = useState(false);
  const query = useMemberNotifications(unreadOnly);
  const markRead = useMarkNotificationRead();

  return { kind: "view1" as const, props: { styles, queryRefresh, query, unreadOnly, setUnreadOnly, QueryState, ListSection, markRead } };
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
  const [targetWeight, setTargetWeight] = useState("");

  const submit = () => {
    createGoal.mutate({
      goal_name: goalName.trim() || "Fitness goal",
      target_weight: targetWeight ? Number(targetWeight) : null,
      progress_percentage: 0
    });
  };

  return { kind: "view1" as const, props: { styles, queryRefresh, query, SectionTitle, goalName, setGoalName, targetWeight, setTargetWeight, createGoal, submit, QueryState, ListSection, updateGoal } };
}

export function MemberGoalsScreen(...args: Parameters<typeof useMemberGoalsScreenPresentation>): React.JSX.Element {
  return <MemberGoalsScreenView model={useMemberGoalsScreenPresentation(...args)} />;
}

export function useMemberRewardsScreenPresentation() {
  const { colors: featureColors } = useAppTheme();
  const styles = useMemo(() => createFeatureStyles(featureColors), [featureColors]);

  const query = useMemberRewards();

  return { kind: "view1" as const, props: { styles, queryRefresh, query, QueryState, DetailGrid, ListSection } };
}

export function MemberRewardsScreen(...args: Parameters<typeof useMemberRewardsScreenPresentation>): React.JSX.Element {
  return <MemberRewardsScreenView model={useMemberRewardsScreenPresentation(...args)} />;
}

export function useMemberSupportScreenPresentation() {
  const { colors: featureColors } = useAppTheme();
  const styles = useMemo(() => createFeatureStyles(featureColors), [featureColors]);

  const createTicket = useCreateSupportTicket();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("support");

  const submit = () => {
    createTicket.mutate({ category, subject, message });
  };

  return { kind: "view1" as const, props: { styles, SectionTitle, category, setCategory, subject, setSubject, message, setMessage, createTicket, submit } };
}

export function MemberSupportScreen(...args: Parameters<typeof useMemberSupportScreenPresentation>): React.JSX.Element {
  return <MemberSupportScreenView model={useMemberSupportScreenPresentation(...args)} />;
}

export function useMemberSettingsScreenPresentation() {
  const { colors: featureColors } = useAppTheme();
  const styles = useMemo(() => createFeatureStyles(featureColors), [featureColors]);

  const navigation = useNavigation<any>();
  const { isDark, colors: themeColors, setColorScheme } = useAppTheme();
  const changePassword = useChangePassword();
  const logout = useLogout();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [notifications, setNotifications] = useState(true);
  const [privacy, setPrivacy] = useState(true);

  const submitPassword = () => {
    const parsed = changePasswordSchema.safeParse({ old_password: oldPassword, new_password: newPassword });
    if (!parsed.success) {
      return;
    }
    changePassword.mutate(parsed.data);
  };

  return { kind: "view1" as const, props: { styles, themeColors, oldPassword, setOldPassword, newPassword, setNewPassword, changePassword, submitPassword, notifications, setNotifications, privacy, setPrivacy, isDark, setColorScheme, navigation, logout } };
}

export function MemberSettingsScreen(...args: Parameters<typeof useMemberSettingsScreenPresentation>): React.JSX.Element {
  return <MemberSettingsScreenView model={useMemberSettingsScreenPresentation(...args)} />;
}

export { getMemberPaymentTotals, getCompletedWorkoutCount, getRewardPoints, getRewardBadgeCount } from "../../utils/memberFeatureMetrics";

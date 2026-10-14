import type * as React from "react";
import { TrainerDashboardScreenView } from "./TrainerDashboardScreen.presentation";
import { createStyles } from "./TrainerDashboardScreen.styles";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useMemo, useState } from "react";
import { Platform, Pressable, RefreshControl, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useQuery } from "@tanstack/react-query";

import { DataState } from "../../components/DataState";
import { MetricCard } from "../../components/MetricCard";
import { QuickAction } from "../../components/QuickAction";
import { SectionHeader } from "../../components/SectionHeader";
import { SurfacePanel } from "../../components/SurfacePanel";
import { PulseDashboardLayout } from "../../components/dashboard/PulseDashboardLayout";
import { attendanceApi, dietPlansApi, workoutPlansApi } from "../../services/api/operations";
import { membersApi } from "../../services/api/members";
import { getApiErrorMessage } from "../../services/api/client";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { radius, spacing, typography } from "../../theme/theme";
import { formatDate, initials } from "../../utils/formatters";
import type { Attendance, DietPlan, Member, WorkoutPlan } from "../../types/saas";

function isToday(value: string) {
  const date = new Date(value);
  const today = new Date();
  return (
    date.getUTCFullYear() === today.getUTCFullYear() &&
    date.getUTCMonth() === today.getUTCMonth() &&
    date.getUTCDate() === today.getUTCDate()
  );
}

export function useTrainerDashboardScreenPresentation() {
  const navigation = useNavigation<any>();
  const [search, setSearch] = useState("");
  const { colors } = useAppTheme();
  const { width } = useWindowDimensions();
  const compactHeader = width < 900;
  const styles = useMemo(() => createStyles(colors, compactHeader), [colors, compactHeader]);

  const membersQuery = useQuery<Member[]>({
    queryKey: ["members", "trainer-dashboard", search],
    queryFn: () => {
      if (search.trim().length > 0) {
        return membersApi.search(search.trim(), { limit: 50 });
      }
      return membersApi.list({ limit: 50 });
    },
    retry: false
  });

  const workoutsQuery = useQuery<WorkoutPlan[]>({
    queryKey: ["workout-plans", "trainer-dashboard"],
    queryFn: () => workoutPlansApi.list({ limit: 50 }),
    retry: false
  });

  const dietsQuery = useQuery<DietPlan[]>({
    queryKey: ["diet-plans", "trainer-dashboard"],
    queryFn: () => dietPlansApi.list({ limit: 50 }),
    retry: false
  });

  const attendanceQuery = useQuery<Attendance[]>({
    queryKey: ["attendance", "trainer-dashboard"],
    queryFn: () => attendanceApi.list({ limit: 50 }),
    retry: false
  });

  const isRefreshing =
    membersQuery.isFetching ||
    workoutsQuery.isFetching ||
    dietsQuery.isFetching ||
    attendanceQuery.isFetching;

  const assignedMembers = membersQuery.data ?? [];
  const workoutPlans = workoutsQuery.data ?? [];
  const dietPlans = dietsQuery.data ?? [];
  const attendanceRecords = attendanceQuery.data ?? [];

  const assignedMemberCount = assignedMembers.length;
  const activeMemberCount = assignedMembers.filter((member) => member.status === "active").length;
  const workoutPlanCount = workoutPlans.length;
  const dietPlanCount = dietPlans.length;
  const todayAttendance = attendanceRecords.filter((attendance) => isToday(attendance.check_in_at)).length;
  const completedSessions = attendanceRecords.filter((attendance) => attendance.check_out_at !== null).length;

  return { kind: "view1" as const, props: { search, setSearch, isRefreshing, membersQuery, workoutsQuery, dietsQuery, attendanceQuery, styles, assignedMemberCount, activeMemberCount, workoutPlanCount, dietPlanCount, todayAttendance, completedSessions, navigation, assignedMembers, workoutPlans, dietPlans, attendanceRecords } };
}

export function TrainerDashboardScreen(...args: Parameters<typeof useTrainerDashboardScreenPresentation>): React.JSX.Element {
  return <TrainerDashboardScreenView model={useTrainerDashboardScreenPresentation(...args)} />;
}



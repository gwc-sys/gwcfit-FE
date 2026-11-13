import type * as React from "react";
import { WorkoutPlansScreenView, StatView } from "./WorkoutPlansScreen.presentation";
import { createStyles } from "./WorkoutPlansScreen.styles";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { ResourceCrudPanel } from "../../features/operations/ResourceCrudPanel";
import { workoutPlanConfig } from "../../features/operations/resourceConfigs";
import { workoutPlansApi, trainersApi } from "../../services/api/operations";
import { membersApi } from "../../services/api/members";
import type { WorkoutPlanCreatePayload, WorkoutPlanUpdatePayload } from "../../types/saas";
import { useAuthStore } from "../../store/useAuthStore";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { radius, spacing, typography } from "../../theme/theme";
import type { ThemeColors } from "../../theme/theme";
import { AccessDeniedScreen } from "./AccessDeniedScreen";

export function useWorkoutPlansScreenPresentation() {
  const queryClient = useQueryClient();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [createRequest, setCreateRequest] = useState(0);
  const canManage = useAuthStore((state) => state.hasPermission("manage_workouts"));

  const plansQuery = useQuery({
    queryKey: ["operations", "workout-plans"],
    queryFn: () => workoutPlansApi.list({ limit: 50 }),
    enabled: canManage,
    retry: false,
  });

  const membersQuery = useQuery({
    queryKey: ["members", "list"],
    queryFn: () => membersApi.list({ limit: 50 }),
    enabled: canManage,
    retry: false,
  });

  const trainersQuery = useQuery({
    queryKey: ["trainers", "list"],
    queryFn: () => trainersApi.list({ limit: 50 }),
    enabled: canManage,
    retry: false,
  });

  const createPlanMutation = useMutation({
    mutationFn: (payload: WorkoutPlanCreatePayload) => workoutPlansApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operations", "workout-plans"] });
    },
  });

  const updatePlanMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: WorkoutPlanUpdatePayload }) =>
      workoutPlansApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operations", "workout-plans"] });
    },
  });

  const deletePlanMutation = useMutation({
    mutationFn: (id: string) => workoutPlansApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operations", "workout-plans"] });
    },
  });

  if (!canManage) return { kind: "view1" as const, props: {} };
  return {
    kind: "view2" as const,
    props: {
      styles,
      colors,
      setCreateRequest,
      Stat,
      createRequest,
      plansQuery,
      membersQuery,
      trainersQuery,
      createPlanMutation,
      updatePlanMutation,
      deletePlanMutation,
      queryClient,
    },
  };
}

export function WorkoutPlansScreen(...args: Parameters<typeof useWorkoutPlansScreenPresentation>): React.JSX.Element {
  return <WorkoutPlansScreenView model={useWorkoutPlansScreenPresentation(...args)} />;
}

export function useStatPresentation({
  icon,
  label,
  value,
  detail,
  tone,
  styles,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  detail: string;
  tone: string;
  styles: ReturnType<typeof createStyles>;
}) {
  return { kind: "view1" as const, props: { styles, tone, icon, label, value, detail } };
}

function Stat(...args: Parameters<typeof useStatPresentation>): React.JSX.Element {
  return <StatView model={useStatPresentation(...args)} />;
}

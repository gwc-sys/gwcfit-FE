import type * as React from "react";
import { WorkoutPlansScreenView, StatView } from "./WorkoutPlansScreen.presentation";
import { createStyles } from "./WorkoutPlansScreen.styles";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { ResourceCrudPanel } from "../../features/operations/ResourceCrudPanel";
import { workoutPlanConfig } from "../../features/operations/resourceConfigs";
import { useAuthStore } from "../../store/useAuthStore";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { radius, spacing, typography } from "../../theme/theme";
import type { ThemeColors } from "../../theme/theme";
import { AccessDeniedScreen } from "./AccessDeniedScreen";

export function useWorkoutPlansScreenPresentation() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [createRequest, setCreateRequest] = useState(0);
  const canManage = useAuthStore((state) => state.hasPermission("manage_workouts"));
  if (!canManage) return { kind: "view1" as const, props: {  } };
  return { kind: "view2" as const, props: { styles, setCreateRequest, Stat, createRequest } };
}

export function WorkoutPlansScreen(...args: Parameters<typeof useWorkoutPlansScreenPresentation>): React.JSX.Element {
  return <WorkoutPlansScreenView model={useWorkoutPlansScreenPresentation(...args)} />;
}

export function useStatPresentation({ icon, label, value, detail, tone, styles }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string; detail: string; tone: string; styles: ReturnType<typeof createStyles> }) { return { kind: "view1" as const, props: { styles, tone, icon, label, value, detail } }; }

function Stat(...args: Parameters<typeof useStatPresentation>): React.JSX.Element {
  return <StatView model={useStatPresentation(...args)} />;
}



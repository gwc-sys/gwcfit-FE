import type * as React from "react";
import { SuperAdminDashboardScreenView } from "./SuperAdminDashboardScreen.presentation";
import { createStyles } from "./SuperAdminDashboardScreen.styles";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useMemo } from "react";
import { Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";

import { DataState } from "../../components/DataState";
import { MetricCard } from "../../components/MetricCard";
import { QuickAction } from "../../components/QuickAction";
import { SectionHeader } from "../../components/SectionHeader";
import { StatusBadge } from "../../components/StatusBadge";
import { SurfacePanel } from "../../components/SurfacePanel";
import { PulseDashboardHeader, PulseDashboardLayout, getWelcomeTitle } from "../../components/dashboard/PulseDashboardLayout";
import { gymsApi } from "../../services/api/operations";
import { getApiErrorMessage } from "../../services/api/client";
import { useAuthStore } from "../../store/useAuthStore";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { radius, spacing, typography } from "../../theme/theme";
import type { ThemeColors } from "../../theme/theme";
import { formatRole } from "../../utils/formatters";

export function useSuperAdminDashboardScreenPresentation() {
  const navigation = useNavigation<any>();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const user = useAuthStore((state) => state.user);
  const gymsQuery = useQuery({
    queryKey: ["operations", "gyms", "dashboard"],
    queryFn: () => gymsApi.list({ limit: 200 }),
    retry: false
  });

  const stats = useMemo(() => {
    const gyms = gymsQuery.data ?? [];
    return {
      total: gyms.length,
      active: gyms.filter((gym) => gym.status === "active").length,
      suspended: gyms.filter((gym) => gym.status === "suspended").length
    };
  }, [gymsQuery.data]);

  const recentGyms = (gymsQuery.data ?? []).slice(0, 4);
  const directoryTone: "warning" | "success" = gymsQuery.isError ? "warning" : "success";
  const healthItems = [
    { label: "Tenant directory", value: gymsQuery.isError ? "Needs attention" : "Operational", tone: directoryTone },
    { label: "Access controls", value: "Protected", tone: "info" as const },
    { label: "Invitation service", value: "Ready", tone: "success" as const }
  ];

  return { kind: "view1" as const, props: { user, gymsQuery, navigation, styles, stats, recentGyms, colors, healthItems } };
}

export function SuperAdminDashboardScreen(...args: Parameters<typeof useSuperAdminDashboardScreenPresentation>): React.JSX.Element {
  return <SuperAdminDashboardScreenView model={useSuperAdminDashboardScreenPresentation(...args)} />;
}



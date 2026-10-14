import type * as React from "react";
import { NotificationsScreenView } from "./NotificationsScreen.presentation";
import { styles } from "./NotificationsScreen.styles";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { DataState } from "../../components/DataState";
import { Screen } from "../../components/Screen";
import { ScreenHeader } from "../../components/ScreenHeader";
import { SurfacePanel } from "../../components/SurfacePanel";
import { notificationsApi } from "../../services/api/notifications";
import { getApiErrorMessage } from "../../services/api/client";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { radius, spacing, typography } from "../../theme/theme";

export function useNotificationsScreenPresentation() {
  const { colors } = useAppTheme();
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["notifications", "all"], queryFn: () => notificationsApi.list(), retry: false });
  const markRead = useMutation({
    mutationFn: notificationsApi.markRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
  return { kind: "view1" as const, props: { styles, query, colors, markRead } };
}

export function NotificationsScreen(...args: Parameters<typeof useNotificationsScreenPresentation>): React.JSX.Element {
  return <NotificationsScreenView model={useNotificationsScreenPresentation(...args)} />;
}



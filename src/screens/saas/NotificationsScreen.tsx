import { useNavigation } from "@react-navigation/native";
import type { AppNotification } from "../../types/saas";
import type * as React from "react";
import { NotificationsScreenView } from "./NotificationsScreen.presentation";
import { styles } from "./NotificationsScreen.styles";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { DataState } from "../../components/DataState";
import { Screen } from "../../components/Screen";
import { ScreenHeader } from "../../components/ScreenHeader";
import { SurfacePanel } from "../../components/SurfacePanel";
import { enableNotificationDelivery } from "../../services/notificationDelivery";
import { notificationsApi } from "../../services/api/notifications";
import { useAuthStore } from "../../store/useAuthStore";
import { useLiveNotifications } from "../../hooks/useLiveNotifications";
import { getApiErrorMessage, getApiStatus } from "../../services/api/client";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { radius, spacing, typography } from "../../theme/theme";

export function useNotificationsScreenPresentation() {
  const navigation = useNavigation<any>();
  const openRelated = (notification: AppNotification) => {
    const routes = ["Invitations", "ManageGyms", "Payments"];
    if (notification.route && routes.includes(notification.route)) navigation.navigate(notification.route, notification.category === "enquiry" ? { enquiryId: notification.resource_id } : undefined);
  };
  const { colors } = useAppTheme();
  const queryClient = useQueryClient();
  const userId = useAuthStore(state => state.user?.id);
  const gymId = useAuthStore(state => state.user?.gym_id);
  const userRole = useAuthStore(state => state.user?.role);
  useLiveNotifications(userId);
  const enableDelivery = useMutation({ mutationFn: () => enableNotificationDelivery() });
  const query = useQuery({ queryKey: ["notifications", "all", userId, gymId, userRole], queryFn: ({ signal }) => notificationsApi.list(false, signal), enabled: Boolean(userId), retry: false, refetchInterval: 60000 });
  const markRead = useMutation({
    mutationFn: notificationsApi.markRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: error => { if ([403, 404].includes(getApiStatus(error) ?? 0)) void queryClient.resetQueries({ queryKey: ["notifications"] }); },
  });
  const markAllRead = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
  const dismissNotification = useMutation({
    mutationFn: notificationsApi.dismiss,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
  const clearAll = useMutation({
    mutationFn: notificationsApi.clearAll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
  return { kind: "view1" as const, props: { styles, query, colors, markRead, markAllRead, dismissNotification, clearAll, enableDelivery, openRelated, userRole } };
}

export function NotificationsScreen(...args: Parameters<typeof useNotificationsScreenPresentation>): React.JSX.Element {
  return <NotificationsScreenView model={useNotificationsScreenPresentation(...args)} />;
}



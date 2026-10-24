import { useEffect } from "react";
import { AppState, Platform } from "react-native";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "./api/notifications";
import { useAuthStore } from "../store/useAuthStore";
import { useLiveNotifications } from "../hooks/useLiveNotifications";

let registeredDevice: { userId: string; token: string } | undefined;

export async function disableNotificationDelivery(): Promise<void> {
  const device = registeredDevice;
  registeredDevice = undefined;
  try {
    if (device && useAuthStore.getState().user?.id === device.userId) {
      await notificationsApi.unregisterDevice(device.token);
    }
  } finally {
    await Promise.allSettled([Notifications.dismissAllNotificationsAsync(), Notifications.setBadgeCountAsync(0)]);
  }
}

Notifications.setNotificationHandler({ handleNotification: async notification => {
  const receiver = notification.request.content.data?.receiverId;
  const visible = !receiver || receiver === useAuthStore.getState().user?.id;
  return { shouldShowBanner: visible, shouldShowList: visible, shouldPlaySound: visible, shouldSetBadge: visible };
} });

export async function enableNotificationDelivery(requestPermission = true): Promise<string> {
  const userId = useAuthStore.getState().user?.id;
  if (!userId) throw new Error("Sign in to enable notifications.");
  const projectId = Constants.easConfig?.projectId ?? Constants.expoConfig?.extra?.eas?.projectId;
  if (Constants.appOwnership === "expo") {
    throw new Error("Phone notifications require the installed PulseFit app. They are unavailable in Expo Go. You can still read alerts in the notification bell.");
  }
  if (!projectId) {
    throw new Error("Phone notifications are not set up for this PulseFit build yet. You can still read alerts in the notification bell.");
  }
  if (Platform.OS === "android") await Notifications.setNotificationChannelAsync("platform-alerts", {
    name: "Important PulseFit updates", importance: Notifications.AndroidImportance.HIGH, sound: "default",
  });
  let permission = await Notifications.getPermissionsAsync();
  const allowed = (value: typeof permission) => value.granted || (Platform.OS === "ios" &&
    (value.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL || value.ios?.status === Notifications.IosAuthorizationStatus.EPHEMERAL));
  if (!allowed(permission) && requestPermission && permission.canAskAgain) permission = await Notifications.requestPermissionsAsync();
  if (!allowed(permission)) throw new Error("Allow PulseFit notifications in your device settings to receive system alerts.");
  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  if (useAuthStore.getState().user?.id !== userId) throw new Error("Your account changed. Please try again.");
  await notificationsApi.registerDevice(token);
  if (useAuthStore.getState().user?.id !== userId) throw new Error("Your account changed. Please try again.");
  const previous = registeredDevice;
  registeredDevice = { userId, token };
  if (previous?.userId === userId && previous.token !== token) {
    await notificationsApi.unregisterDevice(previous.token).catch(() => {});
  }
  return "System notifications enabled on this device.";
}

export function useNotificationDelivery(navigation: any, userId: string | undefined, unread: number) {
  const client = useQueryClient();
  useLiveNotifications(userId);
  useEffect(() => {
    if (!userId) return;
    let active = true;
    const refresh = () => {
      if (active && useAuthStore.getState().user?.id === userId) void client.invalidateQueries({ queryKey: ["notifications"] });
    };
    const open = (response: Notifications.NotificationResponse) => {
      if (!active || useAuthStore.getState().user?.id !== userId) return;
      const data = response.notification.request.content.data ?? {};
      if (data.receiverId && data.receiverId !== userId) return;
      if (typeof data.notificationId === "string") void notificationsApi.markRead(data.notificationId).then(refresh).catch(() => {});
      navigation.navigate("Notifications");
      refresh();
    };
    void enableNotificationDelivery(false).catch(() => {});
    const received = Notifications.addNotificationReceivedListener(refresh);
    const tapped = Notifications.addNotificationResponseReceivedListener(open);
    const rotated = Notifications.addPushTokenListener(() => {
      if (active && useAuthStore.getState().user?.id === userId) void enableNotificationDelivery(false).catch(() => {});
    });
    void Notifications.getLastNotificationResponseAsync().then(response => {
      if (response) { open(response); void Notifications.clearLastNotificationResponseAsync(); }
    }).catch(() => {});
    const state = AppState.addEventListener("change", next => {
      if (next === "active" && active && useAuthStore.getState().user?.id === userId) { refresh(); void enableNotificationDelivery(false).catch(() => {}); }
    });
    return () => { active = false; received.remove(); tapped.remove(); rotated.remove(); state.remove(); };
  }, [userId, navigation, client]);
  useEffect(() => { void Notifications.setBadgeCountAsync(userId ? unread : 0).catch(() => {}); }, [userId, unread]);
}

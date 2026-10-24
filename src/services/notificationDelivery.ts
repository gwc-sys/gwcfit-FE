import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "./api/notifications";
import { useAuthStore } from "../store/useAuthStore";
import { useLiveNotifications } from "../hooks/useLiveNotifications";

export async function enableNotificationDelivery(): Promise<string> {
  const userId = useAuthStore.getState().user?.id;
  if (!userId) throw new Error("Sign in to enable notifications.");
  if (typeof window === "undefined" || !("Notification" in window)) {
    throw new Error("This browser does not support desktop notifications. You can still read updates in the bell.");
  }
  if (!window.isSecureContext) {
    throw new Error("Browser notifications require HTTPS or localhost. You can still read updates in the bell.");
  }
  const permission = window.Notification.permission === "default"
    ? await window.Notification.requestPermission()
    : window.Notification.permission;
  if (permission !== "granted") {
    throw new Error("Allow notifications for this website in your browser's site settings, then try again.");
  }
  if (useAuthStore.getState().user?.id !== userId) throw new Error("Your account changed. Please try again.");
  try {
    const confirmation = new window.Notification("PulseFit notifications enabled", {
      body: "New updates will appear here while PulseFit is open.",
      tag: "pulsefit-notifications-enabled",
    });
    activeAlerts.add(confirmation);
    confirmation.onclose = () => activeAlerts.delete(confirmation);
  } catch {
    throw new Error("This browser cannot display desktop alerts. Use a supported desktop browser, or read updates in the bell.");
  }
  return "Browser notifications enabled while PulseFit is open. New updates also appear in the bell.";
}

export function requestBrowserNotificationsOnInteraction(userId: string): () => void {
  if (typeof window === "undefined" || !window.isSecureContext || !("Notification" in window) || window.Notification.permission !== "default") return () => {};
  const remove = () => {
    window.removeEventListener("click", request, true);
    window.removeEventListener("keydown", request, true);
  };
  const request = () => {
    remove();
    if (useAuthStore.getState().user?.id === userId && window.Notification.permission === "default") {
      // Browsers require permission requests to originate from a user gesture.
      // Do not prompt again after denial or when permission is already granted.
      void enableNotificationDelivery().catch(() => {});
    }
  };
  window.addEventListener("click", request, { once: true, capture: true });
  window.addEventListener("keydown", request, { once: true, capture: true });
  return remove;
}

export function useNotificationDelivery(navigation: any, userId: string | undefined, _unread: number) {
  const client = useQueryClient();
  useLiveNotifications(userId);
  useEffect(() => {
    if (userId) return requestBrowserNotificationsOnInteraction(userId);
  }, [userId]);
  // The polling query is shared with the notification centre.
  const query = useQuery({
    queryKey: ["notifications", "all", userId],
    queryFn: () => notificationsApi.list(),
    enabled: Boolean(userId),
    refetchInterval: 60000,
    refetchIntervalInBackground: true,
    retry: false,
  });

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") {
        void client.invalidateQueries({ queryKey: ["notifications"] });
      }
    };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [client]);

  useEffect(() => {
    if (!userId || !query.data || useAuthStore.getState().user?.id !== userId) return;
    // Seed the first successful snapshot so old unread alerts don't flood the desktop.
    if (deliveryUser !== userId) {
      deliveryUser = userId;
      seen = new Set(query.data.map(item => item.id));
      return;
    }
    for (const item of query.data) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      if (item.status !== "unread" || !("Notification" in window) || window.Notification.permission !== "granted") continue;
      try {
        const alert = new window.Notification(item.title, { body: item.body, tag: item.id });
        activeAlerts.add(alert);
        alert.onclose = () => activeAlerts.delete(alert);
        alert.onclick = () => {
          alert.close();
          if (useAuthStore.getState().user?.id !== userId) return;
          window.focus();
          navigation.navigate("Notifications");
          void notificationsApi.markRead(item.id).then(() => client.invalidateQueries({ queryKey: ["notifications"] })).catch(() => {});
        };
      } catch {
        // Some browsers expose Notification but require a service worker to show it.
        // The same update remains available in the in-app notification centre.
      }
    }
  }, [query.data, userId, navigation, client]);
}

let deliveryUser: string | undefined;
let seen = new Set<string>();
const activeAlerts = new Set<Notification>();
export async function disableNotificationDelivery(): Promise<void> {
  for (const alert of activeAlerts) alert.close();
  activeAlerts.clear();
}
useAuthStore.subscribe((state, previous) => {
  if (state.user?.id === previous.user?.id) return;
  deliveryUser = undefined;
  seen.clear();
  for (const alert of activeAlerts) alert.close();
  activeAlerts.clear();
});

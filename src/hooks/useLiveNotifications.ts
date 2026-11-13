import { useEffect } from "react";
import { AppState, Platform } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { subscribeNotificationChanges } from "../services/notificationLive";
import { useAuthStore } from "../store/useAuthStore";

export function useLiveNotifications(userId: string | undefined) {
  const client = useQueryClient();
  const gymId = useAuthStore(state => state.user?.gym_id);
  const role = useAuthStore(state => state.user?.role);
  useEffect(() => {
    if (!userId) return;
    const refresh = () => {
      void client.cancelQueries({ queryKey: ["notifications"] });
      void client.cancelQueries({ queryKey: ["member", "notifications"] });
      void client.resetQueries({ queryKey: ["notifications"] });
      void client.resetQueries({ queryKey: ["member", "notifications"] });
    };
    refresh();
    const unsubscribe = subscribeNotificationChanges(userId, refresh);
    const appState = AppState.addEventListener("change", next => { if (next === "active") refresh(); });
    const onFocus = () => { if (document.visibilityState === "visible") refresh(); };
    if (Platform.OS === "web") {
      window.addEventListener("focus", onFocus);
      document.addEventListener("visibilitychange", onFocus);
    }
    return () => {
      unsubscribe();
      appState.remove();
      if (Platform.OS === "web") {
        window.removeEventListener("focus", onFocus);
        document.removeEventListener("visibilitychange", onFocus);
      }
    };
  }, [userId, gymId, role, client]);
}

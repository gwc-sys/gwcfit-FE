import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { subscribeNotificationChanges } from "../services/notificationLive";

export function useLiveNotifications(userId: string | undefined) {
  const client = useQueryClient();
  useEffect(() => {
    if (!userId) return;
    return subscribeNotificationChanges(userId, () => {
      void client.invalidateQueries({ queryKey: ["notifications"] });
    });
  }, [userId, client]);
}

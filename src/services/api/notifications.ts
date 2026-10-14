import { apiClient } from "./client";
import type { AppNotification } from "../../types/saas";

export const notificationsApi = {
  async list(unreadOnly = false) {
    const response = await apiClient.get<AppNotification[]>("/notifications", {
      params: { unread_only: unreadOnly, limit: 100 },
    });
    return response.data;
  },
  async markRead(id: string) {
    const response = await apiClient.patch<AppNotification>(`/notifications/${id}/read`);
    return response.data;
  },
};

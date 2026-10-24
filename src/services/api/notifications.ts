import { apiClient } from "./client";
import type { AppNotification } from "../../types/saas";

export const notificationsApi = {
  async unreadCount() {
    return (await apiClient.get<{ count: number }>("/notifications/unread-count")).data.count;
  },
  async registerDevice(token: string) {
    await apiClient.post("/notifications/push-device", { token });
  },
  async unregisterDevice(token: string) {
    await apiClient.delete("/notifications/push-device", { data: { token } });
  },
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

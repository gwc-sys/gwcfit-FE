import { apiClient } from "./client";
import type { AppNotification, NotificationPreferenceItem } from "../../types/saas";

export const notificationsApi = {
  async getPreferences() {
    const response = await apiClient.get<NotificationPreferenceItem[]>("/notifications/preferences");
    return response.data;
  },
  async updatePreference(payload: NotificationPreferenceItem) {
    const response = await apiClient.put<NotificationPreferenceItem>("/notifications/preferences", payload);
    return response.data;
  },
  async unreadCount(signal?: AbortSignal) {
    return (await apiClient.get<{ count: number }>("/notifications/unread-count", { signal })).data.count;
  },
  async registerDevice(token: string) {
    await apiClient.post("/notifications/push-device", { token });
  },
  async unregisterDevice(token: string) {
    await apiClient.delete("/notifications/push-device", { data: { token } });
  },
  async list(unreadOnly = false, signal?: AbortSignal) {
    const response = await apiClient.get<AppNotification[]>("/notifications", {
      params: { unread_only: unreadOnly, limit: 100 }, signal,
    });
    return response.data;
  },
  async markRead(id: string) {
    const response = await apiClient.patch<AppNotification>(`/notifications/${id}/read`);
    return response.data;
  },
  async markAllRead() {
    const response = await apiClient.post<AppNotification[]>("/notifications/read-all");
    return response.data;
  },
  async dismiss(id: string) {
    const response = await apiClient.delete<{ status: string; id: string }>(`/notifications/${id}`);
    return response.data;
  },
  async clearAll() {
    const response = await apiClient.post<{ status: string; cleared_count: number }>("/notifications/clear-all");
    return response.data;
  },
};

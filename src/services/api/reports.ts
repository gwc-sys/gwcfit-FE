import { apiClient } from "./client";
import type { DashboardStats, GymFeedbackSummary, ManagedReview, PlatformReport, RatingsDashboard } from "../../types/saas";

export const reportsApi = {
  async dashboard() {
    const response = await apiClient.get<DashboardStats>("/reports/dashboard");
    return response.data;
  },
  async platform() {
    const response = await apiClient.get<PlatformReport>("/reports/platform");
    return response.data;
  },
  async gymFeedback() {
    const response = await apiClient.get<GymFeedbackSummary>("/reports/gym-feedback");
    return response.data;
  },
  async ratings() {
    return (await apiClient.get<RatingsDashboard>("/reports/ratings")).data;
  },
  async replyToReview(reviewType: "gym" | "trainer", reviewId: string, reply: string) {
    return (await apiClient.put<ManagedReview>(`/reports/ratings/${reviewType}/${reviewId}/reply`, { reply })).data;
  },
};

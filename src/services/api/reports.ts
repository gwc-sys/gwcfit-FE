import { apiClient } from "./client";
import type { DashboardStats, GymFeedbackSummary, PlatformReport } from "../../types/saas";

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
  }
};

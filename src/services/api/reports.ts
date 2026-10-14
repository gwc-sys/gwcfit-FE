import { apiClient } from "./client";
import type { DashboardStats, PlatformReport } from "../../types/saas";

export const reportsApi = {
  async dashboard() {
    const response = await apiClient.get<DashboardStats>("/reports/dashboard");
    return response.data;
  },
  async platform() {
    const response = await apiClient.get<PlatformReport>("/reports/platform");
    return response.data;
  }
};

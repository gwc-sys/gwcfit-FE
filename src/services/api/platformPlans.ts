import { apiClient } from "./client";
import type { PlatformPlan } from "../../types/saas";

export type PlatformPlanUpdate = Partial<Omit<PlatformPlan, "id" | "slug">>;
export type PlatformPlanCreate = Omit<PlatformPlan, "id">;

export const platformPlansApi = {
  async list() {
    const response = await apiClient.get<PlatformPlan[]>("/platform-plans");
    return response.data;
  },
  async update(id: string, payload: PlatformPlanUpdate) {
    const response = await apiClient.patch<PlatformPlan>(`/platform-plans/${id}`, payload);
    return response.data;
  },
  async create(payload: PlatformPlanCreate) {
    const response = await apiClient.post<PlatformPlan>("/platform-plans", payload);
    return response.data;
  },
  async remove(id: string) {
    await apiClient.delete(`/platform-plans/${id}`);
  },
};

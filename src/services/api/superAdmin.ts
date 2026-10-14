import { apiClient } from "./client";
import type { GymAdminCreatePayload, GymAdminCreateResponse } from "../../types/saas";

function cleanGymAdminPayload(payload: GymAdminCreatePayload): GymAdminCreatePayload {
  return {
    gym_name: payload.gym_name.trim(),
    ...(payload.gym_email ? { gym_email: payload.gym_email.trim().toLowerCase() } : {}),
    ...(payload.gym_phone ? { gym_phone: payload.gym_phone.trim() } : {}),
    ...(payload.gym_address ? { gym_address: payload.gym_address.trim() } : {}),
    gym_timezone: payload.gym_timezone?.trim() || "UTC",
    admin_full_name: payload.admin_full_name.trim(),
    admin_email: payload.admin_email.trim().toLowerCase(),
    admin_password: payload.admin_password,
    ...(payload.admin_phone ? { admin_phone: payload.admin_phone.trim() } : {})
  };
}

export const superAdminApi = {
  async createGymAdmin(payload: GymAdminCreatePayload) {
    const response = await apiClient.post<GymAdminCreateResponse>(
      "/super-admin/gym-admin",
      cleanGymAdminPayload(payload)
    );
    return response.data;
  }
};

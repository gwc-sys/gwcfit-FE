import { apiClient } from "./client";
import type { Member, MemberCreatePayload, MemberUpdatePayload, MessageResponse } from "../../types/saas";

export type MemberListParams = {
  q?: string;
  skip?: number;
  limit?: number;
  gym_id?: string;
};

function blankToUndefined(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function blankToNull(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function cleanCreatePayload(payload: MemberCreatePayload): MemberCreatePayload {
  return {
    member_code: payload.member_code.trim(),
    first_name: payload.first_name.trim(),
    last_name: payload.last_name.trim(),
    ...(blankToUndefined(payload.email) ? { email: blankToUndefined(payload.email) } : {}),
    ...(blankToUndefined(payload.phone) ? { phone: blankToUndefined(payload.phone) } : {}),
    status: payload.status?.trim() || "active",
    ...(payload.trainer_id ? { trainer_id: payload.trainer_id } : {}),
    ...(payload.membership_plan_id ? { membership_plan_id: payload.membership_plan_id } : {}),
    ...(payload.joined_at ? { joined_at: payload.joined_at } : {}),
    ...(payload.membership_starts_at ? { membership_starts_at: payload.membership_starts_at } : {}),
    ...(payload.membership_ends_at ? { membership_ends_at: payload.membership_ends_at } : {}),
    ...(payload.emergency_contact ? { emergency_contact: payload.emergency_contact } : {}),
    ...(payload.extra_data ? { extra_data: payload.extra_data } : {})
  };
}

function cleanUpdatePayload(payload: MemberUpdatePayload): MemberUpdatePayload {
  return {
    ...(payload.first_name !== undefined ? { first_name: payload.first_name.trim() } : {}),
    ...(payload.last_name !== undefined ? { last_name: payload.last_name.trim() } : {}),
    ...(payload.email !== undefined ? { email: blankToNull(payload.email) } : {}),
    ...(payload.phone !== undefined ? { phone: blankToNull(payload.phone) } : {}),
    ...(payload.status !== undefined ? { status: payload.status.trim() } : {}),
    ...(payload.trainer_id !== undefined ? { trainer_id: payload.trainer_id } : {}),
    ...(payload.membership_plan_id !== undefined ? { membership_plan_id: payload.membership_plan_id } : {}),
    ...(payload.membership_starts_at !== undefined ? { membership_starts_at: payload.membership_starts_at } : {}),
    ...(payload.membership_ends_at !== undefined ? { membership_ends_at: payload.membership_ends_at } : {}),
    ...(payload.emergency_contact !== undefined ? { emergency_contact: payload.emergency_contact } : {}),
    ...(payload.extra_data !== undefined ? { extra_data: payload.extra_data } : {})
  };
}

export const membersApi = {
  async list(params?: MemberListParams) {
    const response = await apiClient.get<Member[]>("/members", { params });
    return response.data;
  },

  async search(q: string, params?: Omit<MemberListParams, "q">) {
    const response = await apiClient.get<Member[]>("/members", {
      params: { ...params, q }
    });
    return response.data;
  },

  async get(memberId: string) {
    const response = await apiClient.get<Member>(`/members/${memberId}`);
    return response.data;
  },

  async getMyProfile() {
    const response = await apiClient.get<Member>("/members/me");
    return response.data;
  },

  async create(payload: MemberCreatePayload) {
    const response = await apiClient.post<Member>("/members", cleanCreatePayload(payload));
    return response.data;
  },

  async update(memberId: string, payload: MemberUpdatePayload) {
    const response = await apiClient.patch<Member>(`/members/${memberId}`, cleanUpdatePayload(payload));
    return response.data;
  },

  async remove(memberId: string) {
    const response = await apiClient.delete<MessageResponse>(`/members/${memberId}`);
    return response.data;
  }
};

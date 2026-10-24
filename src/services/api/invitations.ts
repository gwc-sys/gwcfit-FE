import { apiClient } from "./client";
import type {
  Invitation,
  InvitationCreatePayload,
  InvitationCreated,
  InvitationValidation
} from "../../types/saas";

export type GymRegistrationRequest = {
  id: string; full_name: string; email: string; phone: string; gym_name: string;
  status: string; interested_plan_name: string | null; created_at: string;
  active_members_range: string; interested_plan_id: string | null;
  notes: string | null; source: string; updated_at: string;
  invitation_id: string | null; gym_id: string | null;
};

export const invitationApi = {
  async registrationRequests() {
    const response = await apiClient.get<GymRegistrationRequest[]>("/developer/inquiries", { params: { limit: 500 } });
    return response.data;
  },
  async inviteRegistration(id: string) {
    const response = await apiClient.post<InvitationCreated>(`/developer/inquiries/${id}/invite`);
    return response.data;
  },
  async validate(token: string) {
    const response = await apiClient.post<InvitationValidation>("/invitations/validate", { token: token.trim() });
    return response.data;
  },

  async list() {
    const response = await apiClient.get<Invitation[]>("/invitations");
    return response.data;
  },

  async create(payload: InvitationCreatePayload) {
    const response = await apiClient.post<InvitationCreated>("/invitations", {
      role: payload.role,
      expires_in_hours: payload.expires_in_hours ?? 168,
      ...(payload.email?.trim() ? { email: payload.email.trim().toLowerCase() } : {})
    });
    return response.data;
  },

  async revoke(invitationId: string) {
    const response = await apiClient.post<Invitation>(`/invitations/${invitationId}/revoke`);
    return response.data;
  }
};

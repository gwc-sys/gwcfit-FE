import { apiClient } from "./client";
import type {
  Invitation,
  InvitationCreatePayload,
  InvitationCreated,
  InvitationValidation
} from "../../types/saas";

export const invitationApi = {
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

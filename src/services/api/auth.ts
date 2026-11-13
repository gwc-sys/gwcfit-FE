import { apiClient } from "./client";
import type {
  AuthResponse,
  AuthUser,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  GymOption,
  GymUserRegistrationPayload,
  LoginPayload,
  MessageResponse,
  OwnerRegistrationPayload,
  ResetPasswordPayload,
  SecurityEvent,
  TokenPair,
  VerifyEmailPayload
} from "../../types/saas";

function cleanOwnerRegistrationPayload(payload: OwnerRegistrationPayload): OwnerRegistrationPayload {
  const phone = payload.phone?.trim();
  const invitationToken = payload.invitation_token?.trim();

  return {
    gym_name: payload.gym_name.trim(),
    full_name: payload.full_name.trim(),
    email: payload.email.trim().toLowerCase(),
    password: payload.password,
    ...(phone ? { phone } : {}),
    invitation_token: invitationToken ?? ""
  };
}

export const authApi = {
  async listGymOptions() {
    const response = await apiClient.get<GymOption[]>("/gyms/public/options");
    return response.data;
  },

  async login(payload: LoginPayload) {
    const response = await apiClient.post<AuthResponse>("/auth/login", {
      email: payload.email.trim().toLowerCase(),
      password: payload.password
    });
    return response.data;
  },

  async registerOwner(payload: OwnerRegistrationPayload) {
    const response = await apiClient.post<AuthResponse>(
      "/auth/register/owner",
      cleanOwnerRegistrationPayload(payload)
    );
    return response.data;
  },

  async registerExistingGymUser(payload: GymUserRegistrationPayload) {
    const phone = payload.phone?.trim();
    const response = await apiClient.post<AuthResponse>("/auth/register", {
      full_name: payload.full_name.trim(),
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
      invitation_token: payload.invitation_token?.trim() ?? "",
      ...(phone ? { phone } : {}),
      ...(payload.membership_plan_id ? { membership_plan_id: payload.membership_plan_id } : {})
    });
    return response.data;
  },

  async refresh(refreshToken: string) {
    const response = await apiClient.post<TokenPair>("/auth/refresh", {
      refresh_token: refreshToken
    });
    return response.data;
  },

  async logout() {
    const response = await apiClient.post<MessageResponse>("/auth/logout");
    return response.data;
  },

  async forgotPassword(payload: ForgotPasswordPayload) {
    const response = await apiClient.post<ForgotPasswordResponse>("/auth/forgot-password", {
      email: payload.email.trim().toLowerCase()
    });
    return response.data;
  },

  async resetPassword(payload: ResetPasswordPayload) {
    const response = await apiClient.post<MessageResponse>("/auth/reset-password", payload);
    return response.data;
  },

  async changePassword(payload: ChangePasswordPayload) {
    const response = await apiClient.post<MessageResponse>("/auth/change-password", payload);
    return response.data;
  },

  async verifyEmail(payload: VerifyEmailPayload) {
    const response = await apiClient.post<MessageResponse>("/auth/verify-email", payload);
    return response.data;
  },

  async updateProfile(payload: { full_name?: string; avatar_url?: string; email?: string; phone?: string }) {
    const response = await apiClient.patch<AuthUser>("/auth/me", payload);
    return response.data;
  },

  async verifyStepUp(password: string) {
    const response = await apiClient.post<{ valid: boolean; verified_at: string }>("/auth/step-up", { password });
    return response.data;
  },

  async getSecurityEvents() {
    const response = await apiClient.get<SecurityEvent[]>("/auth/security-events");
    return response.data;
  },

  async revokeOtherSessions() {
    const response = await apiClient.post<MessageResponse>("/auth/revoke-other-sessions");
    return response.data;
  },

  async confirmPendingContact(payload: { contact_type: "email" | "phone"; otp_code: string }) {
    const response = await apiClient.post<AuthUser>("/auth/confirm-pending-contact", payload);
    return response.data;
  }
};

import { apiClient } from "./client";
import type {
  AuthResponse,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  GymOption,
  GymUserRegistrationPayload,
  LoginPayload,
  MessageResponse,
  OwnerRegistrationPayload,
  ResetPasswordPayload,
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
    const response = await apiClient.post<AuthResponse>("/auth/register", {
      full_name: payload.full_name.trim(),
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
      invitation_token: payload.invitation_token?.trim() ?? ""
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
  }
};

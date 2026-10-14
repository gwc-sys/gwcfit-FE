import { useMutation, useQueryClient } from "@tanstack/react-query";

import { authApi } from "../services/api/auth";
import { useAuthStore } from "../store/useAuthStore";
import type { ChangePasswordPayload, ForgotPasswordPayload, ResetPasswordPayload, VerifyEmailPayload } from "../types/saas";

export function useForgotPassword() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) => authApi.forgotPassword(payload),
    retry: false
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) => authApi.resetPassword(payload),
    retry: false
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: (payload: VerifyEmailPayload) => authApi.verifyEmail(payload),
    retry: false
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => authApi.changePassword(payload),
    retry: false
  });
}

export function useLogout() {
  const clearSession = useAuthStore((state) => state.clearSession);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    retry: false,
    onSettled: () => {
      queryClient.clear();
      clearSession();
    }
  });
}

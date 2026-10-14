import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getApiStatus } from "../services/api/client";
import { membersApi, type MemberListParams } from "../services/api/members";
import { superAdminApi } from "../services/api/superAdmin";
import type { GymAdminCreatePayload, MemberCreatePayload, MemberUpdatePayload } from "../types/saas";

export const rbacQueryKeys = {
  members: (params?: MemberListParams) => ["members", params ?? {}] as const,
  memberProfile: () => ["members", "me"] as const
};

function shouldRetryRequest(failureCount: number, error: unknown) {
  const statusCode = getApiStatus(error);

  if (statusCode && [400, 401, 403, 404, 409, 422, 429].includes(statusCode)) {
    return false;
  }

  return failureCount < 1;
}

export function useMembers(params?: MemberListParams, enabled = true) {
  return useQuery({
    queryKey: rbacQueryKeys.members(params),
    queryFn: () => membersApi.list(params),
    enabled,
    retry: shouldRetryRequest
  });
}

export function useMyMemberProfile(enabled = true) {
  return useQuery({
    queryKey: rbacQueryKeys.memberProfile(),
    queryFn: membersApi.getMyProfile,
    enabled,
    retry: shouldRetryRequest
  });
}

export function useCreateGymAdmin() {
  return useMutation({
    mutationFn: (payload: GymAdminCreatePayload) => superAdminApi.createGymAdmin(payload),
    retry: false
  });
}

export function useCreateMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: MemberCreatePayload) => membersApi.create(payload),
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    }
  });
}

export function useUpdateMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, payload }: { memberId: string; payload: MemberUpdatePayload }) =>
      membersApi.update(memberId, payload),
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["member"] });
    }
  });
}

export function useDeleteMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) => membersApi.remove(memberId),
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["member"] });
    }
  });
}

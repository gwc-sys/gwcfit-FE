import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getApiStatus } from "../services/api/client";
import { gymsApi, type ListParams } from "../services/api/operations";
import type { GymCreatePayload, GymUpdatePayload, MessageResponse } from "../types/saas";

type ResourceApi<TRead, TCreate, TUpdate> = {
  list: (params?: ListParams) => Promise<TRead[]>;
  get: (id: string) => Promise<TRead>;
  create: (payload: TCreate) => Promise<TRead>;
  update: (id: string, payload: TUpdate) => Promise<TRead>;
  remove: (id: string) => Promise<MessageResponse>;
};

export const operationsQueryKeys = {
  resourceList: (resource: string, params?: ListParams) => ["operations", resource, params ?? {}] as const,
  myGym: () => ["operations", "gyms", "me"] as const,
  gyms: (params?: ListParams) => ["operations", "gyms", params ?? {}] as const
};

function shouldRetryRequest(failureCount: number, error: unknown) {
  const statusCode = getApiStatus(error);

  if (statusCode && [400, 401, 403, 404, 409, 422, 429].includes(statusCode)) {
    return false;
  }

  return failureCount < 1;
}

export function useCrudResource<TRead, TCreate, TUpdate>(
  resource: string,
  api: ResourceApi<TRead, TCreate, TUpdate>,
  params?: ListParams,
  enabled = true
) {
  const queryClient = useQueryClient();
  const refreshRelatedData = () => Promise.all(
    ["operations", "reports", "members", "member", "attendance", "users"].map((key) =>
      queryClient.invalidateQueries({ queryKey: [key] })
    )
  );
  const listQuery = useQuery({
    queryKey: operationsQueryKeys.resourceList(resource, params),
    queryFn: () => api.list(params),
    enabled,
    retry: shouldRetryRequest
  });

  const createMutation = useMutation({
    mutationFn: (payload: TCreate) => api.create(payload),
    retry: false,
    onSuccess: refreshRelatedData
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TUpdate }) => api.update(id, payload),
    retry: false,
    onSuccess: refreshRelatedData
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.remove(id),
    retry: false,
    onSuccess: refreshRelatedData
  });

  return {
    listQuery,
    createMutation,
    updateMutation,
    deleteMutation
  };
}

export function useGyms(params?: ListParams, enabled = true) {
  return useQuery({
    queryKey: operationsQueryKeys.gyms(params),
    queryFn: () => gymsApi.list(params),
    enabled,
    retry: shouldRetryRequest
  });
}

export function useMyGym(enabled = true) {
  return useQuery({
    queryKey: operationsQueryKeys.myGym(),
    queryFn: gymsApi.getMyGym,
    enabled,
    retry: shouldRetryRequest
  });
}

export function useCreateGym() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: GymCreatePayload) => gymsApi.create(payload),
    retry: false,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["operations", "gyms"] })
  });
}

export function useUpdateMyGym() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: GymUpdatePayload) => gymsApi.updateMyGym(payload),
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: operationsQueryKeys.myGym() });
      queryClient.invalidateQueries({ queryKey: ["operations", "gyms"] });
    }
  });
}

export function useSuspendGym() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (gymId: string) => gymsApi.suspend(gymId),
    retry: false,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["operations", "gyms"] })
  });
}

export function useDeleteGym() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (gymId: string) => gymsApi.remove(gymId),
    retry: false,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["operations", "gyms"] })
  });
}

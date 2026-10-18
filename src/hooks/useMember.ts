import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getApiStatus } from "../services/api/client";
import { memberApi } from "../services/api/member";
import type {
  MemberGoalCreate,
  MemberGoalUpdate,
  MemberProfileUpdate,
  MemberProgressLogCreate,
  SupportTicketCreate,
} from "../types/member";

export const memberQueryKeys = {
  all: ["member"] as const,
  dashboard: () => ["member", "dashboard"] as const,
  profile: () => ["member", "profile"] as const,
  membership: () => ["member", "membership"] as const,
  payments: () => ["member", "payments"] as const,
  attendance: () => ["member", "attendance"] as const,
  workouts: () => ["member", "workouts"] as const,
  meals: () => ["member", "meals"] as const,
  progress: () => ["member", "progress"] as const,
  trainer: () => ["member", "trainer"] as const,
  classes: () => ["member", "classes"] as const,
  notifications: (unreadOnly = false) =>
    ["member", "notifications", unreadOnly] as const,
  activity: () => ["member", "activity"] as const,
  goals: () => ["member", "goals"] as const,
  rewards: () => ["member", "rewards"] as const,
};

function shouldRetryRequest(failureCount: number, error: unknown) {
  const statusCode = getApiStatus(error);

  if (statusCode && [400, 401, 403, 404, 409, 422, 429].includes(statusCode)) {
    return false;
  }

  return failureCount < 1;
}

function useMemberQuery<T>(
  queryKey: readonly unknown[],
  queryFn: () => Promise<T>,
  enabled = true,
) {
  return useQuery({
    queryKey,
    queryFn,
    enabled,
    retry: shouldRetryRequest,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
    refetchOnMount: "always",
    refetchOnReconnect: true,
  });
}

export function useMemberDashboard() {
  return useMemberQuery(
    memberQueryKeys.dashboard(),
    memberApi.getMemberDashboard,
  );
}

export function useMemberProfile() {
  return useMemberQuery(memberQueryKeys.profile(), memberApi.getMemberProfile);
}

export function useUpdateMemberProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: MemberProfileUpdate) =>
      memberApi.updateMemberProfile(payload),
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: memberQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: ["members", "me"] });
    },
  });
}

export function useMemberMembership() {
  return useMemberQuery(
    memberQueryKeys.membership(),
    memberApi.getMemberMembership,
  );
}

export function useMemberPayments() {
  return useMemberQuery(
    memberQueryKeys.payments(),
    memberApi.getMemberPayments,
  );
}

export function useMemberAttendance() {
  return useMemberQuery(
    memberQueryKeys.attendance(),
    memberApi.getMemberAttendance,
  );
}

export function useCheckInMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: memberApi.checkInMember,
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: memberQueryKeys.attendance() });
      queryClient.invalidateQueries({ queryKey: memberQueryKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: memberQueryKeys.activity() });
    },
  });
}

export function useCheckOutMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: memberApi.checkOutMember,
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: memberQueryKeys.attendance() });
      queryClient.invalidateQueries({ queryKey: memberQueryKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: memberQueryKeys.activity() });
    },
  });
}

export function useMemberWorkouts() {
  return useMemberQuery(
    memberQueryKeys.workouts(),
    memberApi.getMemberWorkouts,
  );
}

export function useCompleteWorkout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      workoutPlanUuid,
      notes,
      exercises,
    }: {
      workoutPlanUuid: string;
      notes?: string;
      exercises?: unknown[];
    }) => memberApi.completeWorkout(workoutPlanUuid, { notes, exercises }),
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: memberQueryKeys.workouts() });
      queryClient.invalidateQueries({ queryKey: memberQueryKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: memberQueryKeys.activity() });
    },
  });
}

export function useMemberMeals() {
  return useMemberQuery(memberQueryKeys.meals(), memberApi.getMemberMeals);
}

export function useCompleteMeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      mealPlanUuid,
      notes,
      waterMl,
    }: {
      mealPlanUuid: string;
      notes?: string;
      waterMl?: number;
    }) => memberApi.completeMeal(mealPlanUuid, { notes, water_ml: waterMl }),
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: memberQueryKeys.meals() });
      queryClient.invalidateQueries({ queryKey: memberQueryKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: memberQueryKeys.activity() });
    },
  });
}

export function useMemberProgress() {
  return useMemberQuery(
    memberQueryKeys.progress(),
    memberApi.getMemberProgress,
  );
}

export function useCreateProgressLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: MemberProgressLogCreate) =>
      memberApi.createProgressLog(payload),
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: memberQueryKeys.progress() });
      queryClient.invalidateQueries({ queryKey: memberQueryKeys.profile() });
      queryClient.invalidateQueries({ queryKey: memberQueryKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: memberQueryKeys.activity() });
    },
  });
}

export function useMemberTrainer() {
  return useMemberQuery(memberQueryKeys.trainer(), memberApi.getMemberTrainer);
}

export function useMemberClasses() {
  return useMemberQuery(memberQueryKeys.classes(), memberApi.getMemberClasses);
}

export function useBookClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: memberApi.bookClass,
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: memberQueryKeys.classes() });
      queryClient.invalidateQueries({ queryKey: memberQueryKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: memberQueryKeys.activity() });
    },
  });
}

export function useCancelClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: memberApi.cancelClass,
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: memberQueryKeys.classes() });
      queryClient.invalidateQueries({ queryKey: memberQueryKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: memberQueryKeys.activity() });
    },
  });
}

export function useMemberNotifications(unreadOnly = false) {
  return useMemberQuery(memberQueryKeys.notifications(unreadOnly), () =>
    memberApi.getMemberNotifications(unreadOnly),
  );
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: memberApi.markNotificationRead,
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["member", "notifications"] });
      queryClient.invalidateQueries({ queryKey: memberQueryKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: memberQueryKeys.activity() });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMemberGoals() {
  return useMemberQuery(memberQueryKeys.goals(), memberApi.getMemberGoals);
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: MemberGoalCreate) => memberApi.createGoal(payload),
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: memberQueryKeys.goals() });
      queryClient.invalidateQueries({ queryKey: memberQueryKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: memberQueryKeys.activity() });
    },
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      goalUuid,
      payload,
    }: {
      goalUuid: string;
      payload: MemberGoalUpdate;
    }) => memberApi.updateGoal(goalUuid, payload),
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: memberQueryKeys.goals() });
      queryClient.invalidateQueries({ queryKey: memberQueryKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: memberQueryKeys.activity() });
    },
  });
}

export function useMemberRewards() {
  return useMemberQuery(memberQueryKeys.rewards(), memberApi.getMemberRewards);
}

export function useCreateSupportTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SupportTicketCreate) =>
      memberApi.createSupportTicket(payload),
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: memberQueryKeys.profile() });
    },
  });
}


export function useMemberActivity(limit = 30) {
  return useMemberQuery([...memberQueryKeys.activity(), limit], () => memberApi.getActivity(limit));
}

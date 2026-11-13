import { apiClient } from "./client";
import type {
  MemberActivityHistory, MemberActivityDay, MemberActivitySync,
  MemberAttendance,
  MemberAttendanceSummary,
  MemberAttendanceQrToken,
  MemberClass,
  MemberDashboardSummary,
  MemberGoal,
  MemberGoalCreate,
  MemberGoalUpdate,
  MemberMealPlan,
  MemberMealPlanCreate,
  MemberMembership,
  MemberNotification,
  MemberPayment,
  MemberProfile,
  MemberProfileUpdate,
  MemberProgressLog,
  MemberProgressLogCreate,
  MemberReward,
  MemberGamificationSummary,
  RedeemPerkResponse,
  MemberTrainer,
  TrainerFeedback,
  TrainerFeedbackPayload,
  GymFeedback,
  GymFeedbackPayload,
  MemberWorkout,
  SupportTicket,
  SupportTicketCreate
} from "../../types/member";

function cleanProfilePayload(payload: MemberProfileUpdate): MemberProfileUpdate {
  return {
    ...(payload.phone !== undefined ? { phone: payload.phone?.trim() || null } : {}),
    ...(payload.address !== undefined ? { address: payload.address?.trim() || null } : {}),
    ...(payload.emergency_contact !== undefined ? { emergency_contact: payload.emergency_contact } : {}),
    ...(payload.height !== undefined ? { height: payload.height } : {}),
    ...(payload.weight !== undefined ? { weight: payload.weight } : {}),
    ...(payload.fitness_goal !== undefined ? { fitness_goal: payload.fitness_goal?.trim() || null } : {}),
    ...(payload.profile_photo !== undefined ? { profile_photo: payload.profile_photo?.trim() || null } : {})
  };
}

export const memberApi = {
  async getActivity(limit = 30, offset = 0) {
    return (await apiClient.get<MemberActivityHistory>("/member/activity", { params: { utc_offset_minutes: -new Date().getTimezoneOffset(), limit, offset } })).data;
  },
  async syncActivity(payload: MemberActivitySync) {
    return (await apiClient.put<MemberActivityDay>("/member/activity", payload)).data;
  },
  async getMemberDashboard() {
    const response = await apiClient.get<MemberDashboardSummary>("/member/dashboard");
    return response.data;
  },

  async getMemberProfile() {
    const response = await apiClient.get<MemberProfile>("/member/profile");
    return response.data;
  },

  async updateMemberProfile(payload: MemberProfileUpdate) {
    const response = await apiClient.patch<MemberProfile>("/member/profile", cleanProfilePayload(payload));
    return response.data;
  },

  async getMemberMembership() {
    const response = await apiClient.get<MemberMembership>("/member/membership");
    return response.data;
  },

  async getMemberPayments() {
    const response = await apiClient.get<MemberPayment[]>("/member/payments");
    return response.data;
  },

  async getMemberAttendance() {
    const response = await apiClient.get<MemberAttendanceSummary>("/member/attendance");
    return response.data;
  },

  async checkInMember() {
    const response = await apiClient.post<MemberAttendance>("/member/attendance/check-in");
    return response.data;
  },

  async checkOutMember() {
    const response = await apiClient.post<MemberAttendance>("/member/attendance/check-out");
    return response.data;
  },

  async createAttendanceQr(action: "check_in" | "check_out") {
    const response = await apiClient.post<MemberAttendanceQrToken>("/member/attendance/qr-token", undefined, { params: { action } });
    return response.data;
  },

  async getMemberWorkouts() {
    const response = await apiClient.get<MemberWorkout[]>("/member/workouts");
    return response.data;
  },

  async completeWorkout(workoutPlanUuid: string, payload: { notes?: string; exercises?: unknown[] } = {}) {
    const response = await apiClient.post<MemberWorkout>(`/member/workouts/${workoutPlanUuid}/complete`, payload);
    return response.data;
  },

  async getMemberMeals() {
    const response = await apiClient.get<MemberMealPlan[]>("/member/meals");
    return response.data;
  },

  async createMemberMealPlan(payload: MemberMealPlanCreate) {
    const response = await apiClient.post<MemberMealPlan>("/member/meals", payload);
    return response.data;
  },

  async completeMeal(mealPlanUuid: string, payload: { notes?: string; water_ml?: number; extra_meal?: unknown } = {}) {
    const response = await apiClient.post<MemberMealPlan>(`/member/meals/${mealPlanUuid}/complete`, payload);
    return response.data;
  },

  async getMemberProgress() {
    const response = await apiClient.get<MemberProgressLog[]>("/member/progress");
    return response.data;
  },

  async createProgressLog(payload: MemberProgressLogCreate) {
    const response = await apiClient.post<MemberProgressLog>("/member/progress", payload);
    return response.data;
  },

  async deleteProgressLog(progressUuid: string) {
    await apiClient.delete(`/member/progress/${progressUuid}`);
  },

  async getMemberTrainer() {
    const response = await apiClient.get<MemberTrainer | null>("/member/trainer");
    return response.data;
  },

  async getTrainerFeedback() {
    return (await apiClient.get<TrainerFeedback | null>("/member/trainer/feedback")).data;
  },

  async saveTrainerFeedback(payload: TrainerFeedbackPayload) {
    return (await apiClient.put<TrainerFeedback>("/member/trainer/feedback", payload)).data;
  },

  async getGymFeedback() {
    return (await apiClient.get<GymFeedback | null>("/member/gym/feedback")).data;
  },

  async saveGymFeedback(payload: GymFeedbackPayload) {
    return (await apiClient.put<GymFeedback>("/member/gym/feedback", payload)).data;
  },

  async getMemberClasses() {
    const response = await apiClient.get<MemberClass[]>("/member/classes");
    return response.data;
  },

  async bookClass(classUuid: string) {
    const response = await apiClient.post<MemberClass>(`/member/classes/${classUuid}/book`);
    return response.data;
  },

  async cancelClass(classUuid: string) {
    const response = await apiClient.post<MemberClass>(`/member/classes/${classUuid}/cancel`);
    return response.data;
  },

  async getMemberNotifications(unreadOnly = false) {
    const response = await apiClient.get<MemberNotification[]>("/member/notifications", {
      params: unreadOnly ? { unread_only: true } : undefined
    });
    return response.data;
  },

  async markNotificationRead(notificationUuid: string) {
    const response = await apiClient.patch<MemberNotification>(`/member/notifications/${notificationUuid}/read`);
    return response.data;
  },

  async markAllNotificationsRead() {
    const response = await apiClient.post<MemberNotification[]>("/member/notifications/read-all");
    return response.data;
  },

  async dismissNotification(notificationUuid: string) {
    const response = await apiClient.delete<{ status: string; notification_uuid: string }>(`/member/notifications/${notificationUuid}`);
    return response.data;
  },

  async clearAllNotifications() {
    const response = await apiClient.post<{ status: string; cleared_count: number }>("/member/notifications/clear-all");
    return response.data;
  },

  async getMemberGoals() {
    const response = await apiClient.get<MemberGoal[]>("/member/goals");
    return response.data;
  },

  async createGoal(payload: MemberGoalCreate) {
    const response = await apiClient.post<MemberGoal>("/member/goals", payload);
    return response.data;
  },

  async updateGoal(goalUuid: string, payload: MemberGoalUpdate) {
    const response = await apiClient.patch<MemberGoal>(`/member/goals/${goalUuid}`, payload);
    return response.data;
  },

  async getMemberRewards() {
    const response = await apiClient.get<MemberReward[]>("/member/rewards");
    return response.data;
  },

  async getMemberGamification() {
    const response = await apiClient.get<MemberGamificationSummary>("/member/gamification");
    return response.data;
  },

  async redeemMemberPerk(perkId: string) {
    const response = await apiClient.post<RedeemPerkResponse>("/member/perks/redeem", {
      perk_id: perkId,
    });
    return response.data;
  },

  async createSupportTicket(payload: SupportTicketCreate) {
    const response = await apiClient.post<SupportTicket>("/member/support-tickets", {
      category: payload.category?.trim() || "support",
      subject: payload.subject.trim(),
      message: payload.message.trim()
    });
    return response.data;
  }
};

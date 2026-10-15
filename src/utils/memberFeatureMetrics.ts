import type { MemberPayment, MemberReward, MemberWorkout } from "../types/member";

// Existing summaries are shared by both renderers; their arithmetic is unchanged.
export function getMemberPaymentTotals(payments: MemberPayment[]) {
  return {
    paid: payments.reduce((sum, item) => sum + item.paid_amount_cents, 0),
    due: payments.reduce((sum, item) => sum + item.due_amount_cents, 0),
  };
}
export function getCompletedWorkoutCount(workouts: MemberWorkout[]) {
  return workouts.reduce((sum, item) => sum + item.completed_workouts, 0);
}
export function getRewardPoints(rewards: MemberReward[]) {
  return rewards.reduce((sum, item) => sum + item.points, 0);
}
export function getRewardBadgeCount(rewards: MemberReward[]) {
  return rewards.filter((item) => item.badge).length;
}

import type { JsonObject } from "./saas";

export type MemberStatusTone = "success" | "warning" | "danger" | "info" | "neutral";

export type MemberProfile = {
  member_uuid: string;
  member_name: string;
  member_code: string;
  email: string | null;
  phone: string | null;
  gender?: string | null;
  date_of_birth?: string | null;
  address?: string | null;
  emergency_contact: JsonObject;
  height?: number | null;
  weight?: number | null;
  bmi?: number | null;
  fitness_goal?: string | null;
  medical_conditions?: string | string[] | null;
  profile_photo?: string | null;
  trainer_uuid?: string | null;
  trainer_name?: string | null;
  gym_uuid: string;
  gym_name?: string | null;
  membership_plan_uuid?: string | null;
  membership_plan_name?: string | null;
  membership_status: string;
};

export type MemberProfileUpdate = {
  phone?: string | null;
  address?: string | null;
  emergency_contact?: JsonObject | null;
  height?: number | null;
  weight?: number | null;
  fitness_goal?: string | null;
  profile_photo?: string | null;
};

export type MemberMembershipHistoryItem = {
  membership_uuid: string;
  membership_plan_uuid?: string | null;
  membership_plan_name?: string | null;
  start_date?: string | null;
  expiry_date?: string | null;
  status: string;
  amount_cents?: number | null;
  currency?: string | null;
  paid_at?: string | null;
};

export type MemberMembership = {
  membership_uuid: string;
  member_uuid: string;
  member_name: string;
  gym_uuid: string;
  gym_name?: string | null;
  membership_plan_uuid?: string | null;
  membership_plan_name?: string | null;
  plan_price_cents: number;
  plan_currency: string;
  plan_duration_days?: number | null;
  start_date?: string | null;
  expiry_date?: string | null;
  status: string;
  days_remaining: number;
  renewal_reminder: string;
  benefits: string[];
  history: MemberMembershipHistoryItem[];
};

export type MemberPayment = {
  payment_uuid: string;
  gym_uuid: string;
  gym_name?: string | null;
  member_uuid: string;
  member_name: string;
  membership_plan_uuid?: string | null;
  membership_plan_name?: string | null;
  amount_cents: number;
  paid_amount_cents: number;
  due_amount_cents: number;
  currency: string;
  payment_method: string;
  payment_date?: string | null;
  invoice_number?: string | null;
  receipt_url?: string | null;
  status: "paid" | "pending" | "failed" | "refunded" | "overdue" | string;
};

export type MemberAttendance = {
  attendance_uuid: string;
  gym_uuid: string;
  gym_name?: string | null;
  member_uuid: string;
  member_name: string;
  trainer_uuid?: string | null;
  trainer_name?: string | null;
  check_in_at: string;
  check_out_at?: string | null;
  source: string;
  status: string;
  notes?: string | null;
};

export type MemberAttendanceSummary = {
    today_status: string;
    today_visit_count: number;
    daily_visit_limit: number;
    can_check_in: boolean;
  can_check_out: boolean;
  monthly_attendance_count: number;
  attendance_percentage: number;
  missed_days: number;
  history: MemberAttendance[];
};

export type MemberAttendanceQrToken = {
  token: string;
  action: "check_in" | "check_out";
  expires_in_seconds: number;
};

export type MemberExercise = {
  name?: string;
  exercise_name?: string;
  category?: string;
  sets?: number | string;
  reps?: number | string;
  weight?: number | string;
  rest_time?: string;
  notes?: string;
  video_url?: string;
  image_url?: string;
  completed?: boolean;
};

export type MemberWorkout = {
  workout_plan_uuid: string;
  workout_plan_name: string;
  gym_uuid: string;
  gym_name?: string | null;
  member_uuid: string;
  member_name: string;
  trainer_uuid?: string | null;
  trainer_name?: string | null;
  goal: string;
  level: string;
  starts_at?: string | null;
  ends_at?: string | null;
  today_workout?: JsonObject | null;
  weekly_plan: JsonObject[];
  sessions: JsonObject[];
  completion_status: string;
  completed_workouts: number;
  missed_workouts: number;
  weekly_consistency: number;
  personal_records: JsonObject[];
  trainer_notes?: string | null;
};

export type MemberMeal = {
  name?: string;
  meal_name?: string;
  type?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  notes?: string;
  completed?: boolean;
};

export type MemberMealPlan = {
  meal_plan_uuid: string;
  meal_plan_name: string;
  gym_uuid: string;
  gym_name?: string | null;
  member_uuid: string;
  member_name: string;
  trainer_uuid?: string | null;
  trainer_name?: string | null;
  calories_per_day: number;
  starts_at?: string | null;
  ends_at?: string | null;
  today_meal_plan?: JsonObject | null;
  meals: JsonObject[];
  water_target_ml?: number | null;
  trainer_notes?: string | null;
  completion_status: string;
};

export type MemberProgressLog = {
  progress_uuid: string;
  logged_at: string;
  weight?: number | null;
  bmi?: number | null;
  body_fat_percentage?: number | null;
  muscle_mass?: number | null;
  calories_burned?: number | null;
  measurements: JsonObject;
  photo_url?: string | null;
  goal_progress_percentage?: number | null;
  notes?: string | null;
};

export type MemberProgressLogCreate = Omit<MemberProgressLog, "progress_uuid" | "logged_at" | "measurements"> & {
  measurements?: JsonObject;
};

export type MemberTrainer = {
  trainer_uuid: string;
  trainer_name: string;
  trainer_photo?: string | null;
  email?: string | null;
  phone?: string | null;
  specialization: string[];
  schedule: JsonObject[];
  assigned_workout_plans: string[];
  assigned_meal_plans: string[];
  trainer_notes?: string | null;
};

export type MemberClass = {
  class_uuid: string;
  class_name: string;
  gym_uuid: string;
  gym_name?: string | null;
  trainer_uuid?: string | null;
  trainer_name?: string | null;
  date?: string | null;
  time?: string | null;
  duration_minutes?: number | null;
  capacity: number;
  available_seats: number;
  class_type: string;
  booking_status: string;
};

export type MemberNotification = {
  notification_uuid: string;
  title: string;
  body: string;
  notification_type: string;
  read_at?: string | null;
  created_at: string;
  status: string;
  payload: JsonObject;
};

export type MemberGoal = {
  goal_uuid: string;
  goal_name: string;
  target_weight?: number | null;
  target_date?: string | null;
  progress_percentage: number;
  workout_goal?: string | null;
  water_intake_goal?: number | null;
  attendance_goal?: number | null;
  calories_goal?: number | null;
  status: string;
  created_at: string;
  completed_at?: string | null;
};

export type MemberGoalCreate = Omit<MemberGoal, "goal_uuid" | "status" | "created_at" | "completed_at">;
export type MemberGoalUpdate = Partial<Omit<MemberGoal, "goal_uuid" | "created_at">>;

export type MemberReward = {
  reward_uuid: string;
  title: string;
  description?: string | null;
  points: number;
  badge?: string | null;
  status: string;
  challenge_type?: string | null;
  privacy_safe_rank?: number | null;
};

export type SupportTicketCreate = {
  category?: string;
  subject: string;
  message: string;
};

export type SupportTicket = {
  ticket_uuid: string;
  gym_uuid: string;
  gym_name?: string | null;
  member_uuid: string;
  member_name: string;
  category: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
};

export type MemberDashboardSummary = {
  member_uuid: string;
  member_name: string;
  gym_uuid: string;
  gym_name?: string | null;
  profile_photo?: string | null;
  membership_status: string;
  membership_expiry_date?: string | null;
  days_remaining: number;
  assigned_trainer_name?: string | null;
  today_attendance_status: string;
  today_workout_plan?: MemberWorkout | null;
  today_meal_plan?: MemberMealPlan | null;
  pending_payment_amount_cents: number;
  pending_payment_currency: string;
  upcoming_class?: MemberClass | null;
  fitness_goal_progress: number;
  quick_actions: string[];
};

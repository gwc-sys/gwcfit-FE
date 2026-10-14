export type RoleName =
  | "super_admin"
  | "gym_owner"
  | "sub_admin"
  | "trainer"
  | "receptionist"
  | "member";

export type JoinableRoleName = Extract<RoleName, "sub_admin" | "trainer" | "receptionist" | "member">;
export type ManagedUserRole = Extract<RoleName, "gym_owner" | "sub_admin" | "trainer" | "receptionist" | "member">;
export type UserStatus = "active" | "inactive";

export type PermissionCode =
  | "manage_gyms"
  | "manage_subscriptions"
  | "manage_platform_settings"
  | "view_platform_analytics"
  | "manage_members"
  | "manage_trainers"
  | "manage_payments"
  | "manage_attendance"
  | "manage_workouts"
  | "manage_diet_plans"
  | "manage_reports"
  | "manage_staff"
  | "manage_membership_plans"
  | "configure_gym"
  | "view_own_profile";

export type TokenPair = {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
};

export type AuthUser = {
  id: string;
  gym_id: string | null;
  gym_name?: string | null;
  email: string;
  full_name: string;
  role: RoleName;
  permissions: PermissionCode[];
};

export type AuthResponse = {
  user: AuthUser;
  tokens: TokenPair;
};

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  channel: string;
  read_at: string | null;
  created_at: string;
  status: "read" | "unread";
  gym_name?: string | null;
};

export type PlatformPlan = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price_cents: number | null;
  currency: string;
  billing_period: string | null;
  member_limit: string;
  features: string[];
  cta_label: string;
  trial_days: number;
  is_popular: boolean;
  display_order: number;
  is_active: boolean;
};

export type GymOption = {
  id: string;
  name: string;
};

export type MessageResponse = {
  message: string;
};

export type JsonObject = Record<string, unknown>;

export type EnterpriseRead = {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
  is_active: boolean;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type OwnerRegistrationPayload = {
  gym_name: string;
  full_name: string;
  email: string;
  password: string;
  phone?: string;
  invitation_token?: string | null;
};

export type GymUserRegistrationPayload = {
  gym_id?: string | null;
  gym_name?: string;
  full_name: string;
  email: string;
  password: string;
  role?: JoinableRoleName;
  invitation_token?: string | null;
};

export type InvitationStatus = "active" | "used" | "revoked" | "expired";

export type Invitation = {
  id: string;
  gym_id: string | null;
  gym_name: string | null;
  role: Exclude<RoleName, "super_admin">;
  email: string | null;
  status: InvitationStatus;
  expires_at: string;
  use_count: number;
  max_uses: number;
  created_at: string;
  created_by: string | null;
  used_at: string | null;
  used_by: string | null;
  token: string | null;
};

export type InvitationCreated = Invitation & { token: string };

export type InvitationValidation = {
  valid: true;
  role: Exclude<RoleName, "super_admin">;
  gym_id: string | null;
  gym_name: string | null;
  email: string | null;
  expires_at: string;
};

export type InvitationCreatePayload = {
  role: Exclude<RoleName, "super_admin">;
  email?: string;
  expires_in_hours?: number;
};

export type ForgotPasswordPayload = {
  email: string;
};

export type ForgotPasswordResponse = {
  message: string;
  reset_token: string | null;
};

export type ResetPasswordPayload = {
  token: string;
  new_password: string;
};

export type ChangePasswordPayload = {
  old_password: string;
  new_password: string;
};

export type VerifyEmailPayload = {
  token: string;
};

export type GymAdminCreatePayload = {
  gym_name: string;
  gym_email?: string | null;
  gym_phone?: string | null;
  gym_address?: string | null;
  gym_timezone?: string;
  admin_full_name: string;
  admin_email: string;
  admin_password: string;
  admin_phone?: string | null;
};

export type GymAdmin = {
  id: string;
  gym_id: string;
  gym_name?: string | null;
  email: string;
  full_name: string;
  role: "gym_owner";
  phone?: string | null;
  is_active: boolean;
};

export type GymAdminCreateResponse = {
  gym: Gym;
  gym_admin: GymAdmin;
};

export type DashboardStats = {
  active_members: number;
  trainers: number;
  checkins_today: number;
  revenue_cents_this_month: number;
};

export type PlatformRevenuePoint = { period: string; revenue_cents: number };
export type PlatformGymPoint = {
  gym_id: string;
  gym_name: string;
  status: string;
  members: number;
  revenue_cents: number;
};
export type PlatformReport = {
  total_gyms: number;
  active_gyms: number;
  suspended_gyms: number;
  free_trial_gyms: number;
  total_members: number;
  active_members: number;
  total_gym_owners: number;
  total_trainers: number;
  total_staff: number;
  revenue_cents_total: number;
  revenue_cents_this_month: number;
  revenue_by_month: PlatformRevenuePoint[];
  gyms: PlatformGymPoint[];
};

export type Gym = EnterpriseRead & {
  name: string;
  code: string;
  status: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  timezone: string;
  settings: Record<string, unknown>;
};

export type GymPlatformSubscription = {
  id: string;
  platform_plan_id: string | null;
  plan_name: string;
  status: string;
  amount_cents: number;
  currency: string;
  trial_started_at: string | null;
  current_period_ends_at: string | null;
};

export type DeveloperGym = Gym & {
  owner_name: string | null;
  owner_email: string | null;
  user_count: number;
  member_count: number;
  trainer_count: number;
  subscription: GymPlatformSubscription | null;
};

export type GymUser = EnterpriseRead & {
  gym_id: string;
  gym_name?: string | null;
  email: string;
  full_name: string;
  role: JoinableRoleName;
  phone?: string | null;
  is_email_verified: boolean;
};

export type ManagedUser = EnterpriseRead & {
  gym_id: string | null;
  gym_name?: string | null;
  name: string;
  full_name: string;
  email: string;
  phone?: string | null;
  role: ManagedUserRole;
  status: UserStatus;
};

export type UserRoleCounts = {
  total: number;
  member: number;
  trainer: number;
  receptionist: number;
  sub_admin: number;
  gym_owner: number;
};

export type UserCreatePayload = {
  name: string;
  email: string;
  password: string;
  phone?: string | null;
  role: ManagedUserRole;
  gym_id?: string | null;
  status?: UserStatus;
};

export type UserUpdatePayload = {
  name?: string;
  email?: string;
  password?: string;
  phone?: string | null;
  role?: ManagedUserRole;
  gym_id?: string | null;
  status?: UserStatus;
};

export type GymCreatePayload = {
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  timezone?: string;
};

export type GymUpdatePayload = {
  name?: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  timezone?: string | null;
  settings?: JsonObject | null;
};

export type Member = EnterpriseRead & {
  gym_id: string;
  gym_name?: string | null;
  user_id: string | null;
  user_name?: string | null;
  trainer_id: string | null;
  trainer_name?: string | null;
  membership_plan_id: string | null;
  membership_plan_name?: string | null;
  member_name?: string | null;
  member_code: string;
  first_name: string;
  last_name: string;
  email?: string | null;
  phone?: string | null;
  status: string;
  joined_at: string;
  membership_starts_at: string | null;
  membership_ends_at: string | null;
  emergency_contact: Record<string, unknown>;
  extra_data: Record<string, unknown>;
};

export type MemberCreatePayload = {
  member_code: string;
  first_name: string;
  last_name: string;
  email?: string | null;
  phone?: string | null;
  status?: string;
  trainer_id?: string | null;
  membership_plan_id?: string | null;
  joined_at?: string;
  membership_starts_at?: string | null;
  membership_ends_at?: string | null;
  emergency_contact?: Record<string, unknown>;
  extra_data?: Record<string, unknown>;
};

export type MemberUpdatePayload = {
  first_name?: string;
  last_name?: string;
  email?: string | null;
  phone?: string | null;
  status?: string;
  trainer_id?: string | null;
  membership_plan_id?: string | null;
  membership_starts_at?: string | null;
  membership_ends_at?: string | null;
  emergency_contact?: Record<string, unknown>;
  extra_data?: Record<string, unknown>;
};

export type Trainer = EnterpriseRead & {
  gym_id: string;
  gym_name?: string | null;
  user_id: string | null;
  user_name?: string | null;
  trainer_name?: string | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  bio: string | null;
  specialties: string[];
  hourly_rate_cents: number;
  commission_rate: number;
  extra_data: JsonObject;
};

export type TrainerCreatePayload = {
  full_name: string;
  email?: string | null;
  phone?: string | null;
  bio?: string | null;
  specialties?: string[];
  hourly_rate_cents?: number;
  commission_rate?: number;
  user_id?: string | null;
  extra_data?: JsonObject;
};

export type TrainerUpdatePayload = {
  full_name?: string;
  email?: string | null;
  phone?: string | null;
  bio?: string | null;
  specialties?: string[] | null;
  hourly_rate_cents?: number | null;
  commission_rate?: number | null;
  extra_data?: JsonObject | null;
};

export type AttendanceSource = "qr_code" | "barcode" | "manual" | "offline_sync";

export type Attendance = EnterpriseRead & {
  gym_id: string;
  gym_name?: string | null;
  member_id: string;
  member_name?: string | null;
  trainer_id: string | null;
  trainer_name?: string | null;
  check_in_at: string;
  check_out_at: string | null;
  source: AttendanceSource;
  notes: string | null;
  device_payload: JsonObject;
};

export type DailyAttendanceQr = { token: string; gym_id: string; gym_name: string; attendance_date: string; expires_at: string };
export type DailyAttendanceStats = { attendance_date: string; daily_visit_limit: number; total_check_ins: number; total_check_outs: number; currently_checked_in: number; checked_in_members: Attendance[] };

export type AttendanceCreatePayload = {
  member_id: string;
  trainer_id?: string | null;
  check_in_at: string;
  check_out_at?: string | null;
  source?: AttendanceSource;
  notes?: string | null;
  device_payload?: JsonObject;
};

export type AttendanceUpdatePayload = {
  trainer_id?: string | null;
  check_out_at?: string | null;
  source?: AttendanceSource | null;
  notes?: string | null;
  device_payload?: JsonObject | null;
};

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type Payment = EnterpriseRead & {
  gym_id: string;
  gym_name?: string | null;
  member_id: string;
  member_name?: string | null;
  membership_plan_id: string | null;
  membership_plan_name?: string | null;
  amount_cents: number;
  currency: string;
  method: string;
  status: PaymentStatus;
  provider_reference: string | null;
  paid_at: string | null;
  extra_data: JsonObject;
};

export type PaymentCreatePayload = {
  member_id: string;
  membership_plan_id?: string | null;
  amount_cents: number;
  currency?: string;
  method: string;
  status?: PaymentStatus;
  provider_reference?: string | null;
  paid_at?: string | null;
  extra_data?: JsonObject;
};

export type PaymentUpdatePayload = {
  membership_plan_id?: string | null;
  amount_cents?: number | null;
  currency?: string | null;
  method?: string | null;
  status?: PaymentStatus | null;
  provider_reference?: string | null;
  paid_at?: string | null;
  extra_data?: JsonObject | null;
};

export type MembershipPlan = EnterpriseRead & {
  gym_id: string;
  gym_name?: string | null;
  name: string;
  description: string | null;
  duration_days: number;
  price_cents: number;
  currency: string;
  features: string[];
};

export type MembershipPlanCreatePayload = {
  name: string;
  description?: string | null;
  duration_days: number;
  price_cents: number;
  currency?: string;
  features?: string[];
};

export type MembershipPlanUpdatePayload = {
  name?: string;
  description?: string | null;
  duration_days?: number | null;
  price_cents?: number | null;
  currency?: string | null;
  features?: string[] | null;
};

export type WorkoutPlan = EnterpriseRead & {
  gym_id: string;
  gym_name?: string | null;
  member_id: string;
  member_name?: string | null;
  trainer_id: string | null;
  trainer_name?: string | null;
  title: string;
  goal: string;
  level: string;
  starts_at: string | null;
  ends_at: string | null;
  sessions: JsonObject[];
};

export type WorkoutPlanCreatePayload = {
  member_id: string;
  trainer_id?: string | null;
  title: string;
  goal: string;
  level: string;
  starts_at?: string | null;
  ends_at?: string | null;
  sessions?: JsonObject[];
};

export type WorkoutPlanUpdatePayload = {
  trainer_id?: string | null;
  title?: string;
  goal?: string;
  level?: string;
  starts_at?: string | null;
  ends_at?: string | null;
  sessions?: JsonObject[] | null;
};

export type DietPlan = EnterpriseRead & {
  gym_id: string;
  gym_name?: string | null;
  member_id: string;
  member_name?: string | null;
  trainer_id: string | null;
  trainer_name?: string | null;
  title: string;
  category: "Weight Loss" | "Muscle Gain" | "Maintenance" | "Medical" | "Custom";
  calories_per_day: number;
  starts_at: string | null;
  ends_at: string | null;
  meals: JsonObject[];
};

export type DietPlanCreatePayload = {
  member_id: string;
  trainer_id?: string | null;
  title: string;
  category: "Weight Loss" | "Muscle Gain" | "Maintenance" | "Medical" | "Custom";
  calories_per_day: number;
  starts_at?: string | null;
  ends_at?: string | null;
  meals?: JsonObject[];
};

export type DietPlanUpdatePayload = {
  trainer_id?: string | null;
  title?: string;
  category?: "Weight Loss" | "Muscle Gain" | "Maintenance" | "Medical" | "Custom";
  calories_per_day?: number | null;
  starts_at?: string | null;
  ends_at?: string | null;
  meals?: JsonObject[] | null;
};

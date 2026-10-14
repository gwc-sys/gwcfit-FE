import {
  attendanceApi,
  dietPlansApi,
  membershipPlansApi,
  paymentsApi,
  trainersApi,
  workoutPlansApi,
} from "../../services/api/operations";
import type {
  Attendance,
  AttendanceCreatePayload,
  AttendanceUpdatePayload,
  DietPlan,
  DietPlanCreatePayload,
  DietPlanUpdatePayload,
  MembershipPlan,
  MembershipPlanCreatePayload,
  MembershipPlanUpdatePayload,
  Payment,
  PaymentCreatePayload,
  PaymentUpdatePayload,
  Trainer,
  TrainerCreatePayload,
  TrainerUpdatePayload,
  WorkoutPlan,
  WorkoutPlanCreatePayload,
  WorkoutPlanUpdatePayload,
} from "../../types/saas";
import {
  attendanceCreateSchema,
  attendanceUpdateSchema,
  dietPlanCreateSchema,
  dietPlanUpdateSchema,
  membershipPlanCreateSchema,
  membershipPlanUpdateSchema,
  paymentCreateSchema,
  paymentUpdateSchema,
  trainerCreateSchema,
  trainerUpdateSchema,
  workoutPlanCreateSchema,
  workoutPlanUpdateSchema,
} from "../../validation/operations";
import type { ResourceCrudConfig } from "./ResourceCrudPanel";
import { relatedDisplayName } from "../../utils/displayNames";
import {
  formatCurrency,
  formatDateTime,
  paymentTone,
} from "../../utils/formatters";

function json(value: unknown) {
  return JSON.stringify(value ?? {}, null, 2);
}

function jsonList(value: unknown) {
  return JSON.stringify(value ?? [], null, 2);
}

function text(value: unknown) {
  return value === null || value === undefined ? "" : String(value);
}

export const trainerConfig: ResourceCrudConfig<
  Trainer,
  TrainerCreatePayload,
  TrainerUpdatePayload
> = {
  key: "trainers",
  title: "Trainers",
  subtitle: "Manage trainers",
  icon: "barbell-outline",
  permission: "manage_trainers",
  api: trainersApi,
  createSchema: trainerCreateSchema,
  updateSchema: trainerUpdateSchema,
  deleteLabel: "Deactivate",
  deleteSuccessFallback: "Trainer was deactivated.",
  getTitle: (record) => record.full_name,
  getMeta: (record) =>
    record.email ?? record.phone ?? `${record.hourly_rate_cents} cents/hour`,
  getDetails: (record) => [
    `Gym: ${relatedDisplayName(record.gym_name, "Current gym")}`,
    `Linked user: ${relatedDisplayName(record.user_name, "Not linked")}`,
  ],
  getStatus: (record) => ({
    label: record.is_active ? "active" : "inactive",
    tone: record.is_active ? "success" : "warning",
  }),
  fields: [
    {
      name: "full_name",
      label: "Full name",
      valueFromRecord: (record) => record.full_name,
    },
    {
      name: "email",
      label: "Email",
      keyboardType: "email-address",
      valueFromRecord: (record) => text(record.email),
    },
    {
      name: "phone",
      label: "Phone",
      keyboardType: "phone-pad",
      valueFromRecord: (record) => text(record.phone),
    },
    {
      name: "bio",
      label: "Bio",
      multiline: true,
      valueFromRecord: (record) => text(record.bio),
    },
    {
      name: "specialties",
      label: "Specialties",
      placeholder: "strength, mobility",
      valueFromRecord: (record) => record.specialties.join(", "),
    },
    {
      name: "hourly_rate_cents",
      label: "Hourly rate cents",
      keyboardType: "numeric",
      defaultValue: "0",
      valueFromRecord: (record) => String(record.hourly_rate_cents),
    },
    {
      name: "commission_rate",
      label: "Commission rate",
      keyboardType: "numeric",
      defaultValue: "0",
      valueFromRecord: (record) => String(record.commission_rate),
    },
    {
      name: "user_id",
      label: "Linked user",
      createOnly: true,
      relation: "user",
      helperText: "Optional account to link with this trainer.",
    },
    {
      name: "extra_data",
      label: "Extra data JSON",
      multiline: true,
      defaultValue: "{}",
      valueFromRecord: (record) => json(record.extra_data),
    },
  ],
};

export const attendanceConfig: ResourceCrudConfig<
  Attendance,
  AttendanceCreatePayload,
  AttendanceUpdatePayload
> = {
  key: "attendance",
  title: "Attendance",
  subtitle: "Manage check-ins",
  icon: "qr-code-outline",
  permission: "manage_attendance",
  api: attendanceApi,
  createSchema: attendanceCreateSchema,
  updateSchema: attendanceUpdateSchema,
  deleteLabel: "Deactivate",
  deleteSuccessFallback: "Attendance entry was deactivated.",
  getTitle: (record) =>
    relatedDisplayName(record.member_name, "Member check-in"),
  getMeta: (record) =>
    `${record.source} - ${formatDateTime(record.check_in_at)}`,
  getDetails: (record) => [
    `Gym: ${relatedDisplayName(record.gym_name, "Current gym")}`,
    `Trainer: ${relatedDisplayName(record.trainer_name, "Not assigned")}`,
  ],
  getStatus: (record) => ({
    label: record.check_out_at ? "Checked out" : "Checked in",
    tone: record.check_out_at ? "neutral" : "success",
  }),
  fields: [
    {
      name: "member_id",
      label: "Member",
      createOnly: true,
      relation: "member",
      allowClear: false,
    },
    {
      name: "trainer_id",
      label: "Trainer",
      relation: "trainer",
      valueFromRecord: (record) => text(record.trainer_id),
    },
    { name: "check_in_at", label: "Check-in ISO datetime", createOnly: true },
    {
      name: "check_out_at",
      label: "Check-out ISO datetime",
      valueFromRecord: (record) => text(record.check_out_at),
    },
    {
      name: "source",
      label: "Source",
      defaultValue: "manual",
      valueFromRecord: (record) => record.source,
    },
    {
      name: "notes",
      label: "Notes",
      multiline: true,
      valueFromRecord: (record) => text(record.notes),
    },
    {
      name: "device_payload",
      label: "Device payload JSON",
      multiline: true,
      defaultValue: "{}",
      valueFromRecord: (record) => json(record.device_payload),
    },
  ],
};

export const paymentConfig: ResourceCrudConfig<
  Payment,
  PaymentCreatePayload,
  PaymentUpdatePayload
> = {
  key: "payments",
  title: "Payments",
  subtitle: "Manage payments",
  icon: "card-outline",
  permission: "manage_payments",
  api: paymentsApi,
  createSchema: paymentCreateSchema,
  updateSchema: paymentUpdateSchema,
  deleteLabel: "Deactivate",
  deleteSuccessFallback: "Payment was deactivated.",
  getTitle: (record) =>
    relatedDisplayName(record.member_name, "Member payment"),
  getMeta: (record) =>
    `${formatCurrency(record.amount_cents, record.currency)} - ${record.method}`,
  getDetails: (record) => [
    `Gym: ${relatedDisplayName(record.gym_name, "Current gym")}`,
    `Plan: ${relatedDisplayName(record.membership_plan_name, "Not assigned")}`,
  ],
  getStatus: (record) => ({
    label: record.status,
    tone: paymentTone(record.status),
  }),
  fields: [
    {
      name: "member_id",
      label: "Member",
      createOnly: true,
      relation: "member",
      allowClear: false,
    },
    {
      name: "membership_plan_id",
      label: "Membership plan",
      relation: "membershipPlan",
      valueFromRecord: (record) => text(record.membership_plan_id),
    },
    {
      name: "amount_cents",
      label: "Amount cents",
      keyboardType: "numeric",
      valueFromRecord: (record) => String(record.amount_cents),
    },
    {
      name: "currency",
      label: "Currency",
      defaultValue: "INR",
      valueFromRecord: () => "INR",
    },
    {
      name: "method",
      label: "Method",
      valueFromRecord: (record) => record.method,
    },
    {
      name: "status",
      label: "Status",
      defaultValue: "pending",
      valueFromRecord: (record) => record.status,
    },
    {
      name: "provider_reference",
      label: "Provider reference",
      valueFromRecord: (record) => text(record.provider_reference),
    },
    {
      name: "paid_at",
      label: "Paid at ISO datetime",
      valueFromRecord: (record) => text(record.paid_at),
    },
    {
      name: "extra_data",
      label: "Extra data JSON",
      multiline: true,
      defaultValue: "{}",
      valueFromRecord: (record) => json(record.extra_data),
    },
  ],
};

export const membershipPlanConfig: ResourceCrudConfig<
  MembershipPlan,
  MembershipPlanCreatePayload,
  MembershipPlanUpdatePayload
> = {
  key: "membership-plans",
  title: "Membership Plans",
  subtitle: "Manage packages",
  icon: "pricetag-outline",
  permission: "manage_membership_plans",
  api: membershipPlansApi,
  createSchema: membershipPlanCreateSchema,
  updateSchema: membershipPlanUpdateSchema,
  deleteLabel: "Deactivate",
  deleteSuccessFallback: "Membership plan was deactivated.",
  getTitle: (record) => record.name,
  getMeta: (record) =>
    `${record.duration_days} days - ${formatCurrency(record.price_cents, record.currency)}`,
  getDetails: (record) => [
    `Gym: ${relatedDisplayName(record.gym_name, "Current gym")}`,
  ],
  getStatus: (record) => ({
    label: record.is_active ? "active" : "inactive",
    tone: record.is_active ? "success" : "warning",
  }),
  fields: [
    { name: "name", label: "Name", valueFromRecord: (record) => record.name },
    {
      name: "description",
      label: "Description",
      multiline: true,
      valueFromRecord: (record) => text(record.description),
    },
    {
      name: "duration_days",
      label: "Duration days",
      keyboardType: "numeric",
      valueFromRecord: (record) => String(record.duration_days),
    },
    {
      name: "price_cents",
      label: "Price cents",
      keyboardType: "numeric",
      valueFromRecord: (record) => String(record.price_cents),
    },
    {
      name: "currency",
      label: "Currency",
      defaultValue: "INR",
      valueFromRecord: () => "INR",
    },
    {
      name: "features",
      label: "Features",
      placeholder: "sauna, trainer access",
      valueFromRecord: (record) => record.features.join(", "),
    },
  ],
};

export const workoutPlanConfig: ResourceCrudConfig<
  WorkoutPlan,
  WorkoutPlanCreatePayload,
  WorkoutPlanUpdatePayload
> = {
  key: "workout-plans",
  title: "Workout Plans",
  subtitle: "Manage workouts",
  icon: "fitness-outline",
  permission: "manage_workouts",
  api: workoutPlansApi,
  createSchema: workoutPlanCreateSchema,
  updateSchema: workoutPlanUpdateSchema,
  deleteLabel: "Deactivate",
  deleteSuccessFallback: "Workout plan was deactivated.",
  getTitle: (record) => record.title,
  getMeta: (record) => `${record.goal} - ${record.level}`,
  getDetails: (record) => [
    `Member: ${relatedDisplayName(record.member_name, "Not assigned")}`,
    `Trainer: ${relatedDisplayName(record.trainer_name, "Not assigned")}`,
    `Gym: ${relatedDisplayName(record.gym_name, "Current gym")}`,
  ],
  getStatus: (record) => ({
    label: record.is_active ? "active" : "inactive",
    tone: record.is_active ? "success" : "warning",
  }),
  fields: [
    {
      name: "member_id",
      label: "Member",
      createOnly: true,
      relation: "member",
      allowClear: false,
    },
    {
      name: "trainer_id",
      label: "Trainer",
      relation: "trainer",
      valueFromRecord: (record) => text(record.trainer_id),
    },
    {
      name: "title",
      label: "Title",
      valueFromRecord: (record) => record.title,
    },
    { name: "goal", label: "Goal", valueFromRecord: (record) => record.goal },
    {
      name: "level",
      label: "Level",
      valueFromRecord: (record) => record.level,
    },
    {
      name: "starts_at",
      label: "Starts at YYYY-MM-DD",
      valueFromRecord: (record) => text(record.starts_at),
    },
    {
      name: "ends_at",
      label: "Ends at YYYY-MM-DD",
      valueFromRecord: (record) => text(record.ends_at),
    },
    {
      name: "sessions",
      label: "Male & female workout sessions",
      catalog: "workout",
      defaultValue: "[]",
      valueFromRecord: (record) => jsonList(record.sessions),
    },
  ],
};

export const dietPlanConfig: ResourceCrudConfig<
  DietPlan,
  DietPlanCreatePayload,
  DietPlanUpdatePayload
> = {
  key: "diet-plans",
  title: "Diet Plans",
  subtitle: "Manage nutrition",
  icon: "restaurant-outline",
  permission: "manage_diet_plans",
  api: dietPlansApi,
  createSchema: dietPlanCreateSchema,
  updateSchema: dietPlanUpdateSchema,
  deleteLabel: "Deactivate",
  deleteSuccessFallback: "Diet plan was deactivated.",
  getTitle: (record) => record.title,
  getMeta: (record) => `${record.calories_per_day} calories/day`,
  getDetails: (record) => [
    `Member: ${relatedDisplayName(record.member_name, "Not assigned")}`,
    `Trainer: ${relatedDisplayName(record.trainer_name, "Not assigned")}`,
    `Gym: ${relatedDisplayName(record.gym_name, "Current gym")}`,
  ],
  getStatus: (record) => ({
    label: record.is_active ? "active" : "inactive",
    tone: record.is_active ? "success" : "warning",
  }),
  fields: [
    {
      name: "member_id",
      label: "Member",
      createOnly: true,
      relation: "member",
      allowClear: false,
    },
    {
      name: "trainer_id",
      label: "Trainer",
      relation: "trainer",
      valueFromRecord: (record) => text(record.trainer_id),
    },
    {
      name: "title",
      label: "Title",
      choices: [
        "Weight Loss",
        "Muscle Gain",
        "Maintenance",
        "Medical",
        "Custom",
      ],
      defaultValue: "Custom",
      syncField: "category",
      valueFromRecord: (record) => record.title,
    },
    {
      name: "category",
      label: "Plan category",
      defaultValue: "Custom",
      hidden: true,
      valueFromRecord: (record) => record.category,
    },
    {
      name: "calories_per_day",
      label: "Calories per day",
      helperText:
        "A suggested target is added from the title. You can edit it.",
      keyboardType: "numeric",
      valueFromRecord: (record) => String(record.calories_per_day),
    },
    {
      name: "starts_at",
      label: "Starts on",
      datePicker: true,
      valueFromRecord: (record) => text(record.starts_at),
    },
    {
      name: "ends_at",
      label: "Ends on",
      datePicker: true,
      valueFromRecord: (record) => text(record.ends_at),
    },
    {
      name: "meals",
      label: "Foods and meals",
      catalog: "food",
      defaultValue: "[]",
      valueFromRecord: (record) => jsonList(record.meals),
    },
  ],
};

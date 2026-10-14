import { z } from "zod";

import type {
  AttendanceCreatePayload,
  AttendanceUpdatePayload,
  DietPlanCreatePayload,
  DietPlanUpdatePayload,
  GymCreatePayload,
  GymUpdatePayload,
  JsonObject,
  MembershipPlanCreatePayload,
  MembershipPlanUpdatePayload,
  PaymentCreatePayload,
  PaymentUpdatePayload,
  TrainerCreatePayload,
  TrainerUpdatePayload,
  WorkoutPlanCreatePayload,
  WorkoutPlanUpdatePayload,
} from "../types/saas";
import { normalizeCurrencyCode } from "../utils/formatters";

const emailSchema = z.string().email("Enter a valid email");
const uuidSchema = z.string().uuid("Enter a valid UUID");
const currencyCodeSchema = z
  .string()
  .regex(/^[A-Z]{3}$/, "Enter a valid 3-letter ISO currency code");

function blankToUndefined(value: unknown) {
  return typeof value === "string" && value.trim() === "" ? undefined : value;
}

function blankToNull(value: unknown) {
  return typeof value === "string" && value.trim() === "" ? null : value;
}

function optionalText(max: number, label: string) {
  return z.preprocess(
    blankToUndefined,
    z
      .string()
      .trim()
      .max(max, `${label} must be ${max} characters or fewer`)
      .optional(),
  );
}

function nullableText(max: number, label: string) {
  return z.preprocess(
    blankToNull,
    z
      .string()
      .trim()
      .max(max, `${label} must be ${max} characters or fewer`)
      .nullable()
      .optional(),
  );
}

function optionalEmail() {
  return z.preprocess(blankToUndefined, emailSchema.optional());
}

function nullableEmail() {
  return z.preprocess(blankToNull, emailSchema.nullable().optional());
}

function optionalUuid() {
  return z.preprocess(blankToUndefined, uuidSchema.optional());
}

function nullableUuid() {
  return z.preprocess(blankToNull, uuidSchema.nullable().optional());
}

function normalizeCurrencyInput(value: unknown) {
  if (typeof value !== "string") {
    return value === null ? undefined : value;
  }

  const trimmed = value.trim();
  return trimmed ? normalizeCurrencyCode(trimmed) : undefined;
}

function currencyCode(defaultValue = "INR") {
  return z.preprocess(
    normalizeCurrencyInput,
    currencyCodeSchema.default(defaultValue),
  );
}

function optionalCurrencyCode() {
  return z.preprocess(normalizeCurrencyInput, currencyCodeSchema.optional());
}

function jsonObject(defaultValue: JsonObject = {}) {
  return z
    .string()
    .default(JSON.stringify(defaultValue))
    .transform((value, context) => {
      try {
        const parsed = JSON.parse(value || "{}") as unknown;
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
          context.addIssue({ code: "custom", message: "Enter a JSON object" });
          return z.NEVER;
        }
        return parsed as JsonObject;
      } catch {
        context.addIssue({ code: "custom", message: "Enter valid JSON" });
        return z.NEVER;
      }
    });
}

function optionalJsonObject() {
  return z
    .string()
    .optional()
    .transform((value, context) => {
      if (value === undefined || value.trim() === "") {
        return undefined;
      }

      try {
        const parsed = JSON.parse(value) as unknown;
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
          context.addIssue({ code: "custom", message: "Enter a JSON object" });
          return z.NEVER;
        }
        return parsed as JsonObject;
      } catch {
        context.addIssue({ code: "custom", message: "Enter valid JSON" });
        return z.NEVER;
      }
    });
}

function jsonObjectList() {
  return z
    .string()
    .default("[]")
    .transform((value, context) => {
      try {
        const parsed = JSON.parse(value || "[]") as unknown;
        if (
          !Array.isArray(parsed) ||
          parsed.some(
            (item) => !item || typeof item !== "object" || Array.isArray(item),
          )
        ) {
          context.addIssue({
            code: "custom",
            message: "Enter a JSON array of objects",
          });
          return z.NEVER;
        }
        return parsed as JsonObject[];
      } catch {
        context.addIssue({ code: "custom", message: "Enter valid JSON" });
        return z.NEVER;
      }
    });
}

function optionalJsonObjectList() {
  return z
    .string()
    .optional()
    .transform((value, context) => {
      if (value === undefined || value.trim() === "") {
        return undefined;
      }

      try {
        const parsed = JSON.parse(value) as unknown;
        if (
          !Array.isArray(parsed) ||
          parsed.some(
            (item) => !item || typeof item !== "object" || Array.isArray(item),
          )
        ) {
          context.addIssue({
            code: "custom",
            message: "Enter a JSON array of objects",
          });
          return z.NEVER;
        }
        return parsed as JsonObject[];
      } catch {
        context.addIssue({ code: "custom", message: "Enter valid JSON" });
        return z.NEVER;
      }
    });
}

function stringList() {
  return z
    .string()
    .default("")
    .transform((value) =>
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    );
}

function optionalStringList() {
  return z
    .string()
    .optional()
    .transform((value) =>
      value === undefined
        ? undefined
        : value
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
    );
}

export const gymCreateSchema: z.ZodType<GymCreatePayload> = z.object({
  name: z.string().trim().min(2).max(180),
  email: optionalEmail(),
  phone: optionalText(40, "Phone"),
  address: optionalText(500, "Address"),
  timezone: z.string().trim().max(80).default("UTC"),
});

export const gymUpdateSchema: z.ZodType<GymUpdatePayload> = z.object({
  name: z.string().trim().min(2).max(180).optional(),
  email: nullableEmail(),
  phone: nullableText(40, "Phone"),
  address: nullableText(500, "Address"),
  timezone: nullableText(80, "Timezone"),
  settings: optionalJsonObject().nullable(),
});

export const trainerCreateSchema: z.ZodType<TrainerCreatePayload> = z.object({
  full_name: z.string().trim().min(2).max(180),
  email: optionalEmail(),
  phone: optionalText(40, "Phone"),
  bio: optionalText(1200, "Bio"),
  specialties: stringList(),
  hourly_rate_cents: z.coerce.number().int().default(0),
  commission_rate: z.coerce.number().default(0),
  user_id: optionalUuid(),
  extra_data: jsonObject(),
});

export const trainerUpdateSchema: z.ZodType<TrainerUpdatePayload> = z.object({
  full_name: z.string().trim().min(2).max(180).optional(),
  email: nullableEmail(),
  phone: nullableText(40, "Phone"),
  bio: nullableText(1200, "Bio"),
  specialties: optionalStringList().nullable(),
  hourly_rate_cents: z.coerce.number().int().nullable().optional(),
  commission_rate: z.coerce.number().nullable().optional(),
  extra_data: optionalJsonObject().nullable(),
});

export const attendanceCreateSchema: z.ZodType<AttendanceCreatePayload> =
  z.object({
    member_id: uuidSchema,
    trainer_id: optionalUuid(),
    check_in_at: z.string().datetime("Use ISO datetime format"),
    check_out_at: z.preprocess(
      blankToUndefined,
      z.string().datetime("Use ISO datetime format").optional(),
    ),
    source: z
      .enum(["qr_code", "barcode", "manual", "offline_sync"])
      .default("manual"),
    notes: optionalText(600, "Notes"),
    device_payload: jsonObject(),
  });

export const attendanceUpdateSchema: z.ZodType<AttendanceUpdatePayload> =
  z.object({
    trainer_id: nullableUuid(),
    check_out_at: z.preprocess(
      blankToNull,
      z.string().datetime("Use ISO datetime format").nullable().optional(),
    ),
    source: z
      .enum(["qr_code", "barcode", "manual", "offline_sync"])
      .nullable()
      .optional(),
    notes: nullableText(600, "Notes"),
    device_payload: optionalJsonObject().nullable(),
  });

export const paymentCreateSchema: z.ZodType<PaymentCreatePayload> = z.object({
  member_id: uuidSchema,
  membership_plan_id: optionalUuid(),
  amount_cents: z.coerce.number().int().gt(0),
  currency: currencyCode(),
  method: z.string().trim().min(2).max(80),
  status: z.enum(["pending", "paid", "failed", "refunded"]).default("pending"),
  provider_reference: optionalText(180, "Provider reference"),
  paid_at: z.preprocess(
    blankToUndefined,
    z.string().datetime("Use ISO datetime format").optional(),
  ),
  extra_data: jsonObject(),
});

export const paymentUpdateSchema: z.ZodType<PaymentUpdatePayload> = z.object({
  membership_plan_id: nullableUuid(),
  amount_cents: z.coerce.number().int().gt(0).nullable().optional(),
  currency: optionalCurrencyCode(),
  method: z.preprocess(
    blankToNull,
    z.string().trim().min(2).max(80).nullable().optional(),
  ),
  status: z
    .enum(["pending", "paid", "failed", "refunded"])
    .nullable()
    .optional(),
  provider_reference: nullableText(180, "Provider reference"),
  paid_at: z.preprocess(
    blankToNull,
    z.string().datetime("Use ISO datetime format").nullable().optional(),
  ),
  extra_data: optionalJsonObject().nullable(),
});

export const membershipPlanCreateSchema: z.ZodType<MembershipPlanCreatePayload> =
  z.object({
    name: z.string().trim().min(2).max(160),
    description: optionalText(800, "Description"),
    duration_days: z.coerce.number().int().gt(0),
    price_cents: z.coerce.number().int().gte(0),
    currency: currencyCode(),
    features: stringList(),
  });

export const membershipPlanUpdateSchema: z.ZodType<MembershipPlanUpdatePayload> =
  z.object({
    name: z.string().trim().min(2).max(160).optional(),
    description: nullableText(800, "Description"),
    duration_days: z.coerce.number().int().gt(0).nullable().optional(),
    price_cents: z.coerce.number().int().gte(0).nullable().optional(),
    currency: optionalCurrencyCode(),
    features: optionalStringList().nullable(),
  });

export const workoutPlanCreateSchema: z.ZodType<WorkoutPlanCreatePayload> =
  z.object({
    member_id: uuidSchema,
    trainer_id: optionalUuid(),
    title: z.string().trim().min(2).max(180),
    goal: z.string().trim().min(2).max(120),
    level: z.string().trim().min(2).max(80),
    starts_at: optionalText(10, "Start date"),
    ends_at: optionalText(10, "End date"),
    sessions: jsonObjectList(),
  });

export const workoutPlanUpdateSchema: z.ZodType<WorkoutPlanUpdatePayload> =
  z.object({
    trainer_id: nullableUuid(),
    title: z.string().trim().min(2).max(180).optional(),
    goal: z.string().trim().min(2).max(120).optional(),
    level: z.string().trim().min(2).max(80).optional(),
    starts_at: nullableText(10, "Start date"),
    ends_at: nullableText(10, "End date"),
    sessions: optionalJsonObjectList().nullable(),
  });

export const dietPlanCreateSchema: z.ZodType<DietPlanCreatePayload> = z.object({
  member_id: uuidSchema,
  trainer_id: optionalUuid(),
  title: z.string().trim().min(2).max(180),
  category: z.enum([
    "Weight Loss",
    "Muscle Gain",
    "Maintenance",
    "Medical",
    "Custom",
  ]),
  calories_per_day: z.coerce.number().int().gt(0),
  starts_at: optionalText(10, "Start date"),
  ends_at: optionalText(10, "End date"),
  meals: jsonObjectList(),
});

export const dietPlanUpdateSchema: z.ZodType<DietPlanUpdatePayload> = z.object({
  trainer_id: nullableUuid(),
  title: z.string().trim().min(2).max(180).optional(),
  category: z
    .enum(["Weight Loss", "Muscle Gain", "Maintenance", "Medical", "Custom"])
    .optional(),
  calories_per_day: z.coerce.number().int().gt(0).nullable().optional(),
  starts_at: nullableText(10, "Start date"),
  ends_at: nullableText(10, "End date"),
  meals: optionalJsonObjectList().nullable(),
});

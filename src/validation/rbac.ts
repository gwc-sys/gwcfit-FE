import { z } from "zod";

const emailSchema = z.string().email("Enter a valid email");
const uuidSchema = z.string().uuid("Enter a valid UUID");

function utf8ByteLength(value: string) {
  let bytes = 0;

  for (let index = 0; index < value.length; index += 1) {
    const codePoint = value.codePointAt(index) ?? 0;

    if (codePoint > 0xffff) {
      index += 1;
    }

    if (codePoint <= 0x7f) {
      bytes += 1;
    } else if (codePoint <= 0x7ff) {
      bytes += 2;
    } else if (codePoint <= 0xffff) {
      bytes += 3;
    } else {
      bytes += 4;
    }
  }

  return bytes;
}

function optionalText(maxLength: number, label: string) {
  return z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().max(maxLength, `${label} must be ${maxLength} characters or fewer`).optional()
  );
}

function optionalEmail() {
  return z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    emailSchema.optional()
  );
}

function optionalUuid() {
  return z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    uuidSchema.optional()
  );
}

function nullableUuid() {
  return z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? null : value),
    uuidSchema.nullable().optional()
  );
}

function optionalDate() {
  return z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD").optional()
  );
}

function nullableDate() {
  return z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? null : value),
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD").nullable().optional()
  );
}

export const gymAdminCreateSchema = z.object({
  gym_name: z.string().trim().min(2, "Gym name must be at least 2 characters").max(180),
  gym_email: optionalEmail(),
  gym_phone: optionalText(40, "Gym phone"),
  gym_address: optionalText(500, "Gym address"),
  gym_timezone: z.string().trim().max(80).default("UTC"),
  admin_full_name: z.string().trim().min(2, "Admin name must be at least 2 characters").max(180),
  admin_email: emailSchema,
  admin_password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be 72 characters or fewer")
    .refine((value) => utf8ByteLength(value) <= 72, "Password must be 72 bytes or fewer"),
  admin_phone: optionalText(40, "Admin phone")
});

export const memberCreateSchema = z.object({
  member_code: z.string().trim().min(2, "Member code must be at least 2 characters").max(40),
  first_name: z.string().trim().min(1, "First name is required").max(120),
  last_name: z.string().trim().min(1, "Last name is required").max(120),
  email: optionalEmail(),
  phone: optionalText(40, "Phone"),
  status: z.string().trim().max(40).default("active"),
  trainer_id: optionalUuid(),
  membership_plan_id: optionalUuid(),
  membership_starts_at: optionalDate(),
  membership_ends_at: optionalDate()
});

export const memberUpdateSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required").max(120),
  last_name: z.string().trim().min(1, "Last name is required").max(120),
  email: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? null : value),
    emailSchema.nullable()
  ),
  phone: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? null : value),
    z.string().trim().max(40, "Phone must be 40 characters or fewer").nullable()
  ),
  status: z.string().trim().max(40),
  trainer_id: nullableUuid(),
  membership_plan_id: nullableUuid(),
  membership_starts_at: nullableDate(),
  membership_ends_at: nullableDate()
});

export type GymAdminCreateFormValues = z.input<typeof gymAdminCreateSchema>;
export type MemberCreateFormValues = z.input<typeof memberCreateSchema>;
export type MemberUpdateFormValues = z.input<typeof memberUpdateSchema>;

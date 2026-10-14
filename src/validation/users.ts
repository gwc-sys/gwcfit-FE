import { z } from "zod";

import type { UserCreatePayload, UserUpdatePayload } from "../types/saas";

const emailSchema = z.string().trim().email("Enter a valid email");
const roleSchema = z.enum(["member", "trainer", "receptionist", "sub_admin", "gym_owner"]);
const statusSchema = z.enum(["active", "inactive"]);

function blankToUndefined(value: unknown) {
  return typeof value === "string" && value.trim() === "" ? undefined : value;
}

function optionalText(max: number, label: string) {
  return z.preprocess(
    blankToUndefined,
    z.string().trim().max(max, `${label} must be ${max} characters or fewer`).optional()
  );
}

function password(label = "Password") {
  return z
    .string()
    .min(8, `${label} must be at least 8 characters`)
    .max(72, `${label} must be 72 characters or fewer`)
    .refine((value) => byteLength(value) <= 72, `${label} must be 72 bytes or fewer`);
}

function optionalPassword() {
  return z.preprocess(blankToUndefined, password("Password").optional());
}

function byteLength(value: string) {
  let bytes = 0;
  for (let index = 0; index < value.length; index += 1) {
    const codePoint = value.codePointAt(index) ?? 0;
    if (codePoint > 0xffff) {
      index += 1;
    }
    bytes += codePoint <= 0x7f ? 1 : codePoint <= 0x7ff ? 2 : codePoint <= 0xffff ? 3 : 4;
  }
  return bytes;
}

export const userCreateSchema: z.ZodType<UserCreatePayload> = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(180),
  email: emailSchema,
  password: password(),
  phone: optionalText(40, "Phone"),
  role: roleSchema.default("member"),
  status: statusSchema.default("active"),
  gym_id: optionalText(80, "Gym")
});

export const userUpdateSchema: z.ZodType<UserUpdatePayload> = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(180).optional(),
  email: emailSchema.optional(),
  password: optionalPassword(),
  phone: optionalText(40, "Phone"),
  role: roleSchema.optional(),
  status: statusSchema.optional(),
  gym_id: optionalText(80, "Gym")
});

export type UserCreateFormValues = z.input<typeof userCreateSchema>;
export type UserUpdateFormValues = z.input<typeof userUpdateSchema>;

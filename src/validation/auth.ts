import { z } from "zod";

const email = z.string().email("Enter a valid email");

function password(label = "Password") {
  return z
    .string()
    .min(8, `${label} must be at least 8 characters`)
    .max(72, `${label} must be 72 characters or fewer`)
    .refine((value) => byteLength(value) <= 72, `${label} must be 72 bytes or fewer`);
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

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required").max(72)
});

export const ownerRegistrationSchema = z.object({
  gym_name: z.string().trim().min(2).max(180),
  full_name: z.string().trim().min(2).max(180),
  email,
  password: password(),
  phone: z
    .preprocess((value) => (typeof value === "string" && value.trim() === "" ? undefined : value), z.string().trim().max(40).optional()),
  invitation_token: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().optional()
  )
});

export const gymUserRegistrationSchema = z.object({
  gym_id: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().uuid().optional()
  ),
  gym_name: z.string().trim().min(2, "Gym name must be at least 2 characters").max(180),
  full_name: z.string().trim().min(2).max(180),
  email,
  password: password(),
  role: z.enum(["sub_admin", "trainer", "receptionist", "member"]).default("member"),
  invitation_token: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().optional()
  )
});

export const forgotPasswordSchema = z.object({
  email
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  new_password: password("New password")
});

export const changePasswordSchema = z.object({
  old_password: z.string().max(72, "Old password must be 72 characters or fewer"),
  new_password: password("New password")
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, "Token is required")
});

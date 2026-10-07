import { z } from "zod";

// Error messages are i18n keys resolved in the UI (namespace "validation").
// Minimum length mirrors the backend's AUTH_PASSWORD_VALIDATORS.
const password = z.string().min(10, { error: "passwordMin" });

export const loginSchema = z.object({
  email: z.email({ error: "email" }),
  password: z.string().min(1, { error: "required" }),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const totpSchema = z.object({
  code: z.string().regex(/^\d{6}$/, { error: "totpCode" }),
});
export type TotpValues = z.infer<typeof totpSchema>;

export const registerSchema = z
  .object({
    email: z.email({ error: "email" }),
    password,
    passwordConfirm: z.string(),
    role: z.enum(["participant", "researcher"]),
    acceptTerms: z.boolean().refine((v) => v, { error: "acceptTerms" }),
  })
  .refine((v) => v.password === v.passwordConfirm, {
    error: "passwordMismatch",
    path: ["passwordConfirm"],
  });
export type RegisterValues = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({ email: z.email({ error: "email" }) });
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({ password, passwordConfirm: z.string() })
  .refine((v) => v.password === v.passwordConfirm, { error: "passwordMismatch", path: ["passwordConfirm"] });
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, { error: "required" }),
    password,
    passwordConfirm: z.string(),
  })
  .refine((v) => v.password === v.passwordConfirm, { error: "passwordMismatch", path: ["passwordConfirm"] });
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

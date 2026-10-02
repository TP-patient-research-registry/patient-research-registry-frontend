import { z } from "zod";

// Error messages are i18n keys resolved in the UI (namespace "validation").
export const loginSchema = z.object({
  email: z.email({ error: "email" }),
  password: z.string().min(1, { error: "required" }),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    email: z.email({ error: "email" }),
    password: z.string().min(8, { error: "passwordMin" }),
    passwordConfirm: z.string(),
    role: z.enum(["participant", "researcher"]),
  })
  .refine((v) => v.password === v.passwordConfirm, {
    error: "passwordMismatch",
    path: ["passwordConfirm"],
  });
export type RegisterValues = z.infer<typeof registerSchema>;

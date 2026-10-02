import { z } from "zod";

// TODO: health/demographic fields required for study matching.
export const profileSchema = z.object({
  firstName: z.string().min(1, { error: "required" }),
  lastName: z.string().min(1, { error: "required" }),
});
export type ProfileValues = z.infer<typeof profileSchema>;

import { z } from "zod";

// TODO: extend with eligibility criteria, locations, dates once the backend model is final.
export const studySchema = z.object({
  title: z.string().min(1, { error: "required" }),
  description: z.string().min(1, { error: "required" }),
});
export type StudyValues = z.infer<typeof studySchema>;

export const studySearchSchema = z.object({
  query: z.string().optional(),
});
export type StudySearchValues = z.infer<typeof studySearchSchema>;

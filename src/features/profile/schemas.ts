import { z } from "zod";

import { REGIONS, SEXES } from "@/lib/api/types";
import { invalidIcd10Codes } from "@/lib/icd10";

const currentYear = new Date().getFullYear();

// Error messages are i18n keys resolved in the UI (namespace "validation").
export const profileSchema = z.object({
  birth_year: z
    .string()
    .trim()
    .refine((v) => v === "" || (/^\d{4}$/.test(v) && Number(v) >= 1900 && Number(v) <= currentYear), {
      error: "birthYear",
    }),
  sex: z.union([z.enum(SEXES), z.literal("")]),
  region: z.union([z.enum(REGIONS), z.literal("")]),
  diagnoses: z.string().refine((v) => invalidIcd10Codes(v).length === 0, { error: "icd10" }),
});
export type ProfileValues = z.infer<typeof profileSchema>;

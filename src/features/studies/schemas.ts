import { z } from "zod";

import { CRITERIA_SEXES, type EligibilityCriteria, REGIONS, type ResearcherStudy } from "@/lib/api/types";
import { invalidIcd10Codes, parseIcd10Codes } from "@/lib/icd10";

import type { StudyInput } from "./api";

// Error messages are i18n keys resolved in the UI (namespace "validation").
const optionalAge = z
  .string()
  .trim()
  .refine((v) => v === "" || (/^\d{1,3}$/.test(v) && Number(v) <= 120), { error: "age" });

export const studyFormSchema = z
  .object({
    title: z.string().trim().min(1, { error: "required" }).max(255, { error: "tooLong" }),
    description: z.string().trim().min(1, { error: "required" }),
    results_summary: z.string(),
    min_age: optionalAge,
    max_age: optionalAge,
    sex: z.enum(CRITERIA_SEXES),
    regions: z.array(z.enum(REGIONS)),
    diagnoses: z.string().refine((v) => invalidIcd10Codes(v).length === 0, { error: "icd10" }),
  })
  .refine((v) => v.min_age === "" || v.max_age === "" || Number(v.min_age) <= Number(v.max_age), {
    error: "ageRange",
    path: ["max_age"],
  });
export type StudyFormValues = z.infer<typeof studyFormSchema>;

export const emptyStudyForm: StudyFormValues = {
  title: "",
  description: "",
  results_summary: "",
  min_age: "",
  max_age: "",
  sex: "any",
  regions: [],
  diagnoses: "",
};

export function studyToForm(study: ResearcherStudy): StudyFormValues {
  const c = study.criteria ?? {};
  return {
    title: study.title,
    description: study.description,
    results_summary: study.results_summary ?? "",
    min_age: c.min_age == null ? "" : String(c.min_age),
    max_age: c.max_age == null ? "" : String(c.max_age),
    sex: c.sex ?? "any",
    regions: c.regions ?? [],
    diagnoses: (c.diagnoses ?? []).join(", "),
  };
}

export function formToPayload(values: StudyFormValues): { study: StudyInput; criteria: EligibilityCriteria } {
  return {
    study: { title: values.title, description: values.description, results_summary: values.results_summary },
    criteria: {
      min_age: values.min_age === "" ? null : Number(values.min_age),
      max_age: values.max_age === "" ? null : Number(values.max_age),
      sex: values.sex,
      regions: values.regions,
      diagnoses: parseIcd10Codes(values.diagnoses),
    },
  };
}

export const studySearchSchema = z.object({
  query: z.string().optional(),
});
export type StudySearchValues = z.infer<typeof studySearchSchema>;

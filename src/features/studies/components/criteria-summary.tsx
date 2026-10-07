"use client";

import { useTranslations } from "next-intl";

import type { EligibilityCriteria } from "@/lib/api/types";

/** Human-readable list of a study's eligibility criteria. */
export function useCriteriaLines(criteria: EligibilityCriteria | undefined): string[] {
  const t = useTranslations("studies.criteria");
  const tRegion = useTranslations("enums.region");
  const tSex = useTranslations("enums.criteriaSex");
  if (!criteria) return [];

  const lines: string[] = [];
  const { min_age: min, max_age: max, sex, regions = [], diagnoses = [] } = criteria;
  if (min != null && max != null) lines.push(t("ageRange", { min, max }));
  else if (min != null) lines.push(t("ageMin", { min }));
  else if (max != null) lines.push(t("ageMax", { max }));
  if (sex && sex !== "any") lines.push(t("sex", { sex: tSex(sex) }));
  if (regions.length) lines.push(t("regions", { regions: regions.map((r) => tRegion(r)).join(", ") }));
  if (diagnoses.length) lines.push(t("diagnoses", { codes: diagnoses.join(", ") }));
  return lines;
}

export function CriteriaSummary({ criteria }: { criteria: EligibilityCriteria | undefined }) {
  const t = useTranslations("studies.criteria");
  const lines = useCriteriaLines(criteria);
  if (!lines.length) return <p className="text-sm text-muted-foreground">{t("none")}</p>;
  return (
    <ul className="list-disc space-y-1 pl-5 text-sm">
      {lines.map((line) => (
        <li key={line}>{line}</li>
      ))}
    </ul>
  );
}

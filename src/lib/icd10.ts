import { ICD10_PATTERN } from "@/lib/api/types";

/** "e11, i10  J45.9" → ["E11", "I10", "J45.9"] (deduplicated). */
export function parseIcd10Codes(input: string): string[] {
  const codes = input
    .split(/[\s,;]+/)
    .map((code) => code.trim().toUpperCase())
    .filter(Boolean);
  return [...new Set(codes)];
}

export function invalidIcd10Codes(input: string): string[] {
  return parseIcd10Codes(input).filter((code) => !ICD10_PATTERN.test(code));
}

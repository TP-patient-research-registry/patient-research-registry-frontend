import { describe, expect, it } from "vitest";

import { invalidIcd10Codes, parseIcd10Codes } from "./icd10";

describe("parseIcd10Codes", () => {
  it("normalises, splits and deduplicates", () => {
    expect(parseIcd10Codes(" e11, i10;E11  j45.9 ")).toEqual(["E11", "I10", "J45.9"]);
  });

  it("returns an empty list for blank input", () => {
    expect(parseIcd10Codes("  ")).toEqual([]);
  });
});

describe("invalidIcd10Codes", () => {
  it("reports codes that are not ICD-10", () => {
    expect(invalidIcd10Codes("E11, diabetes, I1")).toEqual(["DIABETES", "I1"]);
  });
});

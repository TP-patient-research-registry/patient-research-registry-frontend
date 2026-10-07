import { describe, expect, it } from "vitest";

import { getRequiredRoles, safeNextPath } from "./roles";

describe("getRequiredRoles", () => {
  it("leaves public routes unguarded", () => {
    expect(getRequiredRoles("/")).toBeNull();
    expect(getRequiredRoles("/studies/42")).toBeNull();
    expect(getRequiredRoles("/participants-info")).toBeNull();
  });

  it("guards the participant area", () => {
    expect(getRequiredRoles("/participant/dashboard")).toEqual(["participant"]);
  });

  it("allows researchers and organizations in the researcher area", () => {
    expect(getRequiredRoles("/researcher/studies/1/participants")).toEqual(["researcher", "organization"]);
  });
});

describe("safeNextPath", () => {
  const locales = ["sk", "en"];

  it("strips the locale prefix", () => {
    expect(safeNextPath("/en/participant/profile?x=1", locales)).toBe("/participant/profile?x=1");
  });

  it.each(["https://evil.example", "//evil.example", "/\\evil.example", "", null])("rejects %j", (next) => {
    expect(safeNextPath(next, locales)).toBeNull();
  });
});

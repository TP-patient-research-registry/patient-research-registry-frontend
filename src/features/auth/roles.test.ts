import { describe, expect, it } from "vitest";

import { getRequiredRoles } from "./roles";

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

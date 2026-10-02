import { describe, expect, it } from "vitest";

import { parseSession } from "./api";

describe("parseSession", () => {
  it("returns an authenticated session for a known role", () => {
    expect(parseSession({ user: { id: 1, email: "a@b.sk", role: "researcher" } })).toEqual({
      isAuthenticated: true,
      user: { id: "1", email: "a@b.sk", role: "researcher" },
    });
  });

  it.each([null, {}, { user: null }, { user: { role: "admin" } }])("treats %j as anonymous", (data) => {
    expect(parseSession(data).isAuthenticated).toBe(false);
  });
});

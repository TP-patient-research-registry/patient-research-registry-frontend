import { describe, expect, it } from "vitest";

import { getCsrfToken } from "./csrf";

describe("getCsrfToken", () => {
  it("reads the csrftoken cookie", () => {
    expect(getCsrfToken("sessionid=abc; csrftoken=tok%3D1; other=x")).toBe("tok=1");
  });

  it("returns undefined when missing", () => {
    expect(getCsrfToken("sessionid=abc")).toBeUndefined();
  });
});

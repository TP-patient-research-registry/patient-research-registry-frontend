import { describe, expect, it } from "vitest";

import { toCsv } from "./csv";

describe("toCsv", () => {
  it("quotes special characters and neutralises formulas", () => {
    expect(
      toCsv([
        ["a", 'b "c"', "d,e"],
        ["=SUM(A1)", null, 3],
      ]),
    ).toBe('﻿a,"b ""c""","d,e"\r\n\'=SUM(A1),,3');
  });
});

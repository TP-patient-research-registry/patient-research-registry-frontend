import { describe, expect, it } from "vitest";

import type { ConsentDocument } from "@/lib/api/types";

import { pickDocuments } from "./api";

const doc = (kind: ConsentDocument["kind"], language: ConsentDocument["language"]) =>
  ({ id: `${kind}-${language}`, kind, language }) as ConsentDocument;

describe("pickDocuments", () => {
  it("prefers the UI language and falls back to others", () => {
    const picked = pickDocuments(
      [doc("terms", "sk"), doc("terms", "en"), doc("health_data_processing", "sk")],
      "en",
    );
    expect(picked.get("terms")?.id).toBe("terms-en");
    expect(picked.get("health_data_processing")?.id).toBe("health_data_processing-sk");
  });
});

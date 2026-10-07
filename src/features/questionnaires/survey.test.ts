import { describe, expect, it } from "vitest";

import { formatAnswer, missingRequired, newQuestion, parseSurvey, toSurveySchema } from "./survey";

const seedSchema = {
  pages: [
    {
      elements: [
        { type: "rating", name: "wellbeing", title: "Ako sa dnes cítite?" },
        { type: "comment", name: "notes", title: "Poznámky" },
      ],
    },
  ],
};

describe("parseSurvey", () => {
  it("reads the demo questionnaire with SurveyJS defaults", () => {
    const [rating, comment] = parseSurvey(seedSchema);
    expect(rating).toMatchObject({
      type: "rating",
      name: "wellbeing",
      rateMin: 1,
      rateMax: 5,
      isRequired: false,
    });
    expect(comment).toMatchObject({ type: "comment", title: "Poznámky" });
  });

  it("flattens panels, localizes texts and skips unsupported types", () => {
    const questions = parseSurvey(
      {
        elements: [
          {
            type: "panel",
            elements: [
              {
                type: "radiogroup",
                name: "smoker",
                title: { default: "Smoker?", sk: "Fajčiar?" },
                choices: ["yes", { value: "no", text: { sk: "Nie" } }],
              },
            ],
          },
          { type: "signaturepad", name: "sig" },
          { type: "text", title: "no name" },
        ],
      },
      "sk",
    );
    expect(questions).toHaveLength(1);
    expect(questions[0].title).toBe("Fajčiar?");
    expect(questions[0].choices).toEqual([
      { value: "yes", text: "yes" },
      { value: "no", text: "Nie" },
    ]);
  });

  it("returns no questions for garbage", () => {
    expect(parseSurvey(null)).toEqual([]);
    expect(parseSurvey({ pages: "x" })).toEqual([]);
  });
});

describe("toSurveySchema", () => {
  it("round-trips through parseSurvey", () => {
    const questions = parseSurvey({
      pages: [
        {
          elements: [
            {
              type: "checkbox",
              name: "symptoms",
              title: "Symptoms",
              isRequired: true,
              choices: ["a", { value: "b", text: "B" }],
            },
            { type: "rating", name: "pain", title: "Pain", rateMin: 0, rateMax: 10 },
            { type: "text", name: "age", title: "Age", inputType: "number" },
          ],
        },
      ],
    });
    expect(parseSurvey(toSurveySchema(questions))).toEqual(questions);
  });
});

describe("answers", () => {
  const questions = parseSurvey({
    elements: [
      { type: "radiogroup", name: "a", isRequired: true, choices: [{ value: "1", text: "One" }] },
      { type: "checkbox", name: "b", isRequired: true, choices: ["x"] },
      { type: "boolean", name: "c" },
    ],
  });

  it("finds missing required answers", () => {
    expect(missingRequired(questions, { a: "1", b: [] })).toEqual(["b"]);
  });

  it("formats answers with choice labels", () => {
    const labels = { yes: "Yes", no: "No" };
    expect(formatAnswer(questions[0], "1", labels)).toBe("One");
    expect(formatAnswer(questions[1], ["x", "y"], labels)).toBe("x, y");
    expect(formatAnswer(questions[2], false, labels)).toBe("No");
    expect(formatAnswer(undefined, undefined, labels)).toBe("");
  });

  it("generates unique question names", () => {
    expect(newQuestion([...questions, newQuestion(questions)]).name).toBe("question5");
  });
});

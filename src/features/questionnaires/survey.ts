/**
 * Minimal SurveyJS-compatible model. Questionnaires are stored by the backend as SurveyJS JSON
 * (`{pages: [{elements: [...]}]}`); we render and build the commonly used question types
 * ourselves instead of shipping the full SurveyJS library.
 */

export const QUESTION_TYPES = [
  "text",
  "comment",
  "radiogroup",
  "checkbox",
  "dropdown",
  "boolean",
  "rating",
] as const;
export type QuestionType = (typeof QUESTION_TYPES)[number];

export type Choice = { value: string; text: string };

export type Question = {
  type: QuestionType;
  name: string;
  title: string;
  isRequired: boolean;
  choices: Choice[];
  rateMin: number;
  rateMax: number;
  inputType?: "text" | "number" | "date" | "email";
};

export type AnswerValue = string | number | boolean | string[] | null | undefined;
export type Answers = Record<string, AnswerValue>;

const CHOICE_TYPES: readonly QuestionType[] = ["radiogroup", "checkbox", "dropdown"];
export const hasChoices = (type: QuestionType) => CHOICE_TYPES.includes(type);

type Raw = Record<string, unknown>;

/** SurveyJS texts can be plain strings or localized objects (`{default: "...", sk: "..."}`). */
function localized(value: unknown, locale: string): string | undefined {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const map = value as Record<string, unknown>;
    const text = map[locale] ?? map.default ?? Object.values(map)[0];
    return typeof text === "string" ? text : undefined;
  }
  return undefined;
}

function parseChoice(raw: unknown, locale: string): Choice {
  if (raw && typeof raw === "object") {
    const { value, text } = raw as Raw;
    return { value: String(value), text: localized(text, locale) ?? String(value) };
  }
  return { value: String(raw), text: String(raw) };
}

function parseQuestion(raw: Raw, locale: string): Question | null {
  const type = raw.type as QuestionType;
  if (!QUESTION_TYPES.includes(type) || typeof raw.name !== "string") return null;
  const inputType = raw.inputType;
  return {
    type,
    name: raw.name,
    title: localized(raw.title, locale) ?? raw.name,
    isRequired: raw.isRequired === true,
    choices: Array.isArray(raw.choices) ? raw.choices.map((c) => parseChoice(c, locale)) : [],
    rateMin: typeof raw.rateMin === "number" ? raw.rateMin : 1,
    rateMax: typeof raw.rateMax === "number" ? raw.rateMax : 5,
    ...(inputType === "number" || inputType === "date" || inputType === "email" ? { inputType } : {}),
  };
}

/** Flattens all pages (and panels) into a list of supported questions. Unknown types are skipped. */
export function parseSurvey(schema: unknown, locale = "default"): Question[] {
  const root = (schema ?? {}) as Raw;
  const pages = Array.isArray(root.pages) ? (root.pages as Raw[]) : [root];
  const questions: Question[] = [];

  const visit = (elements: unknown) => {
    if (!Array.isArray(elements)) return;
    for (const element of elements as Raw[]) {
      if (element?.type === "panel") visit(element.elements);
      else {
        const question = parseQuestion(element, locale);
        if (question) questions.push(question);
      }
    }
  };
  for (const page of pages) visit(page.elements);
  return questions;
}

/** Serialises questions back to SurveyJS JSON (single page). */
export function toSurveySchema(questions: Question[]): Raw {
  return {
    pages: [
      {
        name: "page1",
        elements: questions.map((q) => ({
          type: q.type,
          name: q.name,
          title: q.title,
          ...(q.isRequired ? { isRequired: true } : {}),
          ...(hasChoices(q.type)
            ? { choices: q.choices.map((c) => (c.text === c.value ? c.value : c)) }
            : {}),
          ...(q.type === "rating" ? { rateMin: q.rateMin, rateMax: q.rateMax } : {}),
          ...(q.type === "text" && q.inputType && q.inputType !== "text" ? { inputType: q.inputType } : {}),
        })),
      },
    ],
  };
}

export function isEmptyAnswer(value: AnswerValue): boolean {
  return (
    value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0)
  );
}

/** Names of required questions without an answer. */
export function missingRequired(questions: Question[], answers: Answers): string[] {
  return questions.filter((q) => q.isRequired && isEmptyAnswer(answers[q.name])).map((q) => q.name);
}

/** Display text for an answer (choice labels instead of values). */
export function formatAnswer(
  question: Question | undefined,
  value: AnswerValue,
  labels: { yes: string; no: string },
) {
  if (isEmptyAnswer(value)) return "";
  if (typeof value === "boolean") return value ? labels.yes : labels.no;
  const label = (v: string | number) =>
    question?.choices.find((c) => c.value === String(v))?.text ?? String(v);
  return Array.isArray(value) ? value.map(label).join(", ") : label(value as string | number);
}

/** Unique SurveyJS-safe question name, e.g. "question3". */
export function nextQuestionName(questions: Question[]): string {
  const taken = new Set(questions.map((q) => q.name));
  let i = questions.length + 1;
  while (taken.has(`question${i}`)) i++;
  return `question${i}`;
}

export function newQuestion(questions: Question[], type: QuestionType = "text"): Question {
  return {
    type,
    name: nextQuestionName(questions),
    title: "",
    isRequired: false,
    choices: [],
    rateMin: 1,
    rateMax: 5,
  };
}

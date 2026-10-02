import { z } from "zod";

// TODO: build dynamic answer schemas from the questionnaire definition returned by the API.
export const questionnaireAnswerSchema = z.object({
  questionId: z.string(),
  value: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]),
});
export type QuestionnaireAnswer = z.infer<typeof questionnaireAnswerSchema>;

import { z } from "zod";

// TODO: mirror the backend consent model (type, version, granted_at, withdrawn_at).
export const consentDecisionSchema = z.object({
  consentId: z.string(),
  granted: z.boolean(),
});
export type ConsentDecision = z.infer<typeof consentDecisionSchema>;

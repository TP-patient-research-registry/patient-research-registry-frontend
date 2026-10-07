/**
 * Central TanStack Query key factory. Keep keys hierarchical so related queries can be
 * invalidated together, e.g. `queryClient.invalidateQueries({ queryKey: queryKeys.studies.all })`.
 */
export const queryKeys = {
  auth: {
    session: ["auth", "session"] as const,
  },
  studies: {
    all: ["studies"] as const,
    list: (filters: Record<string, unknown> = {}) => ["studies", "list", filters] as const,
    detail: (id: string) => ["studies", "detail", id] as const,
    recommended: ["studies", "recommended"] as const,
    enrollments: ["studies", "enrollments"] as const,
  },
  researcher: {
    all: ["researcher"] as const,
    profile: ["researcher", "profile"] as const,
    studies: (filters: Record<string, unknown> = {}) => ["researcher", "studies", filters] as const,
    study: (id: string) => ["researcher", "study", id] as const,
    participants: (id: string) => ["researcher", "study", id, "participants"] as const,
    questionnaires: (id: string) => ["researcher", "study", id, "questionnaires"] as const,
    responses: (studyId: string, questionnaireId: string) =>
      ["researcher", "study", studyId, "questionnaires", questionnaireId, "responses"] as const,
  },
  questionnaires: {
    all: ["questionnaires"] as const,
    list: ["questionnaires", "list"] as const,
    detail: (id: string) => ["questionnaires", "detail", id] as const,
    response: (id: string) => ["questionnaires", "detail", id, "response"] as const,
  },
  consents: {
    all: ["consents"] as const,
    documents: ["consents", "documents"] as const,
    history: ["consents", "history"] as const,
  },
  profile: {
    me: ["profile", "me"] as const,
    notifications: ["profile", "notifications"] as const,
    deletionRequests: ["profile", "deletion-requests"] as const,
    accessLog: (page: number) => ["profile", "access-log", page] as const,
  },
} as const;

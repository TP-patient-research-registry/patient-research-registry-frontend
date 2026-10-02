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
    mine: ["studies", "mine"] as const,
    participants: (id: string) => ["studies", "detail", id, "participants"] as const,
  },
  questionnaires: {
    all: ["questionnaires"] as const,
    list: (studyId?: string) => ["questionnaires", "list", studyId ?? "all"] as const,
    detail: (id: string) => ["questionnaires", "detail", id] as const,
  },
  consents: {
    all: ["consents"] as const,
  },
  profile: {
    me: ["profile", "me"] as const,
  },
} as const;

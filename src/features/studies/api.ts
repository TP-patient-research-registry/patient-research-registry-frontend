"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import { queryKeys } from "@/lib/api/query-keys";
import type { EligibilityCriteria, EnrollmentStatus } from "@/lib/api/types";

// --- Public & participant ---------------------------------------------------------------------

export function usePublicStudies({ search = "", page = 1 }: { search?: string; page?: number }) {
  return useQuery({
    queryKey: queryKeys.studies.list({ search, page }),
    queryFn: () =>
      unwrap(apiClient.GET("/studies/", { params: { query: { search: search || undefined, page } } })),
    placeholderData: keepPreviousData,
  });
}

export function usePublicStudy(id: string) {
  return useQuery({
    queryKey: queryKeys.studies.detail(id),
    queryFn: () => unwrap(apiClient.GET("/studies/{id}/", { params: { path: { id } } })),
    retry: (count, error) => (error as { status?: number }).status !== 404 && count < 2,
  });
}

export function useRecommendedStudies() {
  return useQuery({
    queryKey: queryKeys.studies.recommended,
    queryFn: () => unwrap(apiClient.GET("/participant/studies/recommended/")),
  });
}

export function useEnrollments({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    enabled,
    queryKey: queryKeys.studies.enrollments,
    queryFn: () =>
      unwrap(apiClient.GET("/participant/enrollments/", { params: { query: { page_size: 100 } } })),
  });
}

export function useApplyToStudy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      unwrap(apiClient.POST("/participant/studies/{id}/apply/", { params: { path: { id } } })),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.studies.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.questionnaires.all });
    },
  });
}

export function useWithdrawEnrollment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      unwrap(apiClient.POST("/participant/enrollments/{id}/withdraw/", { params: { path: { id } } })),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.studies.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.questionnaires.all });
    },
  });
}

// --- Researcher -------------------------------------------------------------------------------

export function useResearcherProfile() {
  return useQuery({
    queryKey: queryKeys.researcher.profile,
    queryFn: () => unwrap(apiClient.GET("/researcher/profile/")),
  });
}

export function useUpdateResearcherProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (institution: string) =>
      unwrap(apiClient.PATCH("/researcher/profile/", { body: { institution } })),
    onSuccess: (data) => queryClient.setQueryData(queryKeys.researcher.profile, data),
  });
}

export function useResearcherStudies() {
  return useQuery({
    queryKey: queryKeys.researcher.studies(),
    queryFn: () => unwrap(apiClient.GET("/researcher/studies/", { params: { query: { page_size: 100 } } })),
  });
}

export function useResearcherStudy(id: string) {
  return useQuery({
    queryKey: queryKeys.researcher.study(id),
    queryFn: () => unwrap(apiClient.GET("/researcher/studies/{id}/", { params: { path: { id } } })),
  });
}

export type StudyInput = { title: string; description: string; results_summary?: string };

function useInvalidateResearcher() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.researcher.all });
    void queryClient.invalidateQueries({ queryKey: queryKeys.studies.all });
  };
}

export function useCreateStudy() {
  const invalidate = useInvalidateResearcher();
  return useMutation({
    mutationFn: async ({ study, criteria }: { study: StudyInput; criteria: EligibilityCriteria }) => {
      const created = await unwrap(apiClient.POST("/researcher/studies/", { body: study }));
      await unwrap(
        apiClient.PUT("/researcher/studies/{id}/criteria/", {
          params: { path: { id: created.id } },
          body: criteria,
        }),
      );
      return created;
    },
    onSuccess: invalidate,
  });
}

export function useUpdateStudy(id: string) {
  const invalidate = useInvalidateResearcher();
  return useMutation({
    mutationFn: async ({ study, criteria }: { study: StudyInput; criteria: EligibilityCriteria }) => {
      await unwrap(apiClient.PATCH("/researcher/studies/{id}/", { params: { path: { id } }, body: study }));
      await unwrap(
        apiClient.PUT("/researcher/studies/{id}/criteria/", { params: { path: { id } }, body: criteria }),
      );
    },
    onSuccess: invalidate,
  });
}

export function useStudyAction(id: string) {
  const invalidate = useInvalidateResearcher();
  return useMutation({
    mutationFn: (action: "publish" | "close" | "delete") => {
      const params = { params: { path: { id } } };
      if (action === "publish") return unwrap(apiClient.POST("/researcher/studies/{id}/publish/", params));
      if (action === "close") return unwrap(apiClient.POST("/researcher/studies/{id}/close/", params));
      return unwrap(apiClient.DELETE("/researcher/studies/{id}/", params));
    },
    onSuccess: invalidate,
  });
}

export function useStudyParticipants(studyId: string) {
  return useQuery({
    queryKey: queryKeys.researcher.participants(studyId),
    queryFn: () =>
      unwrap(
        apiClient.GET("/researcher/studies/{study_pk}/participants/", {
          params: { path: { study_pk: studyId }, query: { page_size: 100 } },
        }),
      ),
  });
}

export function useChangeParticipantStatus(studyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ pseudonym, status }: { pseudonym: string; status: EnrollmentStatus }) =>
      unwrap(
        apiClient.PATCH("/researcher/studies/{study_pk}/participants/{pseudonym}/", {
          params: { path: { study_pk: studyId, pseudonym } },
          body: { status },
        }),
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.researcher.study(studyId) }),
  });
}

/** Status changes a researcher may make (mirrors RESEARCHER_TRANSITIONS in the backend). */
export const RESEARCHER_TRANSITIONS: Partial<Record<EnrollmentStatus, EnrollmentStatus[]>> = {
  applied: ["enrolled", "withdrawn"],
  enrolled: ["completed", "withdrawn"],
};

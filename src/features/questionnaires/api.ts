"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import { ApiError, unwrap } from "@/lib/api/errors";
import { queryKeys } from "@/lib/api/query-keys";

import type { Answers } from "./survey";

// --- Participant ------------------------------------------------------------------------------

export function useQuestionnaires() {
  return useQuery({
    queryKey: queryKeys.questionnaires.list,
    queryFn: () =>
      unwrap(apiClient.GET("/participant/questionnaires/", { params: { query: { page_size: 100 } } })),
  });
}

export function useQuestionnaire(id: string) {
  return useQuery({
    queryKey: queryKeys.questionnaires.detail(id),
    queryFn: () => unwrap(apiClient.GET("/participant/questionnaires/{id}/", { params: { path: { id } } })),
  });
}

/** The participant's draft/submitted answers, or `null` if they haven't started (API 404). */
export function useMyResponse(id: string) {
  return useQuery({
    queryKey: queryKeys.questionnaires.response(id),
    queryFn: async () => {
      try {
        return await unwrap(
          apiClient.GET("/participant/questionnaires/{id}/response/", { params: { path: { id } } }),
        );
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
      }
    },
  });
}

export function useSaveResponse(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data, submit }: { data: Answers; submit: boolean }) =>
      unwrap(
        apiClient.PUT("/participant/questionnaires/{id}/response/", {
          params: { path: { id } },
          body: { data, submit },
        }),
      ),
    onSuccess: (response) => queryClient.setQueryData(queryKeys.questionnaires.response(id), response),
  });
}

// --- Researcher -------------------------------------------------------------------------------

export function useStudyQuestionnaires(studyId: string) {
  return useQuery({
    queryKey: queryKeys.researcher.questionnaires(studyId),
    queryFn: () =>
      unwrap(
        apiClient.GET("/researcher/studies/{study_pk}/questionnaires/", {
          params: { path: { study_pk: studyId }, query: { page_size: 100 } },
        }),
      ),
  });
}

export type QuestionnaireInput = { title: string; schema: unknown; is_active: boolean };

export function useSaveQuestionnaire(studyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id?: string; body: Partial<QuestionnaireInput> }) =>
      id
        ? unwrap(
            apiClient.PATCH("/researcher/studies/{study_pk}/questionnaires/{id}/", {
              params: { path: { study_pk: studyId, id } },
              body,
            }),
          )
        : unwrap(
            apiClient.POST("/researcher/studies/{study_pk}/questionnaires/", {
              params: { path: { study_pk: studyId } },
              body: body as QuestionnaireInput,
            }),
          ),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.researcher.questionnaires(studyId) }),
  });
}

export function useDeleteQuestionnaire(studyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      unwrap(
        apiClient.DELETE("/researcher/studies/{study_pk}/questionnaires/{id}/", {
          params: { path: { study_pk: studyId, id } },
        }),
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.researcher.questionnaires(studyId) }),
  });
}

/** Submitted answers (pseudonymised). Each fetch is recorded in the participants' access logs. */
export function useQuestionnaireResponses(studyId: string, questionnaireId: string, enabled: boolean) {
  return useQuery({
    enabled,
    queryKey: queryKeys.researcher.responses(studyId, questionnaireId),
    queryFn: () =>
      unwrap(
        apiClient.GET("/researcher/studies/{study_pk}/questionnaires/{id}/responses/", {
          params: { path: { study_pk: studyId, id: questionnaireId }, query: { page_size: 100 } },
        }),
      ),
    staleTime: Infinity,
  });
}

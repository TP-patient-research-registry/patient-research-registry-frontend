"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import { queryKeys } from "@/lib/api/query-keys";
import type { ConsentDocument, ConsentKind } from "@/lib/api/types";

export function useConsentDocuments() {
  return useQuery({
    queryKey: queryKeys.consents.documents,
    queryFn: () => unwrap(apiClient.GET("/participant/consent-documents/")),
  });
}

export function useConsentHistory() {
  return useQuery({
    queryKey: queryKeys.consents.history,
    queryFn: () => unwrap(apiClient.GET("/participant/consents/", { params: { query: { page_size: 100 } } })),
  });
}

function useInvalidateConsents() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.consents.all });
    void queryClient.invalidateQueries({ queryKey: queryKeys.studies.recommended });
  };
}

export function useGrantConsent() {
  const onSuccess = useInvalidateConsents();
  return useMutation({
    mutationFn: (documentId: string) =>
      unwrap(apiClient.POST("/participant/consents/", { body: { document_id: documentId } })),
    onSuccess,
  });
}

export function useWithdrawConsent() {
  const onSuccess = useInvalidateConsents();
  return useMutation({
    mutationFn: (id: string) =>
      unwrap(apiClient.POST("/participant/consents/{id}/withdraw/", { params: { path: { id } } })),
    onSuccess,
  });
}

export const CONSENT_KINDS: readonly ConsentKind[] = [
  "terms",
  "health_data_processing",
  "study_matching_contact",
];

/** Current document per kind, preferring the UI language and falling back to any language. */
export function pickDocuments(
  documents: ConsentDocument[],
  locale: string,
): Map<ConsentKind, ConsentDocument> {
  const picked = new Map<ConsentKind, ConsentDocument>();
  for (const doc of documents) {
    const current = picked.get(doc.kind);
    if (!current || (current.language !== locale && doc.language === locale)) picked.set(doc.kind, doc);
  }
  return picked;
}

"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import { queryKeys } from "@/lib/api/query-keys";
import type { NotificationPreference, ParticipantProfile } from "@/lib/api/types";

export function useProfile() {
  return useQuery({
    queryKey: queryKeys.profile.me,
    queryFn: () => unwrap(apiClient.GET("/participant/profile/")),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Omit<ParticipantProfile, "updated_at">) =>
      unwrap(apiClient.PATCH("/participant/profile/", { body })),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.profile.me, data);
      // Recommendations depend on the profile.
      void queryClient.invalidateQueries({ queryKey: queryKeys.studies.recommended });
    },
  });
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: queryKeys.profile.notifications,
    queryFn: () => unwrap(apiClient.GET("/participant/notification-preferences/")),
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Omit<NotificationPreference, "updated_at">) =>
      unwrap(apiClient.PATCH("/participant/notification-preferences/", { body })),
    onSuccess: (data) => queryClient.setQueryData(queryKeys.profile.notifications, data),
  });
}

export function useDeletionRequests() {
  return useQuery({
    queryKey: queryKeys.profile.deletionRequests,
    queryFn: () => unwrap(apiClient.GET("/participant/my-data/deletion-requests/")),
  });
}

export function useRequestDeletion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reason: string) =>
      unwrap(apiClient.POST("/participant/my-data/deletion-requests/", { body: { reason } })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.profile.deletionRequests }),
  });
}

export function useAccessLog(page: number) {
  return useQuery({
    queryKey: queryKeys.profile.accessLog(page),
    queryFn: () => unwrap(apiClient.GET("/participant/my-data/access-log/", { params: { query: { page } } })),
    placeholderData: keepPreviousData,
  });
}

/** Downloads the GDPR data export as a JSON file (art. 15 & 20). */
export async function downloadDataExport() {
  const response = await apiClient.GET("/participant/my-data/export/", { parseAs: "blob" });
  if (!response.response.ok || !response.data) throw new Error("export failed");
  const disposition = response.response.headers.get("content-disposition") ?? "";
  const filename = /filename="([^"]+)"/.exec(disposition)?.[1] ?? "my-data.json";
  const url = URL.createObjectURL(response.data as Blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useRouter } from "@/i18n/navigation";
import { queryKeys } from "@/lib/api/query-keys";

import { getSession, logout } from "../api";

export function useSession() {
  return useQuery({ queryKey: queryKeys.auth.session, queryFn: getSession, staleTime: 5 * 60 * 1000 });
}

/** Logs out, drops every cached query (they may hold personal data) and goes home. */
export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      queryClient.clear();
      router.replace("/");
      router.refresh();
    },
  });
}

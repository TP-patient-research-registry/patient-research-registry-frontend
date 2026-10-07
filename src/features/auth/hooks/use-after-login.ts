"use client";

import { useQueryClient } from "@tanstack/react-query";

import { useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { queryKeys } from "@/lib/api/query-keys";

import { getSession } from "../api";
import { dashboardPath, safeNextPath } from "../roles";

/** Refreshes the cached session and navigates to `next` or the role's dashboard. */
export function useAfterLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return async (next?: string | null) => {
    queryClient.removeQueries();
    const session = await queryClient.fetchQuery({ queryKey: queryKeys.auth.session, queryFn: getSession });
    const target =
      safeNextPath(next, routing.locales) ?? (session.user ? dashboardPath(session.user.role) : "/");
    router.replace(target);
    router.refresh();
  };
}

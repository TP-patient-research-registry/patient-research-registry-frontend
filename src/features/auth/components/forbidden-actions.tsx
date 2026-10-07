"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

import { useLogout, useSession } from "../hooks/use-session";
import { dashboardPath } from "../roles";

export function ForbiddenActions() {
  const t = useTranslations("pages.forbidden");
  const { data: session } = useSession();
  const logout = useLogout();

  return (
    <div className="flex flex-wrap gap-2">
      {session?.user && (
        <Button asChild>
          <Link href={dashboardPath(session.user.role)}>{t("toDashboard")}</Link>
        </Button>
      )}
      {session?.isAuthenticated ? (
        <Button variant="outline" onClick={() => logout.mutate()}>
          {t("switchAccount")}
        </Button>
      ) : (
        <Button asChild variant="outline">
          <Link href="/login">{t("login")}</Link>
        </Button>
      )}
    </div>
  );
}

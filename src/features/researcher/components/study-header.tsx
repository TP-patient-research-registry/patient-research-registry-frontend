"use client";

import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { ErrorState, LoadingState } from "@/components/states";
import { useResearcherStudy } from "@/features/studies/api";
import { StudyStatusBadge } from "@/features/studies/components/status-badges";
import { Link } from "@/i18n/navigation";
import type { ResearcherStudy } from "@/lib/api/types";

import { StudyTabs } from "./study-tabs";

/** Loads a researcher's study and renders title, status and tabs above `children(study)`. */
export function StudyScope({
  studyId,
  actions,
  children,
}: {
  studyId: string;
  actions?: (study: ResearcherStudy) => ReactNode;
  children: (study: ResearcherStudy) => ReactNode;
}) {
  const t = useTranslations("researcher.study");
  const query = useResearcherStudy(studyId);

  if (query.isPending) return <LoadingState />;
  if (query.isError) return <ErrorState error={query.error} onRetry={() => query.refetch()} />;
  const study = query.data;

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/researcher/studies"
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {t("back")}
      </Link>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <StudyStatusBadge status={study.status} />
          <h1 className="font-heading text-3xl font-bold tracking-tight">{study.title}</h1>
          <p className="text-sm text-muted-foreground">
            {t("enrollments", { count: study.enrollment_count })}
          </p>
        </div>
        {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions(study)}</div>}
      </header>
      <StudyTabs studyId={study.id} />
      {children(study)}
    </div>
  );
}

"use client";

import { ArrowLeft, Building2, CalendarDays } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";

import { ErrorState, LoadingState } from "@/components/states";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { ApiError } from "@/lib/api/errors";

import { usePublicStudy } from "../api";
import { ApplyButton } from "./apply-button";
import { CriteriaSummary } from "./criteria-summary";
import { StudyStatusBadge } from "./status-badges";

export function StudyDetail({ id, backHref = "/studies" }: { id: string; backHref?: string }) {
  const t = useTranslations("studies");
  const format = useFormatter();
  const query = usePublicStudy(id);

  if (query.isPending) return <LoadingState />;
  if (query.isError) {
    if (query.error instanceof ApiError && query.error.status === 404) {
      return (
        <div className="flex flex-col gap-3">
          <h1 className="font-heading text-2xl font-bold">{t("notFound")}</h1>
          <Link href={backHref} className="text-primary underline underline-offset-4">
            {t("backToList")}
          </Link>
        </div>
      );
    }
    return <ErrorState error={query.error} onRetry={() => query.refetch()} />;
  }

  const study = query.data;

  return (
    <article className="flex flex-col gap-6">
      <Link
        href={backHref}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {t("backToList")}
      </Link>
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <StudyStatusBadge status={study.status} />
        </div>
        <h1 className="font-heading text-3xl font-bold tracking-tight">{study.title}</h1>
        <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          {study.organization && (
            <span className="flex items-center gap-1">
              <Building2 className="size-4" aria-hidden />
              {study.organization}
            </span>
          )}
          {study.published_at && (
            <span className="flex items-center gap-1">
              <CalendarDays className="size-4" aria-hidden />
              {t("publishedOn", {
                date: format.dateTime(new Date(study.published_at), { dateStyle: "long" }),
              })}
            </span>
          )}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <section aria-labelledby="study-about" className="flex flex-col gap-3">
          <h2 id="study-about" className="text-xl font-semibold">
            {t("about")}
          </h2>
          <p className="whitespace-pre-line">{study.description}</p>
          {study.results_summary && (
            <>
              <h2 className="mt-4 text-xl font-semibold">{t("results")}</h2>
              <p className="whitespace-pre-line">{study.results_summary}</p>
            </>
          )}
        </section>
        <aside className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>
                <h2>{t("criteria.title")}</h2>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CriteriaSummary criteria={study.criteria} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>
                <h2>{t("apply.title")}</h2>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">{t("apply.privacy")}</p>
              <ApplyButton studyId={study.id} />
            </CardContent>
          </Card>
        </aside>
      </div>
    </article>
  );
}

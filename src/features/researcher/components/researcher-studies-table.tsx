"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";

import { EmptyState, ErrorState, LoadingState } from "@/components/states";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useResearcherStudies } from "@/features/studies/api";
import { StudyStatusBadge } from "@/features/studies/components/status-badges";
import { Link } from "@/i18n/navigation";
import type { StudyStatus } from "@/lib/api/types";

const FILTERS = ["all", "draft", "published", "closed"] as const;

export function ResearcherStudiesTable({
  limit,
  filterable = false,
}: {
  limit?: number;
  filterable?: boolean;
}) {
  const t = useTranslations("researcher.studies");
  const tStatus = useTranslations("enums.studyStatus");
  const format = useFormatter();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const query = useResearcherStudies();

  if (query.isPending) return <LoadingState />;
  if (query.isError) return <ErrorState error={query.error} onRetry={() => query.refetch()} />;

  const studies = query.data.results
    .filter((s) => filter === "all" || s.status === (filter as StudyStatus))
    .slice(0, limit);

  return (
    <div className="flex flex-col gap-3">
      {filterable && (
        <div role="group" aria-label={t("filter")} className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? "default" : "outline"}
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? t("all") : tStatus(f)}
            </Button>
          ))}
        </div>
      )}
      {studies.length === 0 ? (
        <EmptyState title={t("empty")}>
          <Link href="/researcher/studies/new" className="text-primary underline underline-offset-4">
            {t("createFirst")}
          </Link>
        </EmptyState>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("title")}</TableHead>
                <TableHead>{t("status")}</TableHead>
                <TableHead className="text-right">{t("participants")}</TableHead>
                <TableHead>{t("updated")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studies.map((study) => (
                <TableRow key={study.id}>
                  <TableCell className="max-w-md font-medium whitespace-normal">
                    <Link
                      href={`/researcher/studies/${study.id}`}
                      className="underline-offset-4 hover:underline"
                    >
                      {study.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <StudyStatusBadge status={study.status} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{study.enrollment_count}</TableCell>
                  <TableCell>
                    {format.dateTime(new Date(study.updated_at), { dateStyle: "medium" })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

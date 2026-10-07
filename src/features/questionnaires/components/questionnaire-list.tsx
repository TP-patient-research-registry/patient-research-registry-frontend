"use client";

import { ClipboardList } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";

import { EmptyState, ErrorState, LoadingState } from "@/components/states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEnrollments } from "@/features/studies/api";
import { Link } from "@/i18n/navigation";
import type { Questionnaire } from "@/lib/api/types";

import { useMyResponse, useQuestionnaires } from "../api";

export function QuestionnaireStatus({ questionnaireId }: { questionnaireId: string }) {
  const t = useTranslations("questionnaires.status");
  const format = useFormatter();
  const response = useMyResponse(questionnaireId);
  if (response.isPending) return null;
  if (response.data?.submitted_at) {
    return (
      <Badge variant="secondary">
        {t("submitted", {
          date: format.dateTime(new Date(response.data.submitted_at), { dateStyle: "medium" }),
        })}
      </Badge>
    );
  }
  if (response.data) return <Badge variant="outline">{t("draft")}</Badge>;
  return <Badge>{t("new")}</Badge>;
}

function Row({ questionnaire, studyTitle }: { questionnaire: Questionnaire; studyTitle?: string }) {
  const t = useTranslations("questionnaires");
  const response = useMyResponse(questionnaire.id);
  const submitted = Boolean(response.data?.submitted_at);

  return (
    <li className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <ClipboardList className="mt-0.5 size-5 text-primary" aria-hidden />
        <div className="flex flex-col gap-1">
          <h3 className="font-medium">{questionnaire.title}</h3>
          {studyTitle && <p className="text-sm text-muted-foreground">{studyTitle}</p>}
          <QuestionnaireStatus questionnaireId={questionnaire.id} />
        </div>
      </div>
      <Button asChild variant={submitted ? "outline" : "default"}>
        <Link href={`/participant/questionnaires/${questionnaire.id}`}>
          {submitted ? t("view") : t("fill")}
        </Link>
      </Button>
    </li>
  );
}

export function QuestionnaireList({ limit }: { limit?: number }) {
  const t = useTranslations("questionnaires");
  const query = useQuestionnaires();
  const enrollments = useEnrollments();
  const titles = new Map(enrollments.data?.results.map((e) => [e.study.id, e.study.title]));

  if (query.isPending) return <LoadingState />;
  if (query.isError) return <ErrorState error={query.error} onRetry={() => query.refetch()} />;
  if (query.data.results.length === 0) return <EmptyState title={t("empty")}>{t("emptyHelp")}</EmptyState>;

  return (
    <ul className="flex flex-col gap-3">
      {query.data.results.slice(0, limit).map((q) => (
        <Row key={q.id} questionnaire={q} studyTitle={titles.get(q.study)} />
      ))}
    </ul>
  );
}

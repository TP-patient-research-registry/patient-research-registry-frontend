"use client";

import { Download, Pencil, Plus, Table2, Trash2 } from "lucide-react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState, ErrorState, LoadingState } from "@/components/states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { errorMessage } from "@/lib/api/errors";
import type { Questionnaire } from "@/lib/api/types";
import { downloadFile, toCsv } from "@/lib/csv";

import {
  useDeleteQuestionnaire,
  useQuestionnaireResponses,
  useSaveQuestionnaire,
  useStudyQuestionnaires,
} from "../api";
import { type AnswerValue, formatAnswer, parseSurvey, toSurveySchema } from "../survey";
import { type BuilderValue, builderErrors, QuestionnaireBuilder } from "./questionnaire-builder";

function Editor({
  studyId,
  questionnaire,
  onDone,
}: {
  studyId: string;
  questionnaire?: Questionnaire;
  onDone: () => void;
}) {
  const t = useTranslations("questionnaires.builder");
  const locale = useLocale();
  const save = useSaveQuestionnaire(studyId);
  const [value, setValue] = useState<BuilderValue>(() => ({
    title: questionnaire?.title ?? "",
    questions: parseSurvey(questionnaire?.schema, locale),
    isActive: questionnaire?.is_active ?? true,
  }));
  const [showErrors, setShowErrors] = useState(false);
  const errors = builderErrors(value);

  async function submit() {
    setShowErrors(true);
    if (errors.length) return;
    try {
      await save.mutateAsync({
        id: questionnaire?.id,
        body: {
          title: value.title.trim(),
          schema: toSurveySchema(value.questions),
          is_active: value.isActive,
        },
      });
      toast.success(t("saved"));
      onDone();
    } catch (error) {
      toast.error(errorMessage(error, t("saveError")));
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2>{questionnaire ? t("editTitle") : t("newTitle")}</h2>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {questionnaire && <p className="text-sm text-muted-foreground">{t("editWarning")}</p>}
        <QuestionnaireBuilder value={value} onChange={setValue} />
        {showErrors && errors.length > 0 && (
          <ul
            role="alert"
            className="list-disc rounded-lg border border-destructive/30 bg-destructive/5 p-3 pl-8 text-sm text-destructive"
          >
            {errors.map((e) => (
              <li key={e}>{t(`errors.${e}`)}</li>
            ))}
          </ul>
        )}
        <div className="flex gap-2">
          <Button onClick={submit} disabled={save.isPending}>
            {t("save")}
          </Button>
          <Button variant="outline" onClick={onDone}>
            {t("cancel")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Responses({ studyId, questionnaire }: { studyId: string; questionnaire: Questionnaire }) {
  const t = useTranslations("questionnaires.responses");
  const tForm = useTranslations("questionnaires.form");
  const locale = useLocale();
  const format = useFormatter();
  const query = useQuestionnaireResponses(studyId, questionnaire.id, true);
  const questions = useMemo(() => parseSurvey(questionnaire.schema, locale), [questionnaire.schema, locale]);
  const labels = { yes: tForm("yes"), no: tForm("no") };

  if (query.isPending) return <LoadingState />;
  if (query.isError) return <ErrorState error={query.error} onRetry={() => query.refetch()} />;
  const responses = query.data.results;
  if (responses.length === 0) return <EmptyState title={t("empty")} />;

  const answer = (data: unknown, name: string) => (data as Record<string, AnswerValue> | null)?.[name];
  const rows = responses.map((r) => [
    r.participant_id ?? "",
    r.submitted_at ?? "",
    ...questions.map((q) => formatAnswer(q, answer(r.data, q.name), labels)),
  ]);

  function exportCsv() {
    const header = [t("participant"), t("submitted"), ...questions.map((q) => q.title)];
    downloadFile(toCsv([header, ...rows]), `responses-${questionnaire.id}.csv`, "text/csv;charset=utf-8");
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">{t("count", { count: query.data.count })}</p>
        <Button variant="outline" size="sm" onClick={exportCsv}>
          <Download aria-hidden />
          {t("export")}
        </Button>
      </div>
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("participant")}</TableHead>
              <TableHead>{t("submitted")}</TableHead>
              {questions.map((q) => (
                <TableHead key={q.name}>{q.title}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {responses.map((r, i) => (
              <TableRow key={r.id}>
                <TableCell className="font-mono text-xs">{r.participant_id?.slice(0, 8) ?? "—"}</TableCell>
                <TableCell>
                  {r.submitted_at &&
                    format.dateTime(new Date(r.submitted_at), { dateStyle: "short", timeStyle: "short" })}
                </TableCell>
                {rows[i].slice(2).map((cell, j) => (
                  <TableCell key={questions[j].name} className="max-w-xs whitespace-normal">
                    {cell}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function QuestionnaireCard({
  studyId,
  questionnaire,
  onEdit,
}: {
  studyId: string;
  questionnaire: Questionnaire;
  onEdit: () => void;
}) {
  const t = useTranslations("questionnaires.manage");
  const remove = useDeleteQuestionnaire(studyId);
  const [showResponses, setShowResponses] = useState(false);
  const count = parseSurvey(questionnaire.schema).length;

  return (
    <li>
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle>
              <h2 className="text-lg">{questionnaire.title}</h2>
            </CardTitle>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant={questionnaire.is_active ? "default" : "outline"}>
                {questionnaire.is_active ? t("active") : t("inactive")}
              </Badge>
              {t("questionCount", { count })}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              aria-expanded={showResponses}
              onClick={() => setShowResponses((v) => !v)}
            >
              <Table2 aria-hidden />
              {showResponses ? t("hideResponses") : t("responses")}
            </Button>
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Pencil aria-hidden />
              {t("edit")}
            </Button>
            <ConfirmDialog
              trigger={
                <Button variant="ghost" size="sm" aria-label={t("delete")}>
                  <Trash2 aria-hidden />
                </Button>
              }
              title={t("deleteTitle")}
              description={t("deleteConfirm")}
              confirmLabel={t("delete")}
              destructive
              onConfirm={() =>
                remove.mutateAsync(questionnaire.id).then(
                  () => toast.success(t("deleted")),
                  (error) => {
                    toast.error(errorMessage(error, t("deleteError")));
                    throw error;
                  },
                )
              }
            />
          </div>
        </CardHeader>
        {showResponses && (
          <CardContent>
            <p className="mb-3 text-sm text-muted-foreground">{t("auditNotice")}</p>
            <Responses studyId={studyId} questionnaire={questionnaire} />
          </CardContent>
        )}
      </Card>
    </li>
  );
}

export function StudyQuestionnaires({ studyId }: { studyId: string }) {
  const t = useTranslations("questionnaires.manage");
  const query = useStudyQuestionnaires(studyId);
  const [editing, setEditing] = useState<Questionnaire | "new" | null>(null);

  if (query.isPending) return <LoadingState />;
  if (query.isError) return <ErrorState error={query.error} onRetry={() => query.refetch()} />;

  if (editing) {
    return (
      <Editor
        studyId={studyId}
        questionnaire={editing === "new" ? undefined : editing}
        onDone={() => setEditing(null)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">{t("help")}</p>
        <Button onClick={() => setEditing("new")}>
          <Plus aria-hidden />
          {t("new")}
        </Button>
      </div>
      {query.data.results.length === 0 ? (
        <EmptyState title={t("empty")} />
      ) : (
        <ul className="flex flex-col gap-3">
          {query.data.results.map((q) => (
            <QuestionnaireCard key={q.id} studyId={studyId} questionnaire={q} onEdit={() => setEditing(q)} />
          ))}
        </ul>
      )}
    </div>
  );
}

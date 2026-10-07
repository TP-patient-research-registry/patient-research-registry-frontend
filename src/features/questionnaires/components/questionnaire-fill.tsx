"use client";

import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { ErrorState, LoadingState } from "@/components/states";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { errorMessage } from "@/lib/api/errors";

import { useMyResponse, useQuestionnaire, useSaveResponse } from "../api";
import { type Answers, missingRequired, parseSurvey } from "../survey";
import { SurveyForm } from "./survey-form";

function Fill({ id, initial, submittedAt }: { id: string; initial: Answers; submittedAt: string | null }) {
  const t = useTranslations("questionnaires.form");
  const locale = useLocale();
  const format = useFormatter();
  const questionnaire = useQuestionnaire(id);
  const save = useSaveResponse(id);
  const [answers, setAnswers] = useState<Answers>(initial);
  const [invalid, setInvalid] = useState<string[]>([]);
  const questions = useMemo(
    () => parseSurvey(questionnaire.data?.schema, locale),
    [questionnaire.data, locale],
  );

  if (questionnaire.isPending) return <LoadingState />;
  if (questionnaire.isError)
    return <ErrorState error={questionnaire.error} onRetry={() => questionnaire.refetch()} />;

  const readOnly = submittedAt !== null;

  async function persist(submit: boolean) {
    try {
      await save.mutateAsync({ data: answers, submit });
      toast.success(submit ? t("submitted") : t("draftSaved"));
    } catch (error) {
      toast.error(errorMessage(error, t("saveError")));
      throw error;
    }
  }

  function trySubmit(): boolean {
    const missing = missingRequired(questions, answers);
    setInvalid(missing);
    if (missing.length) toast.error(t("fillRequired"));
    return missing.length === 0;
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/participant/questionnaires"
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {t("back")}
      </Link>
      <h1 className="font-heading text-3xl font-bold tracking-tight">{questionnaire.data.title}</h1>

      {readOnly ? (
        <p role="status" className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3 text-sm">
          <CheckCircle2 className="size-4 text-primary" aria-hidden />
          {t("readOnly", {
            date: format.dateTime(new Date(submittedAt), { dateStyle: "long", timeStyle: "short" }),
          })}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">{t("intro")}</p>
      )}

      {questions.length === 0 ? (
        <p className="text-muted-foreground">{t("noQuestions")}</p>
      ) : (
        <SurveyForm
          questions={questions}
          answers={answers}
          onChange={(next) => {
            setAnswers(next);
            if (invalid.length) setInvalid(missingRequired(questions, next));
          }}
          readOnly={readOnly}
          invalidNames={invalid}
        />
      )}

      {!readOnly && questions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            disabled={save.isPending}
            onClick={() => persist(false).catch(() => undefined)}
          >
            {t("saveDraft")}
          </Button>
          <ConfirmDialog
            trigger={<Button disabled={save.isPending}>{t("submit")}</Button>}
            title={t("submitTitle")}
            description={t("submitConfirm")}
            confirmLabel={t("submit")}
            onConfirm={() => {
              if (!trySubmit()) return;
              return persist(true);
            }}
          />
        </div>
      )}
    </div>
  );
}

export function QuestionnaireFill({ id }: { id: string }) {
  const response = useMyResponse(id);
  if (response.isPending) return <LoadingState />;
  if (response.isError) return <ErrorState error={response.error} onRetry={() => response.refetch()} />;
  const data = (response.data?.data ?? {}) as Answers;
  return (
    <Fill
      key={response.data?.updated_at ?? "new"}
      id={id}
      initial={data}
      submittedAt={response.data?.submitted_at ?? null}
    />
  );
}

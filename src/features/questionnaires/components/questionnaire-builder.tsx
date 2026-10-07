"use client";

import { ArrowDown, ArrowUp, Eye, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import {
  type Answers,
  hasChoices,
  newQuestion,
  QUESTION_TYPES,
  type Question,
  type QuestionType,
} from "../survey";
import { SurveyForm } from "./survey-form";

export type BuilderValue = { title: string; questions: Question[]; isActive: boolean };

/** Problems that block saving, as i18n keys of `questionnaires.builder.errors`. */
export function builderErrors(value: BuilderValue): string[] {
  const errors: string[] = [];
  if (!value.title.trim()) errors.push("title");
  if (value.questions.length === 0) errors.push("noQuestions");
  if (value.questions.some((q) => !q.title.trim())) errors.push("questionTitle");
  if (value.questions.some((q) => hasChoices(q.type) && q.choices.length < 2)) errors.push("choices");
  if (value.questions.some((q) => q.type === "rating" && q.rateMax <= q.rateMin)) errors.push("rating");
  return errors;
}

function QuestionEditor({
  question,
  index,
  count,
  onChange,
  onMove,
  onRemove,
}: {
  question: Question;
  index: number;
  count: number;
  onChange: (q: Question) => void;
  onMove: (delta: number) => void;
  onRemove: () => void;
}) {
  const t = useTranslations("questionnaires.builder");
  const id = useId();
  const [choicesText, setChoicesText] = useState(question.choices.map((c) => c.text).join("\n"));

  return (
    <li className="flex flex-col gap-3 rounded-lg border p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">{t("questionN", { n: index + 1 })}</h3>
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={t("moveUp")}
            disabled={index === 0}
            onClick={() => onMove(-1)}
          >
            <ArrowUp aria-hidden />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={t("moveDown")}
            disabled={index === count - 1}
            onClick={() => onMove(1)}
          >
            <ArrowDown aria-hidden />
          </Button>
          <Button type="button" variant="ghost" size="icon-sm" aria-label={t("remove")} onClick={onRemove}>
            <Trash2 aria-hidden />
          </Button>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-[1fr_14rem]">
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${id}-title`}>{t("questionTitle")}</Label>
          <Input
            id={`${id}-title`}
            value={question.title}
            onChange={(e) => onChange({ ...question, title: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${id}-type`}>{t("type")}</Label>
          <Select
            value={question.type}
            onValueChange={(type) => onChange({ ...question, type: type as QuestionType })}
          >
            <SelectTrigger id={`${id}-type`} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {QUESTION_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {t(`types.${type}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasChoices(question.type) && (
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${id}-choices`}>{t("choices")}</Label>
          <Textarea
            id={`${id}-choices`}
            value={choicesText}
            rows={4}
            onChange={(e) => {
              setChoicesText(e.target.value);
              const lines = e.target.value
                .split("\n")
                .map((l) => l.trim())
                .filter(Boolean);
              // Keep existing values for unchanged labels so stored answers stay valid.
              const choices = lines.map(
                (text, i) => question.choices.find((c) => c.text === text) ?? { value: `${i + 1}`, text },
              );
              const seen = new Set<string>();
              onChange({
                ...question,
                choices: choices.map((c, i) => {
                  const value = seen.has(c.value) ? `${c.value}_${i + 1}` : c.value;
                  seen.add(value);
                  return { ...c, value };
                }),
              });
            }}
          />
          <p className="text-sm text-muted-foreground">{t("choicesHelp")}</p>
        </div>
      )}

      {question.type === "rating" && (
        <div className="grid max-w-xs grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor={`${id}-min`}>{t("rateMin")}</Label>
            <Input
              id={`${id}-min`}
              type="number"
              value={question.rateMin}
              onChange={(e) => onChange({ ...question, rateMin: Number(e.target.value) })}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={`${id}-max`}>{t("rateMax")}</Label>
            <Input
              id={`${id}-max`}
              type="number"
              value={question.rateMax}
              onChange={(e) => onChange({ ...question, rateMax: Number(e.target.value) })}
            />
          </div>
        </div>
      )}

      {question.type === "text" && (
        <div className="flex max-w-xs flex-col gap-2">
          <Label htmlFor={`${id}-input`}>{t("inputType")}</Label>
          <Select
            value={question.inputType ?? "text"}
            onValueChange={(v) => onChange({ ...question, inputType: v as Question["inputType"] })}
          >
            <SelectTrigger id={`${id}-input`} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(["text", "number", "date", "email"] as const).map((v) => (
                <SelectItem key={v} value={v}>
                  {t(`inputTypes.${v}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Checkbox
          id={`${id}-required`}
          checked={question.isRequired}
          onCheckedChange={(v) => onChange({ ...question, isRequired: v === true })}
        />
        <Label htmlFor={`${id}-required`} className="font-normal">
          {t("required")}
        </Label>
      </div>
    </li>
  );
}

export function QuestionnaireBuilder({
  value,
  onChange,
}: {
  value: BuilderValue;
  onChange: (v: BuilderValue) => void;
}) {
  const t = useTranslations("questionnaires.builder");
  const id = useId();
  const [preview, setPreview] = useState(false);
  const [previewAnswers, setPreviewAnswers] = useState<Answers>({});
  const { questions } = value;

  const setQuestions = (next: Question[]) => onChange({ ...value, questions: next });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-title`}>{t("title")}</Label>
        <Input
          id={`${id}-title`}
          value={value.title}
          onChange={(e) => onChange({ ...value, title: e.target.value })}
        />
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          id={`${id}-active`}
          checked={value.isActive}
          onCheckedChange={(v) => onChange({ ...value, isActive: v === true })}
        />
        <Label htmlFor={`${id}-active`} className="font-normal">
          {t("active")}
        </Label>
      </div>

      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold">{t("questions")}</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setPreview((p) => !p)}
          aria-pressed={preview}
        >
          <Eye aria-hidden />
          {preview ? t("edit") : t("preview")}
        </Button>
      </div>

      {preview ? (
        <SurveyForm questions={questions} answers={previewAnswers} onChange={setPreviewAnswers} />
      ) : (
        <>
          <ol className="flex flex-col gap-3">
            {questions.map((question, index) => (
              <QuestionEditor
                key={question.name}
                question={question}
                index={index}
                count={questions.length}
                onChange={(q) => setQuestions(questions.map((x, i) => (i === index ? q : x)))}
                onMove={(delta) => {
                  const next = [...questions];
                  const [moved] = next.splice(index, 1);
                  next.splice(index + delta, 0, moved);
                  setQuestions(next);
                }}
                onRemove={() => setQuestions(questions.filter((_, i) => i !== index))}
              />
            ))}
          </ol>
          <Button
            type="button"
            variant="outline"
            className="self-start"
            onClick={() => setQuestions([...questions, newQuestion(questions)])}
          >
            <Plus aria-hidden />
            {t("addQuestion")}
          </Button>
        </>
      )}
    </div>
  );
}

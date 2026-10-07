"use client";

import { useTranslations } from "next-intl";
import { useId } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import type { Answers, AnswerValue, Question } from "../survey";

type QuestionProps = {
  question: Question;
  value: AnswerValue;
  onChange: (value: AnswerValue) => void;
  readOnly: boolean;
  invalid: boolean;
};

function RadioOptions({
  name,
  options,
  value,
  onChange,
  readOnly,
  inline = false,
}: {
  name: string;
  options: { value: string; label: string }[];
  value: string | undefined;
  onChange: (value: string) => void;
  readOnly: boolean;
  inline?: boolean;
}) {
  return (
    <div className={cn("flex gap-2", inline ? "flex-wrap" : "flex-col")}>
      {options.map((option) => (
        <label
          key={option.value}
          className={cn(
            "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50",
            value === option.value ? "border-primary bg-primary/5 font-medium" : "hover:bg-muted/50",
            inline && "min-w-11 justify-center",
            readOnly && "cursor-default",
          )}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            disabled={readOnly}
            className={cn("accent-primary", inline && "sr-only")}
          />
          {option.label}
        </label>
      ))}
    </div>
  );
}

function QuestionField({ question, value, onChange, readOnly, invalid }: QuestionProps) {
  const t = useTranslations("questionnaires.form");
  const id = useId();
  const errorId = `${id}-error`;
  const title = (
    <>
      {question.title}
      {question.isRequired && (
        <span className="text-destructive" aria-hidden>
          {" "}
          *
        </span>
      )}
    </>
  );
  const error = invalid && (
    <p id={errorId} className="text-sm text-destructive">
      {t("required")}
    </p>
  );
  const describedBy = invalid ? errorId : undefined;

  // Single-control questions get a <label>; groups get a <fieldset>/<legend>.
  if (question.type === "text" || question.type === "comment" || question.type === "dropdown") {
    return (
      <div className="flex flex-col gap-2">
        <Label htmlFor={id}>{title}</Label>
        {question.type === "text" && (
          <Input
            id={id}
            type={question.inputType ?? "text"}
            value={(value as string | number | undefined) ?? ""}
            onChange={(e) =>
              onChange(
                question.inputType === "number" && e.target.value !== ""
                  ? Number(e.target.value)
                  : e.target.value,
              )
            }
            readOnly={readOnly}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            aria-required={question.isRequired}
          />
        )}
        {question.type === "comment" && (
          <Textarea
            id={id}
            value={(value as string | undefined) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            readOnly={readOnly}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            aria-required={question.isRequired}
          />
        )}
        {question.type === "dropdown" && (
          <Select value={(value as string | undefined) ?? ""} onValueChange={onChange} disabled={readOnly}>
            <SelectTrigger
              id={id}
              className="w-full sm:w-80"
              aria-invalid={invalid}
              aria-describedby={describedBy}
            >
              <SelectValue placeholder={t("choose")} />
            </SelectTrigger>
            <SelectContent>
              {question.choices.map((choice) => (
                <SelectItem key={choice.value} value={choice.value}>
                  {choice.text}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {error}
      </div>
    );
  }

  let control;
  if (question.type === "checkbox") {
    const selected = Array.isArray(value) ? value : [];
    control = (
      <div className="flex flex-col gap-2">
        {question.choices.map((choice) => {
          const choiceId = `${id}-${choice.value}`;
          return (
            <div key={choice.value} className="flex items-center gap-2">
              <Checkbox
                id={choiceId}
                checked={selected.includes(choice.value)}
                disabled={readOnly}
                onCheckedChange={(checked) =>
                  onChange(checked ? [...selected, choice.value] : selected.filter((v) => v !== choice.value))
                }
              />
              <Label htmlFor={choiceId} className="font-normal">
                {choice.text}
              </Label>
            </div>
          );
        })}
      </div>
    );
  } else if (question.type === "radiogroup") {
    control = (
      <RadioOptions
        name={id}
        options={question.choices.map((c) => ({ value: c.value, label: c.text }))}
        value={value == null ? undefined : String(value)}
        onChange={onChange}
        readOnly={readOnly}
      />
    );
  } else if (question.type === "boolean") {
    control = (
      <RadioOptions
        name={id}
        inline
        options={[
          { value: "true", label: t("yes") },
          { value: "false", label: t("no") },
        ]}
        value={typeof value === "boolean" ? String(value) : undefined}
        onChange={(v) => onChange(v === "true")}
        readOnly={readOnly}
      />
    );
  } else {
    const steps = Array.from(
      { length: Math.max(0, question.rateMax - question.rateMin + 1) },
      (_, i) => question.rateMin + i,
    );
    control = (
      <RadioOptions
        name={id}
        inline
        options={steps.map((n) => ({ value: String(n), label: String(n) }))}
        value={value == null ? undefined : String(value)}
        onChange={(v) => onChange(Number(v))}
        readOnly={readOnly}
      />
    );
  }

  return (
    <fieldset className="flex flex-col gap-2" aria-invalid={invalid} aria-describedby={describedBy}>
      <legend className="mb-2 text-sm font-medium">{title}</legend>
      {control}
      {error}
    </fieldset>
  );
}

/** Renders a parsed questionnaire as an accessible form (controlled). */
export function SurveyForm({
  questions,
  answers,
  onChange,
  readOnly = false,
  invalidNames = [],
}: {
  questions: Question[];
  answers: Answers;
  onChange: (answers: Answers) => void;
  readOnly?: boolean;
  invalidNames?: string[];
}) {
  return (
    <ol className="flex flex-col gap-6">
      {questions.map((question, index) => (
        <li key={question.name} className="flex gap-3 rounded-lg border p-4">
          <span className="text-sm font-semibold text-muted-foreground tabular-nums" aria-hidden>
            {index + 1}.
          </span>
          <div className="flex-1">
            <QuestionField
              question={question}
              value={answers[question.name]}
              onChange={(value) => onChange({ ...answers, [question.name]: value })}
              readOnly={readOnly}
              invalid={invalidNames.includes(question.name)}
            />
          </div>
        </li>
      ))}
    </ol>
  );
}

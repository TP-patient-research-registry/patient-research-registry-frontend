"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";

import { TextareaField, TextField } from "@/components/forms/fields";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ApiError } from "@/lib/api/errors";
import { CRITERIA_SEXES, REGIONS } from "@/lib/api/types";

import { emptyStudyForm, studyFormSchema, type StudyFormValues } from "../schemas";

const SERVER_FIELDS = [
  "title",
  "description",
  "results_summary",
  "min_age",
  "max_age",
  "sex",
  "regions",
  "diagnoses",
];

/** Study details + eligibility criteria. Throws from `onSubmit` are mapped back onto the fields. */
export function StudyForm({
  defaultValues = emptyStudyForm,
  submitLabel,
  showResults = false,
  onSubmit,
}: {
  defaultValues?: StudyFormValues;
  submitLabel: string;
  showResults?: boolean;
  onSubmit: (values: StudyFormValues) => Promise<void>;
}) {
  const t = useTranslations("studies.form");
  const tRegion = useTranslations("enums.region");
  const tSex = useTranslations("enums.criteriaSex");

  const form = useForm<StudyFormValues>({ resolver: zodResolver(studyFormSchema), defaultValues });

  async function submit(values: StudyFormValues) {
    try {
      await onSubmit(values);
    } catch (error) {
      if (error instanceof ApiError) {
        for (const [field, msg] of Object.entries(error.fieldMessages())) {
          if (SERVER_FIELDS.includes(field)) form.setError(field as keyof StudyFormValues, { message: msg });
        }
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submit)} noValidate className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>
              <h2>{t("details")}</h2>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <TextField control={form.control} name="title" label={t("title")} required />
            <TextareaField
              control={form.control}
              name="description"
              label={t("description")}
              description={t("descriptionHelp")}
              rows={6}
              required
            />
            {showResults && (
              <TextareaField
                control={form.control}
                name="results_summary"
                label={t("results")}
                description={t("resultsHelp")}
                rows={4}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <h2>{t("criteria")}</h2>
            </CardTitle>
            <CardDescription>{t("criteriaHelp")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <TextField control={form.control} name="min_age" label={t("minAge")} inputMode="numeric" />
              <TextField control={form.control} name="max_age" label={t("maxAge")} inputMode="numeric" />
              <FormField
                control={form.control}
                name="sex"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("sex")}</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CRITERIA_SEXES.map((sex) => (
                          <SelectItem key={sex} value={sex}>
                            {tSex(sex)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="regions"
              render={({ field }) => (
                <fieldset className="flex flex-col gap-2">
                  <legend className="text-sm font-medium">{t("regions")}</legend>
                  <p className="text-sm text-muted-foreground">{t("regionsHelp")}</p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {REGIONS.map((region) => {
                      const id = `region-${region}`;
                      const checked = field.value.includes(region);
                      return (
                        <div key={region} className="flex items-center gap-2">
                          <Checkbox
                            id={id}
                            checked={checked}
                            onCheckedChange={(v) =>
                              field.onChange(
                                v ? [...field.value, region] : field.value.filter((r) => r !== region),
                              )
                            }
                          />
                          <Label htmlFor={id} className="font-normal">
                            {tRegion(region)}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </fieldset>
              )}
            />

            <TextField
              control={form.control}
              name="diagnoses"
              label={t("diagnoses")}
              description={t("diagnosesHelp")}
              placeholder="E11, I10"
            />
          </CardContent>
        </Card>

        <Button type="submit" className="self-start" disabled={form.formState.isSubmitting}>
          {submitLabel}
        </Button>
      </form>
    </Form>
  );
}

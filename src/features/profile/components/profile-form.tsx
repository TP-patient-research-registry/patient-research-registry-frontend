"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { TextField } from "@/components/forms/fields";
import { ErrorState, LoadingState } from "@/components/states";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ApiError, errorMessage } from "@/lib/api/errors";
import { type ParticipantProfile, REGIONS, SEXES } from "@/lib/api/types";
import { parseIcd10Codes } from "@/lib/icd10";

import { useProfile, useUpdateProfile } from "../api";
import { profileSchema, type ProfileValues } from "../schemas";

const NONE = "__none__"; // Radix Select can't use "" as an item value.

function toForm(profile: ParticipantProfile): ProfileValues {
  return {
    birth_year: profile.birth_year ? String(profile.birth_year) : "",
    sex: profile.sex ?? "",
    region: profile.region ?? "",
    diagnoses: (profile.diagnoses ?? []).join(", "),
  };
}

export function ProfileForm() {
  const t = useTranslations("profile");
  const tRegion = useTranslations("enums.region");
  const tSex = useTranslations("enums.sex");
  const profile = useProfile();
  const update = useUpdateProfile();
  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    values: profile.data ? toForm(profile.data) : undefined,
  });

  if (profile.isPending) return <LoadingState />;
  if (profile.isError) return <ErrorState error={profile.error} onRetry={() => profile.refetch()} />;

  async function onSubmit(values: ProfileValues) {
    try {
      const saved = await update.mutateAsync({
        birth_year: values.birth_year === "" ? null : Number(values.birth_year),
        sex: values.sex,
        region: values.region,
        diagnoses: parseIcd10Codes(values.diagnoses),
      });
      // Show the normalised values (e.g. upper-cased codes) even if nothing changed server-side.
      form.reset(toForm(saved));
      toast.success(t("saved"));
    } catch (error) {
      if (error instanceof ApiError) {
        for (const [field, message] of Object.entries(error.fieldMessages())) {
          if (field in values) form.setError(field as keyof ProfileValues, { message });
        }
      }
      toast.error(errorMessage(error, t("saveError")));
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2>{t("healthTitle")}</h2>
        </CardTitle>
        <CardDescription className="flex items-start gap-2">
          <Lock className="mt-0.5 size-4 shrink-0" aria-hidden />
          {t("encryptedNotice")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <TextField
                control={form.control}
                name="birth_year"
                label={t("birthYear")}
                inputMode="numeric"
                autoComplete="bday-year"
              />
              <FormField
                control={form.control}
                name="sex"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("sex")}</FormLabel>
                    <Select
                      value={field.value || NONE}
                      onValueChange={(v) => field.onChange(v === NONE ? "" : v)}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={NONE}>{t("notSpecified")}</SelectItem>
                        {SEXES.map((sex) => (
                          <SelectItem key={sex} value={sex}>
                            {tSex(sex)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("region")}</FormLabel>
                    <Select
                      value={field.value || NONE}
                      onValueChange={(v) => field.onChange(v === NONE ? "" : v)}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={NONE}>{t("notSpecified")}</SelectItem>
                        {REGIONS.map((region) => (
                          <SelectItem key={region} value={region}>
                            {tRegion(region)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
            <TextField
              control={form.control}
              name="diagnoses"
              label={t("diagnoses")}
              description={t("diagnosesHelp")}
              placeholder="E11, I10"
            />
            <Button type="submit" className="self-start" disabled={form.formState.isSubmitting}>
              {t("save")}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

/** 0–100 % of the matching-relevant profile fields that are filled in. */
export function profileCompleteness(profile: ParticipantProfile | undefined): number {
  if (!profile) return 0;
  const filled = [profile.birth_year, profile.sex, profile.region, profile.diagnoses?.length].filter(
    Boolean,
  ).length;
  return Math.round((filled / 4) * 100);
}

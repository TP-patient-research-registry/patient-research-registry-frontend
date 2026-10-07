"use client";

import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import { ErrorState, LoadingState } from "@/components/states";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ChangePasswordForm } from "@/features/auth/components/password-forms";
import { useNotificationPreferences, useUpdateNotificationPreferences } from "@/features/profile/api";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { errorMessage } from "@/lib/api/errors";

const PREFERENCES = ["email_matching_studies", "email_study_updates"] as const;

function NotificationSettings() {
  const t = useTranslations("participant.settings");
  const query = useNotificationPreferences();
  const update = useUpdateNotificationPreferences();

  if (query.isPending) return <LoadingState />;
  if (query.isError) return <ErrorState error={query.error} onRetry={() => query.refetch()} />;

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="sr-only">{t("notifications")}</legend>
      {PREFERENCES.map((key) => (
        <div key={key} className="flex items-start gap-3">
          <Checkbox
            id={key}
            checked={query.data[key] ?? false}
            disabled={update.isPending}
            onCheckedChange={(checked) =>
              update.mutate(
                { ...query.data, [key]: checked === true },
                {
                  onSuccess: () => toast.success(t("saved")),
                  onError: (error) => toast.error(errorMessage(error, t("saveError"))),
                },
              )
            }
          />
          <div className="flex flex-col gap-0.5">
            <Label htmlFor={key}>{t(`preferences.${key}.label`)}</Label>
            <p className="text-sm text-muted-foreground">{t(`preferences.${key}.help`)}</p>
          </div>
        </div>
      ))}
    </fieldset>
  );
}

export function Settings() {
  const t = useTranslations("participant.settings");
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>{t("notifications")}</h2>
          </CardTitle>
          <CardDescription>{t("notificationsHelp")}</CardDescription>
        </CardHeader>
        <CardContent>
          <NotificationSettings />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>{t("password")}</h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>{t("language")}</h2>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3">
          {routing.locales.map((l) => (
            <Link
              key={l}
              href={pathname}
              locale={l}
              aria-current={l === locale ? "true" : undefined}
              className={l === locale ? "font-semibold" : "text-primary underline underline-offset-4"}
            >
              {t(`languages.${l}`)}
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

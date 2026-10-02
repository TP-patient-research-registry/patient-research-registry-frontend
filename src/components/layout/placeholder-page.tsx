import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { routing } from "@/i18n/routing";

export type LocaleParams = { params: Promise<{ locale: string }> };

/** Validates the [locale] segment and enables static rendering for it. */
export async function initLocale(params: LocaleParams["params"]) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  return locale;
}

/** `generateMetadata` for a placeholder page backed by `pages.<pageKey>` messages. */
export function placeholderMetadata(pageKey: string) {
  return async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({
      locale: hasLocale(routing.locales, locale) ? locale : routing.defaultLocale,
    });
    return {
      title: t(`pages.${pageKey}.title`),
      description: t(`pages.${pageKey}.description`),
    };
  };
}

/** Title, purpose and TODO list for a not-yet-implemented page. */
export async function PlaceholderPage({ pageKey, children }: { pageKey: string; children?: ReactNode }) {
  const t = await getTranslations();
  const todo = t.raw(`pages.${pageKey}.todo`) as string[];

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-bold tracking-tight">{t(`pages.${pageKey}.title`)}</h1>
        <p className="text-muted-foreground">{t(`pages.${pageKey}.description`)}</p>
      </header>

      {children}

      <Card>
        <CardHeader>
          <CardTitle>
            <h2>{t("common.todo")}</h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-1 pl-5">
            {todo.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted-foreground">{t("common.placeholderNotice")}</p>
        </CardContent>
      </Card>
    </div>
  );
}

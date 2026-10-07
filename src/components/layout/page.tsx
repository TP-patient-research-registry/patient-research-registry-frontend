import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { routing } from "@/i18n/routing";

export type LocaleParams = { params: Promise<{ locale: string }> };

/** Validates the [locale] segment and enables static rendering for it. */
export async function initLocale(params: Promise<{ locale: string }>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  return locale;
}

/** `generateMetadata` for a page backed by `pages.<pageKey>.{title,description}` messages. */
export function pageMetadata(pageKey: string) {
  return async function generateMetadata({
    params,
  }: {
    params: Promise<{ locale: string }>;
  }): Promise<Metadata> {
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

/** Page title (the page's single <h1>), description and optional actions. */
export async function PageHeader({ pageKey, actions }: { pageKey: string; actions?: ReactNode }) {
  const t = await getTranslations(`pages.${pageKey}`);
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </header>
  );
}

/** Standard page body: header + content column. */
export async function Page({
  pageKey,
  actions,
  width = "max-w-5xl",
  children,
}: {
  pageKey: string;
  actions?: ReactNode;
  width?: string;
  children: ReactNode;
}) {
  return (
    <div className={`mx-auto flex w-full ${width} flex-col gap-6`}>
      <PageHeader pageKey={pageKey} actions={actions} />
      {children}
    </div>
  );
}

"use client";

import { Building2, CalendarDays } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import type { PublicStudy } from "@/lib/api/types";

import { useCriteriaLines } from "./criteria-summary";

export function StudyCard({
  study,
  href,
  actions,
}: {
  study: PublicStudy;
  href: string;
  actions?: ReactNode;
}) {
  const t = useTranslations("studies");
  const format = useFormatter();
  const criteria = useCriteriaLines(study.criteria);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>
          <h3 className="text-lg leading-snug">
            <Link href={href} className="underline-offset-4 hover:underline">
              {study.title}
            </Link>
          </h3>
        </CardTitle>
        <CardDescription className="flex flex-wrap gap-x-4 gap-y-1">
          {study.organization && (
            <span className="flex items-center gap-1">
              <Building2 className="size-3.5" aria-hidden />
              {study.organization}
            </span>
          )}
          {study.published_at && (
            <span className="flex items-center gap-1">
              <CalendarDays className="size-3.5" aria-hidden />
              {t("publishedOn", {
                date: format.dateTime(new Date(study.published_at), { dateStyle: "medium" }),
              })}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        <p className="line-clamp-3 text-sm text-muted-foreground">{study.description}</p>
        {criteria.length > 0 && (
          <ul className="flex flex-wrap gap-1.5" aria-label={t("criteria.title")}>
            {criteria.map((line) => (
              <li key={line} className="rounded-full bg-muted px-2.5 py-0.5 text-xs">
                {line}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      {actions && <CardFooter className="gap-2">{actions}</CardFooter>}
    </Card>
  );
}

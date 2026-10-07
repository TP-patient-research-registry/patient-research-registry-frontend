"use client";

import { useTranslations } from "next-intl";

import { ErrorState, LoadingState } from "@/components/states";

import { usePublicStudies } from "../api";
import { StudyCard } from "./study-card";

export function FeaturedStudies() {
  const t = useTranslations("studies");
  const query = usePublicStudies({});
  if (query.isPending) return <LoadingState />;
  if (query.isError) return <ErrorState error={query.error} onRetry={() => query.refetch()} />;
  if (query.data.results.length === 0) return <p className="text-muted-foreground">{t("empty")}</p>;
  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {query.data.results.slice(0, 4).map((study) => (
        <li key={study.id}>
          <StudyCard study={study} href={`/studies/${study.id}`} />
        </li>
      ))}
    </ul>
  );
}

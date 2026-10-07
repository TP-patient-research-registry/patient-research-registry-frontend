"use client";

import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

import { EmptyState, ErrorState, LoadingState } from "@/components/states";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRecommendedStudies } from "@/features/studies/api";
import { ApplyButton } from "@/features/studies/components/apply-button";
import { PublicStudyList } from "@/features/studies/components/public-study-list";
import { StudyCard } from "@/features/studies/components/study-card";
import { Link } from "@/i18n/navigation";

function Recommended() {
  const t = useTranslations("participant.findStudies");
  const query = useRecommendedStudies();

  if (query.isPending) return <LoadingState />;
  if (query.isError) return <ErrorState error={query.error} onRetry={() => query.refetch()} />;
  if (query.data.results.length === 0) {
    return (
      <EmptyState title={t("noRecommendations")}>
        {t.rich("noRecommendationsHelp", {
          link: (chunks) => (
            <Link href="/participant/profile" className="text-primary underline underline-offset-4">
              {chunks}
            </Link>
          ),
        })}
      </EmptyState>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Sparkles className="size-4 text-primary" aria-hidden />
        {t("recommendedHelp")}
      </p>
      <ul className="grid gap-4 md:grid-cols-2">
        {query.data.results.map((study) => (
          <li key={study.id}>
            <StudyCard
              study={study}
              href={`/participant/studies/${study.id}`}
              actions={<ApplyButton studyId={study.id} />}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FindStudies() {
  const t = useTranslations("participant.findStudies");
  return (
    <Tabs defaultValue="recommended" className="gap-4">
      <TabsList>
        <TabsTrigger value="recommended">{t("recommendedTab")}</TabsTrigger>
        <TabsTrigger value="search">{t("searchTab")}</TabsTrigger>
      </TabsList>
      <TabsContent value="recommended">
        <Recommended />
      </TabsContent>
      <TabsContent value="search">
        <PublicStudyList hrefFor={(id) => `/participant/studies/${id}`} />
      </TabsContent>
    </Tabs>
  );
}

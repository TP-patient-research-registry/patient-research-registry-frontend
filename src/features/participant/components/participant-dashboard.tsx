"use client";

import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useConsentHistory } from "@/features/consent/api";
import { useProfile } from "@/features/profile/api";
import { profileCompleteness } from "@/features/profile/components/profile-form";
import { QuestionnaireList } from "@/features/questionnaires/components/questionnaire-list";
import { useEnrollments, useRecommendedStudies } from "@/features/studies/api";
import { StudyCard } from "@/features/studies/components/study-card";
import { Link } from "@/i18n/navigation";

function Stat({
  label,
  value,
  href,
  cta,
}: {
  label: string;
  value: number | string;
  href: string;
  cta: string;
}) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <p className="text-3xl font-semibold tabular-nums">{value}</p>
      </CardHeader>
      <CardContent>
        <Link
          href={href}
          className="flex items-center gap-1 text-sm text-primary underline-offset-4 hover:underline"
        >
          {cta}
          <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </CardContent>
    </Card>
  );
}

function Checklist() {
  const t = useTranslations("participant.dashboard");
  const profile = useProfile();
  const consents = useConsentHistory();
  const completeness = profileCompleteness(profile.data);
  const hasHealthConsent = consents.data?.results.some(
    (c) => c.is_active && c.document.kind === "health_data_processing",
  );

  if (profile.isPending || consents.isPending || (completeness === 100 && hasHealthConsent)) return null;

  return (
    <Card className="border-primary/40 bg-primary/5">
      <CardHeader>
        <CardTitle>
          <h2>{t("getStarted")}</h2>
        </CardTitle>
        <CardDescription>{t("getStartedHelp")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {completeness < 100 && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <span>{t("profileComplete", { percent: completeness })}</span>
              <Link href="/participant/profile" className="text-primary underline underline-offset-4">
                {t("completeProfile")}
              </Link>
            </div>
            <div
              role="progressbar"
              aria-label={t("profileProgress")}
              aria-valuenow={completeness}
              aria-valuemin={0}
              aria-valuemax={100}
              className="h-2 overflow-hidden rounded-full bg-muted"
            >
              <div className="h-full bg-primary transition-all" style={{ width: `${completeness}%` }} />
            </div>
          </div>
        )}
        {!hasHealthConsent && (
          <p className="flex flex-wrap items-center justify-between gap-2 text-sm">
            {t("consentMissing")}
            <Link href="/participant/consents" className="text-primary underline underline-offset-4">
              {t("toConsents")}
            </Link>
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function ParticipantDashboard() {
  const t = useTranslations("participant.dashboard");
  const enrollments = useEnrollments();
  const recommended = useRecommendedStudies();

  const active = enrollments.data?.results.filter(
    (e) => e.status === "applied" || e.status === "enrolled",
  ).length;

  return (
    <div className="flex flex-col gap-6">
      <Checklist />
      <div className="grid gap-3 sm:grid-cols-2">
        <Stat
          label={t("activeStudies")}
          value={active ?? "–"}
          href="/participant/my-studies"
          cta={t("viewMyStudies")}
        />
        <Stat
          label={t("recommended")}
          value={recommended.data?.count ?? "–"}
          href="/participant/studies"
          cta={t("viewRecommended")}
        />
      </div>

      <section aria-labelledby="pending-q" className="flex flex-col gap-3">
        <h2 id="pending-q" className="text-xl font-semibold">
          {t("questionnaires")}
        </h2>
        <QuestionnaireList limit={3} />
      </section>

      {recommended.data && recommended.data.results.length > 0 && (
        <section aria-labelledby="rec" className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 id="rec" className="text-xl font-semibold">
              {t("recommendedForYou")}
            </h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/participant/studies">{t("seeAll")}</Link>
            </Button>
          </div>
          <ul className="grid gap-4 md:grid-cols-2">
            {recommended.data.results.slice(0, 2).map((study) => (
              <li key={study.id}>
                <StudyCard study={study} href={`/participant/studies/${study.id}`} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

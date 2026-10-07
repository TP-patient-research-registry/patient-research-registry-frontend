"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { BadgeCheck, Clock, FilePlus2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { TextField } from "@/components/forms/fields";
import { ErrorState, LoadingState } from "@/components/states";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import {
  useResearcherProfile,
  useResearcherStudies,
  useUpdateResearcherProfile,
} from "@/features/studies/api";
import { Link } from "@/i18n/navigation";
import { errorMessage } from "@/lib/api/errors";
import type { StudyStatus } from "@/lib/api/types";

import { ResearcherStudiesTable } from "./researcher-studies-table";

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <p className="text-3xl font-semibold tabular-nums">{value}</p>
      </CardHeader>
    </Card>
  );
}

const institutionSchema = z.object({ institution: z.string().trim().max(255, { error: "tooLong" }) });

function VerificationCard() {
  const t = useTranslations("researcher.dashboard");
  const profile = useResearcherProfile();
  const update = useUpdateResearcherProfile();
  const form = useForm({
    resolver: zodResolver(institutionSchema),
    values: { institution: profile.data?.institution ?? "" },
  });

  if (profile.isPending) return <LoadingState />;
  if (profile.isError) return <ErrorState error={profile.error} onRetry={() => profile.refetch()} />;

  const { is_verified: verified, organization } = profile.data;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2 className="flex items-center gap-2">
            {verified ? (
              <BadgeCheck className="size-5 text-primary" aria-hidden />
            ) : (
              <Clock className="size-5 text-amber-600" aria-hidden />
            )}
            {verified ? t("verified") : t("notVerified")}
          </h2>
        </CardTitle>
        <CardDescription>
          {verified ? t("verifiedHelp", { organization: organization?.name ?? "—" }) : t("notVerifiedHelp")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            noValidate
            className="flex max-w-lg items-end gap-2"
            onSubmit={form.handleSubmit((values) =>
              update.mutateAsync(values.institution).then(
                () => toast.success(t("saved")),
                (error) => toast.error(errorMessage(error, t("saveError"))),
              ),
            )}
          >
            <div className="flex-1">
              <TextField control={form.control} name="institution" label={t("institution")} />
            </div>
            <Button type="submit" variant="outline" disabled={update.isPending}>
              {t("save")}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export function ResearcherDashboard() {
  const t = useTranslations("researcher.dashboard");
  const tStatus = useTranslations("enums.studyStatus");
  const studies = useResearcherStudies();

  const counts = (studies.data?.results ?? []).reduce(
    (acc, s) => ({ ...acc, [s.status]: acc[s.status] + 1 }),
    { draft: 0, published: 0, closed: 0 } as Record<StudyStatus, number>,
  );
  const participants = (studies.data?.results ?? []).reduce((sum, s) => sum + s.enrollment_count, 0);

  return (
    <div className="flex flex-col gap-6">
      <VerificationCard />

      <section aria-labelledby="stats" className="flex flex-col gap-3">
        <h2 id="stats" className="sr-only">
          {t("stats")}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label={tStatus("draft")} value={counts.draft} />
          <StatCard label={tStatus("published")} value={counts.published} />
          <StatCard label={tStatus("closed")} value={counts.closed} />
          <StatCard label={t("participants")} value={participants} />
        </div>
      </section>

      <section aria-labelledby="recent" className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <h2 id="recent" className="text-xl font-semibold">
            {t("recentStudies")}
          </h2>
          <Button asChild>
            <Link href="/researcher/studies/new">
              <FilePlus2 aria-hidden />
              {t("newStudy")}
            </Link>
          </Button>
        </div>
        <ResearcherStudiesTable limit={5} />
      </section>
    </div>
  );
}

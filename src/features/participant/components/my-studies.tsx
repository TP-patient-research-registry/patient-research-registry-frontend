"use client";

import { useFormatter, useTranslations } from "next-intl";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState, ErrorState, LoadingState } from "@/components/states";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEnrollments, useWithdrawEnrollment } from "@/features/studies/api";
import { EnrollmentStatusBadge, StudyStatusBadge } from "@/features/studies/components/status-badges";
import { Link } from "@/i18n/navigation";
import { errorMessage } from "@/lib/api/errors";

export function MyStudies() {
  const t = useTranslations("participant.myStudies");
  const format = useFormatter();
  const query = useEnrollments();
  const withdraw = useWithdrawEnrollment();

  if (query.isPending) return <LoadingState />;
  if (query.isError) return <ErrorState error={query.error} onRetry={() => query.refetch()} />;
  if (query.data.results.length === 0) {
    return (
      <EmptyState title={t("empty")}>
        <Link href="/participant/studies" className="text-primary underline underline-offset-4">
          {t("findStudies")}
        </Link>
      </EmptyState>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("study")}</TableHead>
              <TableHead>{t("yourStatus")}</TableHead>
              <TableHead>{t("studyStatus")}</TableHead>
              <TableHead>{t("since")}</TableHead>
              <TableHead className="text-right">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.data.results.map((enrollment) => (
              <TableRow key={enrollment.id}>
                <TableCell className="max-w-sm font-medium whitespace-normal">
                  <Link
                    href={`/participant/studies/${enrollment.study.id}`}
                    className="underline-offset-4 hover:underline"
                  >
                    {enrollment.study.title}
                  </Link>
                </TableCell>
                <TableCell>
                  <EnrollmentStatusBadge status={enrollment.status} />
                </TableCell>
                <TableCell>
                  <StudyStatusBadge status={enrollment.study.status} />
                </TableCell>
                <TableCell>
                  {format.dateTime(new Date(enrollment.created_at), { dateStyle: "medium" })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {enrollment.status === "enrolled" && (
                      <Button asChild size="sm" variant="outline">
                        <Link href="/participant/questionnaires">{t("questionnaires")}</Link>
                      </Button>
                    )}
                    {(enrollment.status === "applied" || enrollment.status === "enrolled") && (
                      <ConfirmDialog
                        trigger={
                          <Button size="sm" variant="ghost">
                            {t("withdraw")}
                          </Button>
                        }
                        title={t("withdrawTitle")}
                        description={t("withdrawConfirm", { title: enrollment.study.title })}
                        confirmLabel={t("withdraw")}
                        destructive
                        onConfirm={() =>
                          withdraw.mutateAsync(enrollment.id).then(
                            () => toast.success(t("withdrawn")),
                            (error) => {
                              toast.error(errorMessage(error, t("error")));
                              throw error;
                            },
                          )
                        }
                      />
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {query.data.results.some((e) => e.study.results_summary) && (
        <section aria-labelledby="results" className="flex flex-col gap-3">
          <h2 id="results" className="text-xl font-semibold">
            {t("results")}
          </h2>
          {query.data.results
            .filter((e) => e.study.results_summary)
            .map((e) => (
              <article key={e.id} className="rounded-lg border p-4">
                <h3 className="font-medium">{e.study.title}</h3>
                <p className="mt-2 text-sm whitespace-pre-line">{e.study.results_summary}</p>
              </article>
            ))}
        </section>
      )}
    </div>
  );
}

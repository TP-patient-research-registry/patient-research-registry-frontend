"use client";

import { useFormatter, useTranslations } from "next-intl";
import { toast } from "sonner";

import { EmptyState, ErrorState, LoadingState } from "@/components/states";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  RESEARCHER_TRANSITIONS,
  useChangeParticipantStatus,
  useStudyParticipants,
} from "@/features/studies/api";
import { EnrollmentStatusBadge } from "@/features/studies/components/status-badges";
import { errorMessage } from "@/lib/api/errors";
import type { EnrollmentStatus } from "@/lib/api/types";

export function StudyParticipants({ studyId }: { studyId: string }) {
  const t = useTranslations("researcher.participants");
  const format = useFormatter();
  const query = useStudyParticipants(studyId);
  const change = useChangeParticipantStatus(studyId);

  if (query.isPending) return <LoadingState />;
  if (query.isError) return <ErrorState error={query.error} onRetry={() => query.refetch()} />;

  const participants = query.data.results;
  if (participants.length === 0) return <EmptyState title={t("empty")}>{t("emptyHelp")}</EmptyState>;

  function setStatus(pseudonym: string, status: EnrollmentStatus) {
    change.mutate(
      { pseudonym, status },
      {
        onSuccess: () => toast.success(t("updated")),
        onError: (error) => toast.error(errorMessage(error, t("updateError"))),
      },
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">{t("pseudonymNotice")}</p>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("pseudonym")}</TableHead>
              <TableHead>{t("status")}</TableHead>
              <TableHead>{t("applied")}</TableHead>
              <TableHead className="text-right">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {participants.map((p) => (
              <TableRow key={p.participant_id}>
                <TableCell className="font-mono text-xs" title={p.participant_id}>
                  {p.participant_id.slice(0, 8)}
                </TableCell>
                <TableCell>
                  <EnrollmentStatusBadge status={p.status} />
                </TableCell>
                <TableCell>{format.dateTime(new Date(p.created_at), { dateStyle: "medium" })}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {(RESEARCHER_TRANSITIONS[p.status] ?? []).map((target) => (
                      <Button
                        key={target}
                        size="sm"
                        variant={target === "withdrawn" ? "outline" : "default"}
                        disabled={change.isPending}
                        onClick={() => setStatus(p.participant_id, target)}
                      >
                        {t(`transition.${target}`)}
                      </Button>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

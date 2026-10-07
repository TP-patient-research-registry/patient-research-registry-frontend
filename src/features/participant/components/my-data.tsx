"use client";

import { Download, ShieldCheck, Trash2 } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState, ErrorState, LoadingState } from "@/components/states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  downloadDataExport,
  useAccessLog,
  useDeletionRequests,
  useRequestDeletion,
} from "@/features/profile/api";
import { errorMessage } from "@/lib/api/errors";

function ExportCard() {
  const t = useTranslations("participant.myData");
  const [busy, setBusy] = useState(false);
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2>{t("exportTitle")}</h2>
        </CardTitle>
        <CardDescription>{t("exportHelp")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await downloadDataExport();
            } catch {
              toast.error(t("exportError"));
            } finally {
              setBusy(false);
            }
          }}
        >
          <Download aria-hidden />
          {t("export")}
        </Button>
      </CardContent>
    </Card>
  );
}

function DeletionCard() {
  const t = useTranslations("participant.myData");
  const tStatus = useTranslations("enums.deletionStatus");
  const format = useFormatter();
  const requests = useDeletionRequests();
  const request = useRequestDeletion();
  const [reason, setReason] = useState("");
  const pending = requests.data?.results.find((r) => r.status === "pending" || r.status === "processing");

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2>{t("deleteTitle")}</h2>
        </CardTitle>
        <CardDescription>{t("deleteHelp")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {requests.isPending ? (
          <LoadingState />
        ) : requests.isError ? (
          <ErrorState error={requests.error} onRetry={() => requests.refetch()} />
        ) : (
          <>
            {requests.data.results.length > 0 && (
              <ul className="flex flex-col gap-2 text-sm">
                {requests.data.results.map((r) => (
                  <li key={r.id} className="flex flex-wrap items-center gap-2">
                    <Badge variant={r.status === "rejected" ? "destructive" : "outline"}>
                      {tStatus(r.status)}
                    </Badge>
                    {t("requestedOn", {
                      date: format.dateTime(new Date(r.created_at), { dateStyle: "medium" }),
                    })}
                  </li>
                ))}
              </ul>
            )}
            {pending ? (
              <p className="text-sm text-muted-foreground">{t("pendingNotice")}</p>
            ) : (
              <ConfirmDialog
                trigger={
                  <Button variant="destructive" className="self-start">
                    <Trash2 aria-hidden />
                    {t("requestDeletion")}
                  </Button>
                }
                title={t("deleteConfirmTitle")}
                description={t("deleteConfirm")}
                confirmLabel={t("requestDeletion")}
                destructive
                onConfirm={() =>
                  request.mutateAsync(reason).then(
                    () => {
                      toast.success(t("requested"));
                      setReason("");
                    },
                    (error) => {
                      toast.error(errorMessage(error, t("error")));
                      throw error;
                    },
                  )
                }
              >
                <div className="flex flex-col gap-2">
                  <Label htmlFor="deletion-reason">{t("reason")}</Label>
                  <Textarea id="deletion-reason" value={reason} onChange={(e) => setReason(e.target.value)} />
                </div>
              </ConfirmDialog>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function AccessLog() {
  const t = useTranslations("participant.myData.log");
  const format = useFormatter();
  const [page, setPage] = useState(1);
  const query = useAccessLog(page);

  return (
    <section aria-labelledby="access-log" className="flex flex-col gap-3">
      <h2 id="access-log" className="flex items-center gap-2 text-xl font-semibold">
        <ShieldCheck className="size-5 text-primary" aria-hidden />
        {t("title")}
      </h2>
      <p className="text-sm text-muted-foreground">{t("help")}</p>
      {query.isPending ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : query.data.results.length === 0 ? (
        <EmptyState title={t("empty")} />
      ) : (
        <>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("when")}</TableHead>
                  <TableHead>{t("who")}</TableHead>
                  <TableHead>{t("what")}</TableHead>
                  <TableHead>{t("data")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.data.results.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      {format.dateTime(new Date(entry.timestamp), {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </TableCell>
                    <TableCell>
                      {t.has(`actors.${entry.actor}`) ? t(`actors.${entry.actor}`) : entry.actor}
                    </TableCell>
                    <TableCell>
                      {t.has(`actions.${entry.action}`) ? t(`actions.${entry.action}`) : entry.action}
                    </TableCell>
                    <TableCell>
                      {t.has(`objects.${entry.object_type}`)
                        ? t(`objects.${entry.object_type}`)
                        : entry.object_type}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {(query.data.next || query.data.previous) && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!query.data.previous}
                onClick={() => setPage((p) => p - 1)}
              >
                {t("newer")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!query.data.next}
                onClick={() => setPage((p) => p + 1)}
              >
                {t("older")}
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export function MyData() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2">
        <ExportCard />
        <DeletionCard />
      </div>
      <AccessLog />
    </div>
  );
}

"use client";

import { CheckCircle2, CircleDashed, RefreshCw } from "lucide-react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { ErrorState, LoadingState } from "@/components/states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { errorMessage } from "@/lib/api/errors";
import type { Consent, ConsentDocument } from "@/lib/api/types";

import {
  CONSENT_KINDS,
  pickDocuments,
  useConsentDocuments,
  useConsentHistory,
  useGrantConsent,
  useWithdrawConsent,
} from "../api";

function ConsentCard({ document, active }: { document: ConsentDocument; active: Consent | undefined }) {
  const t = useTranslations("consents");
  const tKind = useTranslations("enums.consentKind");
  const format = useFormatter();
  const [confirmed, setConfirmed] = useState(false);
  const grant = useGrantConsent();
  const withdraw = useWithdrawConsent();
  const upToDate = active?.document.id === document.id;
  const outdated = active && !upToDate;
  const checkboxId = `confirm-${document.id}`;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle>
            <h2 className="text-lg">{tKind(document.kind)}</h2>
          </CardTitle>
          {upToDate ? (
            <Badge>
              <CheckCircle2 aria-hidden />
              {t("granted")}
            </Badge>
          ) : outdated ? (
            <Badge variant="outline">
              <RefreshCw aria-hidden />
              {t("newVersion")}
            </Badge>
          ) : (
            <Badge variant="outline">
              <CircleDashed aria-hidden />
              {t("notGranted")}
            </Badge>
          )}
        </div>
        <CardDescription>
          {t("version", { version: document.version })}
          {active &&
            ` · ${t("grantedOn", { date: format.dateTime(new Date(active.granted_at), { dateStyle: "medium" }) })}`}
        </CardDescription>
        <p className="text-sm">{t(`purpose.${document.kind}`)}</p>
      </CardHeader>
      <CardContent>
        <details className="rounded-lg border bg-muted/30 p-3">
          <summary className="cursor-pointer text-sm font-medium">
            {t("readText", { title: document.title })}
          </summary>
          <p className="mt-3 text-sm whitespace-pre-line">{document.text}</p>
        </details>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-3">
        {!upToDate && (
          <>
            <div className="flex items-start gap-2">
              <Checkbox
                id={checkboxId}
                checked={confirmed}
                onCheckedChange={(v) => setConfirmed(v === true)}
              />
              <Label htmlFor={checkboxId} className="leading-snug font-normal">
                {t("confirmRead")}
              </Label>
            </div>
            <Button
              disabled={!confirmed || grant.isPending}
              onClick={() =>
                grant.mutate(document.id, {
                  onSuccess: () => {
                    toast.success(t("grantedToast"));
                    setConfirmed(false);
                  },
                  onError: (error) => toast.error(errorMessage(error, t("error"))),
                })
              }
            >
              {t("grant")}
            </Button>
          </>
        )}
        {active && (
          <ConfirmDialog
            trigger={<Button variant="outline">{t("withdraw")}</Button>}
            title={t("withdrawTitle")}
            description={t(`withdrawConsequence.${document.kind}`)}
            confirmLabel={t("withdraw")}
            destructive
            onConfirm={() =>
              withdraw.mutateAsync(active.id).then(
                () => toast.success(t("withdrawnToast")),
                (error) => {
                  toast.error(errorMessage(error, t("error")));
                  throw error;
                },
              )
            }
          />
        )}
      </CardFooter>
    </Card>
  );
}

function ConsentHistory({ consents }: { consents: Consent[] }) {
  const t = useTranslations("consents.history");
  const tKind = useTranslations("enums.consentKind");
  const format = useFormatter();
  const date = (value: string | null) =>
    value ? format.dateTime(new Date(value), { dateStyle: "medium", timeStyle: "short" }) : "—";

  return (
    <section aria-labelledby="consent-history" className="flex flex-col gap-3">
      <h2 id="consent-history" className="text-xl font-semibold">
        {t("title")}
      </h2>
      <p className="text-sm text-muted-foreground">{t("help")}</p>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("consent")}</TableHead>
              <TableHead>{t("version")}</TableHead>
              <TableHead>{t("granted")}</TableHead>
              <TableHead>{t("withdrawn")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {consents.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{tKind(c.document.kind)}</TableCell>
                <TableCell>{c.document.version}</TableCell>
                <TableCell>{date(c.granted_at)}</TableCell>
                <TableCell>{date(c.withdrawn_at)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

export function ConsentManager() {
  const locale = useLocale();
  const documents = useConsentDocuments();
  const history = useConsentHistory();

  if (documents.isPending || history.isPending) return <LoadingState />;
  if (documents.isError) return <ErrorState error={documents.error} onRetry={() => documents.refetch()} />;
  if (history.isError) return <ErrorState error={history.error} onRetry={() => history.refetch()} />;

  const current = pickDocuments(documents.data, locale);
  const consents = history.data.results;

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4">
        {CONSENT_KINDS.map((kind) => {
          const document = current.get(kind);
          if (!document) return null;
          const active = consents.find((c) => c.is_active && c.document.kind === kind);
          return <ConsentCard key={kind} document={document} active={active} />;
        })}
      </div>
      {consents.length > 0 && <ConsentHistory consents={consents} />}
    </div>
  );
}

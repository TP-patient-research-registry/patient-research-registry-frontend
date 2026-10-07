"use client";

import { ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { useResearcherProfile, useStudyAction, useUpdateStudy } from "@/features/studies/api";
import { StudyForm } from "@/features/studies/components/study-form";
import { formToPayload, studyToForm } from "@/features/studies/schemas";
import { Link, useRouter } from "@/i18n/navigation";
import { errorMessage } from "@/lib/api/errors";
import type { ResearcherStudy } from "@/lib/api/types";

import { StudyScope } from "./study-header";

function StudyActions({ study }: { study: ResearcherStudy }) {
  const t = useTranslations("researcher.study");
  const router = useRouter();
  const profile = useResearcherProfile();
  const action = useStudyAction(study.id);

  const run = (kind: "publish" | "close" | "delete", success: string) => async () => {
    try {
      await action.mutateAsync(kind);
      toast.success(success);
      if (kind === "delete") router.replace("/researcher/studies");
    } catch (error) {
      toast.error(errorMessage(error, t("actionError")));
      throw error;
    }
  };

  return (
    <>
      {study.status !== "draft" && (
        <Button asChild variant="outline">
          <Link href={`/studies/${study.id}`}>
            <ExternalLink aria-hidden />
            {t("viewPublic")}
          </Link>
        </Button>
      )}
      {study.status === "draft" && (
        <>
          <ConfirmDialog
            trigger={<Button disabled={profile.data?.is_verified === false}>{t("publish")}</Button>}
            title={t("publishTitle")}
            description={t("publishConfirm")}
            confirmLabel={t("publish")}
            onConfirm={run("publish", t("published"))}
          />
          <ConfirmDialog
            trigger={<Button variant="destructive">{t("delete")}</Button>}
            title={t("deleteTitle")}
            description={t("deleteConfirm")}
            confirmLabel={t("delete")}
            destructive
            onConfirm={run("delete", t("deleted"))}
          />
        </>
      )}
      {study.status === "published" && (
        <ConfirmDialog
          trigger={<Button variant="outline">{t("close")}</Button>}
          title={t("closeTitle")}
          description={t("closeConfirm")}
          confirmLabel={t("close")}
          onConfirm={run("close", t("closed"))}
        />
      )}
    </>
  );
}

function EditStudy({ study }: { study: ResearcherStudy }) {
  const t = useTranslations("researcher.study");
  const profile = useResearcherProfile();
  const update = useUpdateStudy(study.id);

  return (
    <div className="flex flex-col gap-4">
      {study.status === "draft" && profile.data?.is_verified === false && (
        <p role="note" className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
          {t("verifyToPublish")}
        </p>
      )}
      <StudyForm
        key={study.updated_at}
        defaultValues={studyToForm(study)}
        showResults={study.status !== "draft"}
        submitLabel={t("save")}
        onSubmit={async (values) => {
          try {
            await update.mutateAsync(formToPayload(values));
            toast.success(t("saved"));
          } catch (error) {
            toast.error(errorMessage(error, t("saveError")));
            throw error;
          }
        }}
      />
    </div>
  );
}

export function StudyManage({ studyId }: { studyId: string }) {
  return (
    <StudyScope studyId={studyId} actions={(study) => <StudyActions study={study} />}>
      {(study) => <EditStudy study={study} />}
    </StudyScope>
  );
}

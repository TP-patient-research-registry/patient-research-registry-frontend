"use client";

import { CheckCircle2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useSession } from "@/features/auth/hooks/use-session";
import { Link } from "@/i18n/navigation";
import { ApiError, errorMessage } from "@/lib/api/errors";

import { useApplyToStudy, useEnrollments } from "../api";
import { EnrollmentStatusBadge } from "./status-badges";

/**
 * "Join study" call to action, aware of who is looking:
 * visitors get a login link, participants can apply (or see their current status).
 */
export function ApplyButton({ studyId }: { studyId: string }) {
  const t = useTranslations("studies.apply");
  const locale = useLocale();
  const { data: session, isPending } = useSession();
  const isParticipant = session?.user?.role === "participant";
  const enrollments = useEnrollments({ enabled: isParticipant });
  const apply = useApplyToStudy();

  if (isPending) return null;

  if (!session?.isAuthenticated) {
    return (
      <Button asChild>
        <Link href={{ pathname: "/login", query: { next: `/${locale}/studies/${studyId}` } }}>
          {t("loginToApply")}
        </Link>
      </Button>
    );
  }

  if (!isParticipant) return <p className="text-sm text-muted-foreground">{t("participantsOnly")}</p>;

  const enrollment = enrollments.data?.results.find((e) => e.study.id === studyId);
  if (enrollment && enrollment.status !== "withdrawn") {
    return (
      <p className="flex items-center gap-2 text-sm">
        <CheckCircle2 className="size-4 text-primary" aria-hidden />
        {t("alreadyApplied")} <EnrollmentStatusBadge status={enrollment.status} />
      </p>
    );
  }

  const needsConsent =
    apply.error instanceof ApiError && apply.error.status === 400 && /consent/i.test(apply.error.message);

  return (
    <div className="flex flex-col items-start gap-2">
      <Button
        disabled={apply.isPending || enrollments.isPending}
        onClick={() =>
          apply.mutate(studyId, {
            onSuccess: () => toast.success(t("success")),
            onError: (error) => toast.error(errorMessage(error, t("error"))),
          })
        }
      >
        {t("apply")}
      </Button>
      {needsConsent && (
        <p role="alert" className="text-sm">
          {t("consentRequired")}{" "}
          <Link href="/participant/consents" className="text-primary underline underline-offset-4">
            {t("toConsents")}
          </Link>
        </p>
      )}
    </div>
  );
}

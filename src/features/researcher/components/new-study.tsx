"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { useCreateStudy } from "@/features/studies/api";
import { StudyForm } from "@/features/studies/components/study-form";
import { formToPayload } from "@/features/studies/schemas";
import { useRouter } from "@/i18n/navigation";
import { errorMessage } from "@/lib/api/errors";

export function NewStudy() {
  const t = useTranslations("researcher.study");
  const router = useRouter();
  const create = useCreateStudy();

  return (
    <StudyForm
      submitLabel={t("createDraft")}
      onSubmit={async (values) => {
        try {
          const study = await create.mutateAsync(formToPayload(values));
          toast.success(t("created"));
          router.push(`/researcher/studies/${study.id}`);
        } catch (error) {
          toast.error(errorMessage(error, t("saveError")));
          throw error;
        }
      }}
    />
  );
}

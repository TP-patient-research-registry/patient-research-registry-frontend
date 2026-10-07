"use client";

import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import type { EnrollmentStatus, StudyStatus } from "@/lib/api/types";

const STUDY_VARIANT = { draft: "outline", published: "default", closed: "secondary" } as const;
const ENROLLMENT_VARIANT = {
  applied: "outline",
  enrolled: "default",
  withdrawn: "destructive",
  completed: "secondary",
} as const;

export function StudyStatusBadge({ status }: { status: StudyStatus }) {
  const t = useTranslations("enums.studyStatus");
  return <Badge variant={STUDY_VARIANT[status]}>{t(status)}</Badge>;
}

export function EnrollmentStatusBadge({ status }: { status: EnrollmentStatus }) {
  const t = useTranslations("enums.enrollmentStatus");
  return <Badge variant={ENROLLMENT_VARIANT[status]}>{t(status)}</Badge>;
}

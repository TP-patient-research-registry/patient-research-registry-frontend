"use client";

import { StudyQuestionnaires } from "@/features/questionnaires/components/study-questionnaires";

import { StudyScope } from "./study-header";
import { StudyParticipants } from "./study-participants";

export function StudyParticipantsScreen({ studyId }: { studyId: string }) {
  return <StudyScope studyId={studyId}>{() => <StudyParticipants studyId={studyId} />}</StudyScope>;
}

export function StudyQuestionnairesScreen({ studyId }: { studyId: string }) {
  return <StudyScope studyId={studyId}>{() => <StudyQuestionnaires studyId={studyId} />}</StudyScope>;
}

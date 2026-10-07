import { initLocale, pageMetadata } from "@/components/layout/page";
import { StudyParticipantsScreen } from "@/features/researcher/components/study-screens";

export const generateMetadata = pageMetadata("researcherStudyParticipants");

export default async function Route({ params }: PageProps<"/[locale]/researcher/studies/[id]/participants">) {
  await initLocale(params);
  const { id } = await params;
  return (
    <div className="mx-auto w-full max-w-5xl">
      <StudyParticipantsScreen studyId={id} />
    </div>
  );
}

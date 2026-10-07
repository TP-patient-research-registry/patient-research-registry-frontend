import { initLocale, pageMetadata } from "@/components/layout/page";
import { StudyQuestionnairesScreen } from "@/features/researcher/components/study-screens";

export const generateMetadata = pageMetadata("researcherStudyQuestionnaires");

export default async function Route({
  params,
}: PageProps<"/[locale]/researcher/studies/[id]/questionnaires">) {
  await initLocale(params);
  const { id } = await params;
  return (
    <div className="mx-auto w-full max-w-5xl">
      <StudyQuestionnairesScreen studyId={id} />
    </div>
  );
}

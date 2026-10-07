import { initLocale, pageMetadata } from "@/components/layout/page";
import { StudyManage } from "@/features/researcher/components/study-manage";

export const generateMetadata = pageMetadata("researcherStudyDetail");

export default async function Route({ params }: PageProps<"/[locale]/researcher/studies/[id]">) {
  await initLocale(params);
  const { id } = await params;
  return (
    <div className="mx-auto w-full max-w-5xl">
      <StudyManage studyId={id} />
    </div>
  );
}

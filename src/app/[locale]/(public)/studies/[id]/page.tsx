import { initLocale, pageMetadata } from "@/components/layout/page";
import { StudyDetail } from "@/features/studies/components/study-detail";

export const generateMetadata = pageMetadata("studyDetail");

export default async function StudyDetailPage({ params }: PageProps<"/[locale]/studies/[id]">) {
  await initLocale(params);
  const { id } = await params;
  return (
    <div className="mx-auto w-full max-w-5xl">
      <StudyDetail id={id} />
    </div>
  );
}

import { initLocale, Page, pageMetadata } from "@/components/layout/page";
import { NewStudy } from "@/features/researcher/components/new-study";

export const generateMetadata = pageMetadata("researcherStudyNew");

export default async function Route({ params }: PageProps<"/[locale]/researcher/studies/new">) {
  await initLocale(params);
  return (
    <Page pageKey="researcherStudyNew" width="max-w-3xl">
      <NewStudy />
    </Page>
  );
}

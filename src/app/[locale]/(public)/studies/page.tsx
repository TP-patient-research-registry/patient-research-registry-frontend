import { initLocale, Page, pageMetadata } from "@/components/layout/page";
import { PublicStudyList } from "@/features/studies/components/public-study-list";

export const generateMetadata = pageMetadata("studies");

export default async function StudiesPage({ params }: PageProps<"/[locale]/studies">) {
  await initLocale(params);
  return (
    <Page pageKey="studies">
      <PublicStudyList />
    </Page>
  );
}

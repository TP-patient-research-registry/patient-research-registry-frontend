import { initLocale, Page, pageMetadata } from "@/components/layout/page";
import { ResearcherDashboard } from "@/features/researcher/components/researcher-dashboard";

export const generateMetadata = pageMetadata("researcherDashboard");

export default async function Route({ params }: PageProps<"/[locale]/researcher/dashboard">) {
  await initLocale(params);
  return (
    <Page pageKey="researcherDashboard" width="max-w-5xl">
      <ResearcherDashboard />
    </Page>
  );
}
